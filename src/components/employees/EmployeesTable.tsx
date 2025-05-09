
import React, { useState, useEffect } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/context/AuthContext";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { authService } from "@/services";
import { User } from "@/types";
import { Button } from "@/components/ui/button";
import { UserMinus } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

const EmployeesTable: React.FC = () => {
  const { currentUser } = useAuth();
  const [employees, setEmployees] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userToDisable, setUserToDisable] = useState<User | null>(null);
  
  const loadEmployees = async () => {
    if (currentUser && currentUser.role === 'admin') {
      setIsLoading(true);
      try {
        const allUsers = await authService.getAllUsers();
        // Filter out the current user
        setEmployees(allUsers.filter(user => user.id !== currentUser.id));
      } catch (error) {
        console.error("Error loading employees:", error);
        toast.error("Erro ao carregar funcionários");
      } finally {
        setIsLoading(false);
      }
    }
  };
  
  useEffect(() => {
    loadEmployees();
  }, [currentUser]);
  
  const handleDisableUser = async () => {
    if (!userToDisable) return;
    
    try {
      await authService.disableUser(userToDisable.id);
      toast.success(`Funcionário ${userToDisable.name} desativado com sucesso`);
      loadEmployees(); // Reload the employees list
      setUserToDisable(null);
    } catch (error) {
      console.error("Error disabling user:", error);
      toast.error("Erro ao desativar funcionário");
    }
  };
  
  if (!currentUser || currentUser.role !== "admin") {
    return (
      <Alert>
        <AlertDescription>
          Você não tem permissão para acessar esta página.
        </AlertDescription>
      </Alert>
    );
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Funcionário</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Função</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {employees.map((employee) => (
              <TableRow key={employee.id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={employee.avatar} alt={employee.name} />
                      <AvatarFallback>{employee.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <span>{employee.name}</span>
                  </div>
                </TableCell>
                <TableCell>{employee.email}</TableCell>
                <TableCell>
                  <Badge variant={employee.role === "admin" ? "default" : "outline"} className="capitalize">
                    {employee.role}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={employee.active ? "outline" : "destructive"}>
                    {employee.active ? "Ativo" : "Inativo"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  {employee.active && (
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => setUserToDisable(employee)}
                      className="text-destructive hover:text-destructive/80 hover:bg-destructive/10"
                    >
                      <UserMinus className="h-4 w-4" />
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
            {employees.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  Nenhum funcionário encontrado
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      
      <AlertDialog open={!!userToDisable} onOpenChange={(open) => !open && setUserToDisable(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Desativar Funcionário</AlertDialogTitle>
            <AlertDialogDescription>
              {userToDisable && `Tem certeza que deseja desativar o funcionário ${userToDisable.name}?`}
              <br />
              Esta ação pode ser revertida posteriormente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDisableUser} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Desativar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default EmployeesTable;
