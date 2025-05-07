
import React from "react";
import { users } from "@/lib/mock-data";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/context/AuthContext";
import { Alert, AlertDescription } from "@/components/ui/alert";

const EmployeesTable: React.FC = () => {
  const { currentUser } = useAuth();
  
  if (!currentUser || currentUser.role !== "admin") {
    return (
      <Alert>
        <AlertDescription>
          Você não tem permissão para acessar esta página.
        </AlertDescription>
      </Alert>
    );
  }

  // Filter out the current user
  const employees = users.filter(user => user.id !== currentUser.id);
  
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
        </TableBody>
      </Table>
    </div>
  );
};

export default EmployeesTable;
