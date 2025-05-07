
import React, { useState } from "react";
import { useTimeRecords } from "@/context/TimeRecordsContext";
import { useAuth } from "@/context/AuthContext";
import { TimeRecord } from "@/types";
import { Button } from "@/components/ui/button";
import { Edit, Eye } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

const TimeRecordsTable: React.FC = () => {
  const { currentUser } = useAuth();
  const { getUserRecords, createChangeRequest } = useTimeRecords();
  const [selectedRecord, setSelectedRecord] = useState<TimeRecord | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [suggestedCheckIn, setSuggestedCheckIn] = useState("");
  const [suggestedCheckOut, setSuggestedCheckOut] = useState<string | null>(null);
  const [reason, setReason] = useState("");
  
  if (!currentUser) return null;
  
  const records = getUserRecords(currentUser.id);
  
  const handleViewRecord = (record: TimeRecord) => {
    setSelectedRecord(record);
    setIsViewDialogOpen(true);
  };
  
  const handleEditRecord = (record: TimeRecord) => {
    setSelectedRecord(record);
    setSuggestedCheckIn(record.checkIn);
    setSuggestedCheckOut(record.checkOut || "");
    setReason("");
    setIsEditDialogOpen(true);
  };
  
  const handleSubmitChange = () => {
    if (!currentUser || !selectedRecord || !reason) return;
    
    createChangeRequest(
      selectedRecord.id,
      currentUser.id,
      currentUser.name,
      suggestedCheckIn,
      suggestedCheckOut || null,
      reason
    );
    
    setIsEditDialogOpen(false);
  };
  
  const canEditRecord = (record: TimeRecord) => {
    // Only allow editing records that have both check in and check out times
    return record.checkOut !== null;
  };

  // Group records by date for better display
  const recordsByDate: Record<string, TimeRecord[]> = {};
  records.forEach(record => {
    if (!recordsByDate[record.date]) {
      recordsByDate[record.date] = [];
    }
    recordsByDate[record.date].push(record);
  });
  
  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Data</TableHead>
              <TableHead>Entrada</TableHead>
              <TableHead>Saída</TableHead>
              <TableHead>Observações</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {records.length > 0 ? (
              records.map((record) => (
                <TableRow key={record.id}>
                  <TableCell>{formatDate(record.date)}</TableCell>
                  <TableCell>{record.checkIn}</TableCell>
                  <TableCell>{record.checkOut || "—"}</TableCell>
                  <TableCell className="max-w-[200px] truncate">{record.notes || "—"}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleViewRecord(record)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      disabled={!canEditRecord(record)}
                      onClick={() => handleEditRecord(record)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  Nenhum registro encontrado
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      
      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Detalhes do Registro</DialogTitle>
            <DialogDescription>
              {selectedRecord && formatDate(selectedRecord.date)}
            </DialogDescription>
          </DialogHeader>
          {selectedRecord && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="checkIn">Entrada</Label>
                  <Input
                    id="checkIn"
                    value={selectedRecord.checkIn}
                    readOnly
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="checkOut">Saída</Label>
                  <Input
                    id="checkOut"
                    value={selectedRecord.checkOut || ""}
                    readOnly
                    className="mt-1"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="notes">Observações</Label>
                <Textarea
                  id="notes"
                  value={selectedRecord.notes || ""}
                  readOnly
                  className="mt-1"
                />
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      
      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Solicitar alteração de registro</DialogTitle>
            <DialogDescription>
              {selectedRecord && formatDate(selectedRecord.date)}
            </DialogDescription>
          </DialogHeader>
          {selectedRecord && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="originalCheckIn">Entrada Original</Label>
                  <Input
                    id="originalCheckIn"
                    value={selectedRecord.checkIn}
                    readOnly
                    className="mt-1 bg-muted"
                  />
                </div>
                <div>
                  <Label htmlFor="originalCheckOut">Saída Original</Label>
                  <Input
                    id="originalCheckOut"
                    value={selectedRecord.checkOut || ""}
                    readOnly
                    className="mt-1 bg-muted"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="suggestedCheckIn">Nova Entrada</Label>
                  <Input
                    id="suggestedCheckIn"
                    type="time"
                    value={suggestedCheckIn}
                    onChange={(e) => setSuggestedCheckIn(e.target.value)}
                    className="mt-1"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="suggestedCheckOut">Nova Saída</Label>
                  <Input
                    id="suggestedCheckOut"
                    type="time"
                    value={suggestedCheckOut || ""}
                    onChange={(e) => setSuggestedCheckOut(e.target.value)}
                    className="mt-1"
                    required
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="reason">Justificativa</Label>
                <Textarea
                  id="reason"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Explique o motivo da alteração"
                  className="mt-1"
                  required
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button type="button" onClick={handleSubmitChange} disabled={!reason}>
              Enviar solicitação
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default TimeRecordsTable;
