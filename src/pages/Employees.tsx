
import React, { useState } from "react";
import AppLayout from "@/components/layout/AppLayout";
import EmployeesTable from "@/components/employees/EmployeesTable";
import AddEmployeeDialog from "@/components/employees/AddEmployeeDialog";
import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";

const Employees: React.FC = () => {
  const [isAddEmployeeOpen, setIsAddEmployeeOpen] = useState(false);

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold tracking-tight mb-2">Funcionários</h1>
            <p className="text-muted-foreground">
              Visualize e gerencie os funcionários cadastrados no sistema.
            </p>
          </div>
          <Button onClick={() => setIsAddEmployeeOpen(true)} className="flex items-center gap-2">
            <UserPlus className="h-4 w-4" />
            Adicionar Funcionário
          </Button>
        </div>
        
        <EmployeesTable />
        <AddEmployeeDialog open={isAddEmployeeOpen} onOpenChange={setIsAddEmployeeOpen} />
      </div>
    </AppLayout>
  );
};

export default Employees;
