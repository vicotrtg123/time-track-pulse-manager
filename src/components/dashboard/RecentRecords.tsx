
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTimeRecords } from "@/context/TimeRecordsContext";
import { useAuth } from "@/context/AuthContext";
import { formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";
import { Link } from "react-router-dom";

const RecentRecords: React.FC = () => {
  const { currentUser } = useAuth();
  const { getUserRecords } = useTimeRecords();
  
  if (!currentUser) return null;
  
  const records = getUserRecords(currentUser.id).slice(0, 4);
  
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
        {records.length > 0 ? (
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
