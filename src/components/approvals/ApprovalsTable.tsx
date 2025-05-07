
import React from "react";
import { useTimeRecords } from "@/context/TimeRecordsContext";
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ChangeRequest } from "@/types";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import { Alert, AlertDescription } from "@/components/ui/alert";

const ApprovalsTable: React.FC = () => {
  const { currentUser } = useAuth();
  const { getPendingChangeRequests, approveChangeRequest, rejectChangeRequest } = useTimeRecords();
  const [selectedRequest, setSelectedRequest] = useState<ChangeRequest | null>(null);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);

  if (!currentUser || currentUser.role !== "admin") {
    return (
      <Alert>
        <AlertDescription>
          Você não tem permissão para acessar esta página.
        </AlertDescription>
      </Alert>
    );
  }
  
  const pendingRequests = getPendingChangeRequests();

  const handleApprove = (requestId: string) => {
    approveChangeRequest(requestId);
  };

  const handleReject = (requestId: string) => {
    rejectChangeRequest(requestId);
  };

  const handleViewDetails = (request: ChangeRequest) => {
    setSelectedRequest(request);
    setIsDetailsDialogOpen(true);
  };

  if (pendingRequests.length === 0) {
    return (
      <Card className="bg-muted/50">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <ClipboardEmptyIcon className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">Nenhuma solicitação pendente</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Todas as solicitações de alteração foram processadas.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Funcionário</TableHead>
              <TableHead>Data</TableHead>
              <TableHead>Alteração</TableHead>
              <TableHead>Justificativa</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pendingRequests.map((request) => (
              <TableRow key={request.id}>
                <TableCell>{request.userName}</TableCell>
                <TableCell>{formatDate(request.date)}</TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <div className="flex items-center">
                      <Badge variant="outline" className="mr-2">
                        Entrada
                      </Badge>
                      <span className="text-muted-foreground">
                        {request.originalCheckIn} →
                      </span>
                      <span className="font-medium ml-1">{request.suggestedCheckIn}</span>
                    </div>
                    {request.originalCheckOut && (
                      <div className="flex items-center mt-1">
                        <Badge variant="outline" className="mr-2">
                          Saída
                        </Badge>
                        <span className="text-muted-foreground">
                          {request.originalCheckOut} →
                        </span>
                        <span className="font-medium ml-1">{request.suggestedCheckOut}</span>
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell className="max-w-[200px]">
                  <div className="truncate">{request.reason}</div>
                </TableCell>
                <TableCell className="space-x-1 text-right">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleViewDetails(request)}
                  >
                    Detalhes
                  </Button>
                  <Button
                    variant="default"
                    size="sm"
                    className="bg-success hover:bg-success/90 text-white"
                    onClick={() => handleApprove(request.id)}
                  >
                    <Check className="h-4 w-4 mr-1" /> Aprovar
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleReject(request.id)}
                  >
                    <X className="h-4 w-4 mr-1" /> Rejeitar
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Details Dialog */}
      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Detalhes da solicitação</DialogTitle>
            <DialogDescription>
              Solicitado por {selectedRequest?.userName} em {selectedRequest && formatDate(selectedRequest.date)}
            </DialogDescription>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-6 py-4">
              <div className="space-y-1">
                <h4 className="text-sm font-medium">Registro Original</h4>
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-muted p-2 rounded-md">
                    <span className="text-xs text-muted-foreground">Entrada:</span>
                    <div className="font-medium">{selectedRequest.originalCheckIn}</div>
                  </div>
                  <div className="bg-muted p-2 rounded-md">
                    <span className="text-xs text-muted-foreground">Saída:</span>
                    <div className="font-medium">{selectedRequest.originalCheckOut || "—"}</div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-1">
                <h4 className="text-sm font-medium">Solicitação de Alteração</h4>
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-primary/5 border border-primary/10 p-2 rounded-md">
                    <span className="text-xs text-muted-foreground">Nova entrada:</span>
                    <div className="font-medium">{selectedRequest.suggestedCheckIn}</div>
                  </div>
                  <div className="bg-primary/5 border border-primary/10 p-2 rounded-md">
                    <span className="text-xs text-muted-foreground">Nova saída:</span>
                    <div className="font-medium">{selectedRequest.suggestedCheckOut || "—"}</div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-1">
                <h4 className="text-sm font-medium">Justificativa</h4>
                <div className="bg-muted p-3 rounded-md">
                  <p>{selectedRequest.reason}</p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter className="space-x-2">
            <Button
              variant="outline" 
              onClick={() => setIsDetailsDialogOpen(false)}
            >
              Fechar
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (selectedRequest) {
                  rejectChangeRequest(selectedRequest.id);
                  setIsDetailsDialogOpen(false);
                }
              }}
            >
              <X className="h-4 w-4 mr-1" /> Rejeitar
            </Button>
            <Button
              className="bg-success hover:bg-success/90 text-white"
              onClick={() => {
                if (selectedRequest) {
                  approveChangeRequest(selectedRequest.id);
                  setIsDetailsDialogOpen(false);
                }
              }}
            >
              <Check className="h-4 w-4 mr-1" /> Aprovar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

// Simple icon for empty state
const ClipboardEmptyIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
    <path d="M12 11h4" />
    <path d="M12 16h4" />
    <path d="M8 11h.01" />
    <path d="M8 16h.01" />
  </svg>
);

export default ApprovalsTable;
