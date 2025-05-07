
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, LogIn, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTimeRecords } from "@/context/TimeRecordsContext";
import { useAuth } from "@/context/AuthContext";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { TimeRecord } from "@/types";

const TimeClockCard: React.FC = () => {
  const { currentUser } = useAuth();
  const { checkIn, checkOut, hasActiveCheckIn, getTodayRecords, getActiveRecord } = useTimeRecords();
  const [notes, setNotes] = useState("");
  const [isCheckInDialogOpen, setIsCheckInDialogOpen] = useState(false);
  const [isCheckOutDialogOpen, setIsCheckOutDialogOpen] = useState(false);
  
  if (!currentUser) return null;
  
  const hasActive = hasActiveCheckIn(currentUser.id);
  const activeRecord = hasActive ? getActiveRecord(currentUser.id) : null;
  const todayRecords = getTodayRecords(currentUser.id);
  
  const handleCheckIn = () => {
    checkIn(currentUser.id, notes);
    setNotes("");
    setIsCheckInDialogOpen(false);
  };
  
  const handleCheckOut = () => {
    if (activeRecord) {
      checkOut(currentUser.id, activeRecord.id, notes);
      setNotes("");
      setIsCheckOutDialogOpen(false);
    }
  };

  // Get the last record for display purposes
  const lastRecord: TimeRecord | null = todayRecords.length > 0 ? todayRecords[0] : null;
  
  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Clock className="mr-2 h-5 w-5 text-primary" />
          Registro de Ponto
        </CardTitle>
        <CardDescription>Registre sua entrada e saída do expediente</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col items-center p-4 bg-muted/50 rounded-md">
            <p className="text-sm font-medium mb-1 text-muted-foreground">Última Entrada</p>
            <p className="text-lg font-bold">{lastRecord ? lastRecord.checkIn : "—"}</p>
          </div>
          <div className="flex flex-col items-center p-4 bg-muted/50 rounded-md">
            <p className="text-sm font-medium mb-1 text-muted-foreground">Última Saída</p>
            <p className="text-lg font-bold">
              {lastRecord && lastRecord.checkOut ? lastRecord.checkOut : "—"}
            </p>
          </div>
        </div>

        {todayRecords.length > 0 && (
          <div className="mt-4">
            <p className="text-sm font-medium mb-2">Registros de hoje: {todayRecords.length}</p>
            <div className="text-sm text-muted-foreground">
              {hasActive && (
                <div className="flex items-center mb-1">
                  <span className="h-2 w-2 rounded-full bg-green-500 mr-2"></span>
                  <span>Registro ativo sem saída</span>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <Dialog open={isCheckInDialogOpen} onOpenChange={setIsCheckInDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              variant="outline" 
              className="flex-1 mr-2"
              disabled={hasActive}
            >
              <LogIn className="mr-2 h-4 w-4" /> Entrada
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Registrar Entrada</DialogTitle>
              <DialogDescription>
                Adicione uma observação se necessário.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div>
                <Label htmlFor="notes">Observação (opcional)</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Reunião, home office, etc."
                  className="mt-2"
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" onClick={handleCheckIn}>Confirmar Entrada</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        <Dialog open={isCheckOutDialogOpen} onOpenChange={setIsCheckOutDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              variant={hasActive ? "default" : "outline"} 
              className="flex-1 ml-2"
              disabled={!hasActive}
            >
              <LogOut className="mr-2 h-4 w-4" /> Saída
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Registrar Saída</DialogTitle>
              <DialogDescription>
                Adicione uma observação se necessário.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div>
                <Label htmlFor="checkout-notes">Observação (opcional)</Label>
                <Textarea
                  id="checkout-notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Adicione uma observação se necessário"
                  className="mt-2"
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" onClick={handleCheckOut}>Confirmar Saída</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardFooter>
    </Card>
  );
};

export default TimeClockCard;
