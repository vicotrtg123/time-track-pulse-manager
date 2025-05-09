
import React, { useState, useEffect } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";
import { format } from "date-fns";
import { changeRequestService } from "@/services";
import { ChangeRequest } from "@/types";
import { toast } from "sonner";

const ApprovalsTable: React.FC = () => {
  const [pendingRequests, setPendingRequests] = useState<ChangeRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingIds, setProcessingIds] = useState<string[]>([]);

  const fetchPendingRequests = async () => {
    setIsLoading(true);
    try {
      const requests = await changeRequestService.getPendingRequests();
      setPendingRequests(requests);
    } catch (error) {
      console.error("Error fetching pending requests:", error);
      toast.error("Erro ao carregar solicitações pendentes");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingRequests();
  }, []);

  const handleApprove = async (requestId: string) => {
    setProcessingIds(prev => [...prev, requestId]);
    try {
      const success = await changeRequestService.approveChangeRequest(requestId);
      if (success) {
        toast.success("Solicitação aprovada com sucesso");
        // Remove the approved request from the list
        setPendingRequests(prev => prev.filter(req => req.id !== requestId));
      } else {
        toast.error("Erro ao aprovar solicitação");
      }
    } catch (error) {
      console.error("Error approving request:", error);
      toast.error("Erro ao aprovar solicitação");
    } finally {
      setProcessingIds(prev => prev.filter(id => id !== requestId));
    }
  };

  const handleReject = async (requestId: string) => {
    setProcessingIds(prev => [...prev, requestId]);
    try {
      const success = await changeRequestService.rejectChangeRequest(requestId);
      if (success) {
        toast.success("Solicitação rejeitada com sucesso");
        // Remove the rejected request from the list
        setPendingRequests(prev => prev.filter(req => req.id !== requestId));
      } else {
        toast.error("Erro ao rejeitar solicitação");
      }
    } catch (error) {
      console.error("Error rejecting request:", error);
      toast.error("Erro ao rejeitar solicitação");
    } finally {
      setProcessingIds(prev => prev.filter(id => id !== requestId));
    }
  };

  const formatTime = (timeString: string) => {
    return timeString || "--:--";
  };

  const formatDate = (dateString: string) => {
    try {
      // Parse date string format (assuming YYYY-MM-DD)
      const date = new Date(dateString);
      return format(date, "dd/MM/yyyy");
    } catch {
      return dateString;
    }
  };

  return (
    <div className="space-y-4">
      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : pendingRequests.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Não há solicitações pendentes.</p>
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Funcionário</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Ponto Original</TableHead>
                <TableHead>Solicitação</TableHead>
                <TableHead>Justificativa</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pendingRequests.map((request) => (
                <TableRow key={request.id}>
                  <TableCell>
                    <div className="flex items-center font-medium">
                      <Avatar className="mr-2 h-8 w-8">
                        <AvatarFallback>{request.userName.charAt(0).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      {request.userName}
                    </div>
                  </TableCell>
                  <TableCell>{formatDate(request.date)}</TableCell>
                  <TableCell>
                    <div>
                      <Badge variant="outline">Entrada: {formatTime(request.originalCheckIn)}</Badge>
                      {request.originalCheckOut && (
                        <Badge variant="outline" className="ml-2">Saída: {formatTime(request.originalCheckOut)}</Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <Badge>Entrada: {formatTime(request.suggestedCheckIn)}</Badge>
                      {request.suggestedCheckOut && (
                        <Badge className="ml-2">Saída: {formatTime(request.suggestedCheckOut)}</Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="max-w-[200px]">
                    <p className="truncate" title={request.reason}>
                      {request.reason}
                    </p>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 text-green-600"
                        onClick={() => handleApprove(request.id)}
                        disabled={processingIds.includes(request.id)}
                      >
                        <Check className="h-4 w-4 mr-1" />
                        Aprovar
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 text-red-600"
                        onClick={() => handleReject(request.id)}
                        disabled={processingIds.includes(request.id)}
                      >
                        <X className="h-4 w-4 mr-1" />
                        Rejeitar
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default ApprovalsTable;
