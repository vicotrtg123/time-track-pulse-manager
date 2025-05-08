
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTimeRecords } from "@/context/TimeRecordsContext";
import { formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ClipboardList } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Badge } from "@/components/ui/badge";
import { ChangeRequest } from "@/types";

const PendingRequestsCard: React.FC = () => {
  const { currentUser } = useAuth();
  const { getPendingChangeRequests } = useTimeRecords();
  const [pendingRequests, setPendingRequests] = useState<ChangeRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const loadRequests = async () => {
      if (currentUser && currentUser.role === 'admin') {
        setIsLoading(true);
        try {
          const requests = await getPendingChangeRequests();
          setPendingRequests(requests.slice(0, 3)); // Only get 3 most recent requests
        } catch (error) {
          console.error("Error loading pending requests:", error);
        } finally {
          setIsLoading(false);
        }
      }
    };
    
    loadRequests();
  }, [currentUser, getPendingChangeRequests]);
  
  if (!currentUser || currentUser.role !== "admin") return null;
  
  return (
    <Card className="shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="flex items-center gap-2">
          <CardTitle className="text-lg font-medium">Aprovações Pendentes</CardTitle>
          {pendingRequests.length > 0 && (
            <Badge variant="destructive" className="h-5">
              {pendingRequests.length}
            </Badge>
          )}
        </div>
        <Link to="/approvals">
          <Button variant="ghost" size="sm" className="h-8 gap-1">
            <ClipboardList className="h-4 w-4" />
            <span>Ver Todas</span>
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-6">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : pendingRequests.length > 0 ? (
          <div className="space-y-4">
            {pendingRequests.map((request) => (
              <div key={request.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-2 gap-2">
                <div>
                  <p className="font-medium">{request.userName}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(request.date)}
                  </p>
                </div>
                <Link to="/approvals">
                  <Button size="sm" variant="outline">Revisar</Button>
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center text-muted-foreground">
            <p>Nenhuma solicitação pendente</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PendingRequestsCard;
