
import React from "react";
import AppLayout from "@/components/layout/AppLayout";
import TimeRecordsTable from "@/components/time-records/TimeRecordsTable";

const TimeRecords: React.FC = () => {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight mb-2">Meus Registros de Ponto</h1>
          <p className="text-muted-foreground">
            Visualize e gerencie seus registros de ponto.
          </p>
        </div>
        
        <TimeRecordsTable />
      </div>
    </AppLayout>
  );
};

export default TimeRecords;
