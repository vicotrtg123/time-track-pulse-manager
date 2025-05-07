
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, LogIn, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTimeRecords } from "@/context/TimeRecordsContext";
import { useAuth } from "@/context/AuthContext";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

const TimeClockCard: React.FC = () => {
  const { currentUser } = useAuth();
  const { checkIn, checkOut, hasCheckedInToday, hasCheckedOutToday, getTodayRecord } = useTimeRecords();
  const [notes, setNotes] = useState("");
  const [isCheckInDialogOpen, setIsCheckInDialogOpen] = useState(false);
  const [isCheckOutDialogOpen, setIsCheckOutDialogOpen] = useState(false);
  
  if (!currentUser) return null;
  
  const hasCheckedIn = hasCheckedInToday(currentUser.id);
  const hasCheckedOut = hasCheckedOutToday(currentUser.id);
  const todayRecord = getTodayRecord(currentUser.id);
  
  const handleCheckIn = () => {
    checkIn(currentUser.id, notes);
    setNotes("");
    setIsCheckInDialogOpen(false);
  };
  
  const handleCheckOut = () => {
    if (todayRecord) {
      checkOut(currentUser.id, todayRecord.id, notes);
      setNotes("");
      setIsCheckOutDialogOpen(false);
    }
  };
  
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
            <p className="text-sm font-medium mb-1 text-muted-foreground">Entrada</p>
            <p className="text-lg font-bold">{hasCheckedIn ? todayRecord?.checkIn : "—"}</p>
          </div>
          <div className="flex flex-col items-center p-4 bg-muted/50 rounded-md">
            <p className="text-sm font-medium mb-1 text-muted-foreground">Saída</p>
            <p className="text-lg font-bold">{hasCheckedOut ? todayRecord?.checkOut : "—"}</p>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Dialog open={isCheckInDialogOpen} onOpenChange={setIsCheckInDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              variant="outline" 
              className="flex-1 mr-2"
              disabled={hasCheckedIn}
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
              variant={hasCheckedIn && !hasCheckedOut ? "default" : "outline"} 
              className="flex-1 ml-2"
              disabled={!hasCheckedIn || hasCheckedOut}
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
