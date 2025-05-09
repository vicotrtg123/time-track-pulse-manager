
import React, { useState, useEffect } from "react";
import AppLayout from "@/components/layout/AppLayout";
import EmployeesTable from "@/components/employees/EmployeesTable";
import AddEmployeeDialog from "@/components/employees/AddEmployeeDialog";
import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";
import { authService } from "@/services";
import { User } from "@/types";
import { toast } from "sonner";

const Employees: React.FC = () => {
  const [isAddEmployeeOpen, setIsAddEmployeeOpen] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const fetchedUsers = await authService.getAllUsers();
      setUsers(fetchedUsers);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Erro ao carregar usuários.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDeleteUser = async (userId: string) => {
    try {
      await authService.disableUser(userId);
      toast.success("Usuário desativado com sucesso!");
      // Refresh the users list after deletion
      fetchUsers();
    } catch (error) {
      console.error("Error disabling user:", error);
      toast.error("Erro ao desativar usuário.");
      throw error; // Re-throw to handle in the component
    }
  };

  const handleEmployeeAdded = (newEmployee: User) => {
    setUsers(prevUsers => [...prevUsers, newEmployee]);
  };

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
        
        <EmployeesTable 
          users={users}
          onDelete={handleDeleteUser}
          isLoading={isLoading}
        />
        <AddEmployeeDialog 
          open={isAddEmployeeOpen} 
          onOpenChange={setIsAddEmployeeOpen}
          onEmployeeAdded={handleEmployeeAdded}
        />
      </div>
    </AppLayout>
  );
};

export default Employees;
