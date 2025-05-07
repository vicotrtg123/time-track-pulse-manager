
import React from "react";
import AppLayout from "@/components/layout/AppLayout";
import EmployeesTable from "@/components/employees/EmployeesTable";

const Employees: React.FC = () => {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight mb-2">Funcionários</h1>
          <p className="text-muted-foreground">
            Visualize a lista de funcionários cadastrados no sistema.
          </p>
        </div>
        
        <EmployeesTable />
      </div>
    </AppLayout>
  );
};

export default Employees;
