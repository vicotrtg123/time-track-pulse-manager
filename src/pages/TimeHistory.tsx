
import React, { useState, useEffect } from "react";
import AppLayout from "@/components/layout/AppLayout";
import { TimeRecord, User } from "@/types";
import { timeRecordService, authService } from "@/services/api";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Calendar as CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";

const TimeHistory: React.FC = () => {
  const [startDate, setStartDate] = useState<Date | undefined>(new Date());
  const [endDate, setEndDate] = useState<Date | undefined>(new Date());
  const [selectedUserId, setSelectedUserId] = useState<string | "all">("all");
  const [users, setUsers] = useState<User[]>([]);
  const [records, setRecords] = useState<TimeRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Load users for the select dropdown
  useEffect(() => {
    const loadUsers = async () => {
      try {
        const fetchedUsers = await authService.getAllUsers();
        setUsers(fetchedUsers);
      } catch (error) {
        console.error("Error loading users:", error);
        toast.error("Erro ao carregar lista de usuários");
      }
    };
    
    loadUsers();
  }, []);
  
  // Load time records based on filters
  const loadTimeRecords = async () => {
    if (!startDate || !endDate) {
      toast.error("Selecione datas de início e fim válidas");
      return;
    }
    
    setIsLoading(true);
    try {
      const formattedStartDate = format(startDate, "yyyy-MM-dd");
      const formattedEndDate = format(endDate, "yyyy-MM-dd");
      
      let fetchedRecords;
      if (selectedUserId === "all") {
        fetchedRecords = await timeRecordService.getAllRecordsBetweenDates(formattedStartDate, formattedEndDate);
      } else {
        fetchedRecords = await timeRecordService.getUserRecordsBetweenDates(selectedUserId, formattedStartDate, formattedEndDate);
      }
      
      setRecords(fetchedRecords);
    } catch (error) {
      console.error("Error loading time records:", error);
      toast.error("Erro ao carregar registros de ponto");
    } finally {
      setIsLoading(false);
    }
  };
  
  // Load records when page loads
  useEffect(() => {
    if (startDate && endDate) {
      loadTimeRecords();
    }
  }, []);
  
  // Format duration between check-in and check-out
  const formatDuration = (checkIn: string, checkOut: string | null) => {
    if (!checkOut) return "—";
    
    const [inHours, inMinutes] = checkIn.split(":").map(Number);
    const [outHours, outMinutes] = checkOut.split(":").map(Number);
    
    const totalInMinutes = inHours * 60 + inMinutes;
    const totalOutMinutes = outHours * 60 + outMinutes;
    const diffMinutes = totalOutMinutes - totalInMinutes;
    
    if (diffMinutes < 0) return "Inválido";
    
    const hours = Math.floor(diffMinutes / 60);
    const minutes = diffMinutes % 60;
    
    return `${hours}h ${minutes}m`;
  };
  
  // Get employee name from ID
  const getEmployeeName = (userId: string) => {
    const user = users.find(u => u.id === userId);
    return user ? user.name : "Funcionário não encontrado";
  };
  
  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight mb-2">Histórico de Pontos</h1>
          <p className="text-muted-foreground">
            Visualize o histórico de pontos de todos os funcionários.
          </p>
        </div>
        
        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="start-date">Data Inicial</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="start-date"
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !startDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {startDate ? format(startDate, "PPP", { locale: ptBR }) : <span>Selecione uma data</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={startDate}
                  onSelect={setStartDate}
                  initialFocus
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="end-date">Data Final</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="end-date"
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !endDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {endDate ? format(endDate, "PPP", { locale: ptBR }) : <span>Selecione uma data</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={endDate}
                  onSelect={setEndDate}
                  initialFocus
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="employee">Funcionário</Label>
            <Select value={selectedUserId} onValueChange={setSelectedUserId}>
              <SelectTrigger id="employee">
                <SelectValue placeholder="Selecione um funcionário" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                {users.map(user => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <Button onClick={loadTimeRecords} disabled={isLoading} className="w-full md:w-auto">
          {isLoading ? (
            <span className="flex items-center">
              <span className="animate-spin mr-2 h-4 w-4 border-2 border-b-transparent border-white rounded-full"></span>
              Carregando...
            </span>
          ) : "Filtrar"}
        </Button>
        
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Funcionário</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Entrada</TableHead>
                  <TableHead>Saída</TableHead>
                  <TableHead>Horas</TableHead>
                  <TableHead>Observações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {records.length > 0 ? (
                  records.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell>{getEmployeeName(record.userId)}</TableCell>
                      <TableCell>{format(new Date(record.date), "dd/MM/yyyy")}</TableCell>
                      <TableCell>{record.checkIn}</TableCell>
                      <TableCell>{record.checkOut || "—"}</TableCell>
                      <TableCell>{formatDuration(record.checkIn, record.checkOut)}</TableCell>
                      <TableCell className="max-w-[200px] truncate">{record.notes || "—"}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      Nenhum registro encontrado
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default TimeHistory;
