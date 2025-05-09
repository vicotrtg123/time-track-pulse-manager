import React, { useState, useEffect } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/context/AuthContext";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { authService } from "@/services";
import { User } from "@/types";
import { Button } from "@/components/ui/button";
import { UserMinus } from "lucide-react";

interface EmployeesTableProps {
  users: User[];
  onDelete: (userId: string) => Promise<void>;
  isLoading: boolean;
}

const EmployeesTable: React.FC<EmployeesTableProps> = ({ users, onDelete, isLoading }) => {
  const { currentUser, refreshUser } = useAuth();
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  
  useEffect(() => {
    if (deleteError) {
      const timer = setTimeout(() => {
        setDeleteError(null);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [deleteError]);
  
  const handleDelete = async (userId: string) => {
    setIsDeleting(true);
    setDeleteError(null);
    
    try {
      if (currentUser?.id === userId) {
        setDeleteError("Você não pode excluir sua própria conta.");
        return;
      }
      
      await onDelete(userId);
      await refreshUser();
    } catch (error: any) {
      console.error("Error deleting user:", error);
      setDeleteError("Erro ao excluir usuário. Tente novamente.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      {deleteError && (
        <Alert variant="destructive">
          <AlertDescription>{deleteError}</AlertDescription>
        </Alert>
      )}
      
      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Funcionário</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Role</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center font-medium">
                      <Avatar className="mr-2 h-8 w-8">
                        <AvatarImage src={user.avatar} />
                        <AvatarFallback>{user.name.charAt(0).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      {user.name}
                    </div>
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Badge variant={user.active ? "default" : "secondary"}>
                      {user.active ? "Ativo" : "Inativo"}
                    </Badge>
                  </TableCell>
                  <TableCell className="capitalize">{user.role}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(user.id)}
                      disabled={isDeleting}
                    >
                      <UserMinus className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </>
  );
};

export default EmployeesTable;
