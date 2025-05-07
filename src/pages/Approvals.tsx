
import React from "react";
import AppLayout from "@/components/layout/AppLayout";
import ApprovalsTable from "@/components/approvals/ApprovalsTable";

const Approvals: React.FC = () => {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight mb-2">Solicitações de Alteração</h1>
          <p className="text-muted-foreground">
            Gerencie as solicitações de alteração de ponto dos funcionários.
          </p>
        </div>
        
        <ApprovalsTable />
      </div>
    </AppLayout>
  );
};

export default Approvals;
