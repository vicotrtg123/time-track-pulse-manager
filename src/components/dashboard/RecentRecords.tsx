
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTimeRecords } from "@/context/TimeRecordsContext";
import { useAuth } from "@/context/AuthContext";
import { formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";
import { Link } from "react-router-dom";
import { TimeRecord } from "@/types";

const RecentRecords: React.FC = () => {
  const { currentUser } = useAuth();
  const { getUserRecords } = useTimeRecords();
  const [records, setRecords] = useState<TimeRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const loadRecords = async () => {
      if (currentUser) {
        setIsLoading(true);
        try {
          const userRecords = await getUserRecords(currentUser.id);
          setRecords(userRecords.slice(0, 4)); // Only get 4 most recent records
        } catch (error) {
          console.error("Error loading recent records:", error);
        } finally {
          setIsLoading(false);
        }
      }
    };
    
    loadRecords();
  }, [currentUser, getUserRecords]);
  
  if (!currentUser) return null;
  
  return (
    <Card className="shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-medium">Registros Recentes</CardTitle>
        <Link to="/time-records">
          <Button variant="ghost" size="sm" className="h-8 gap-1">
            <Calendar className="h-4 w-4" />
            <span>Ver Todos</span>
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-6">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : records.length > 0 ? (
          <div className="space-y-4">
            {records.map((record) => (
              <div key={record.id} className="flex items-center justify-between py-2">
                <div>
                  <p className="font-medium">{formatDate(record.date)}</p>
                  <p className="text-sm text-muted-foreground">
                    {record.notes || "Sem observações"}
                  </p>
                </div>
                <div className="text-right">
                  <div className="flex items-center">
                    <span className="font-medium text-sm">{record.checkIn}</span>
                    <span className="mx-2 text-muted-foreground">→</span>
                    <span className="font-medium text-sm">
                      {record.checkOut || "—"}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center text-muted-foreground">
            <p>Nenhum registro encontrado</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RecentRecords;
