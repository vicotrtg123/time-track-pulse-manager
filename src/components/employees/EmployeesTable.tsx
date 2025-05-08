
import React, { useState, useEffect } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/context/AuthContext";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { authService } from "@/services/api";
import { User } from "@/types";

const EmployeesTable: React.FC = () => {
  const { currentUser } = useAuth();
  const [employees, setEmployees] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const loadEmployees = async () => {
      if (currentUser && currentUser.role === 'admin') {
        setIsLoading(true);
        try {
          const allUsers = await authService.getAllUsers();
          // Filter out the current user
          setEmployees(allUsers.filter(user => user.id !== currentUser.id));
        } catch (error) {
          console.error("Error loading employees:", error);
        } finally {
          setIsLoading(false);
        }
      }
    };
    
    loadEmployees();
  }, [currentUser]);
  
  if (!currentUser || currentUser.role !== "admin") {
    return (
      <Alert>
        <AlertDescription>
          Você não tem permissão para acessar esta página.
        </AlertDescription>
      </Alert>
    );
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Funcionário</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Função</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {employees.map((employee) => (
            <TableRow key={employee.id}>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={employee.avatar} alt={employee.name} />
                    <AvatarFallback>{employee.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <span>{employee.name}</span>
                </div>
              </TableCell>
              <TableCell>{employee.email}</TableCell>
              <TableCell>
                <Badge variant={employee.role === "admin" ? "default" : "outline"} className="capitalize">
                  {employee.role}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
          {employees.length === 0 && (
            <TableRow>
              <TableCell colSpan={3} className="text-center py-8">
                Nenhum funcionário encontrado
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default EmployeesTable;
