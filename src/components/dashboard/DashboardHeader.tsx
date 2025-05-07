
import React from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useAuth } from "@/context/AuthContext";
import { Badge } from "@/components/ui/badge";

const DashboardHeader: React.FC = () => {
  const { currentUser } = useAuth();
  const currentDate = new Date();

  const formattedDate = format(currentDate, "EEEE, dd 'de' MMMM 'de' yyyy", {
    locale: ptBR,
  });

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-3xl font-bold tracking-tight">
          Olá, {currentUser?.name.split(" ")[0]}
        </h1>
        <Badge variant={currentUser?.role === "admin" ? "default" : "outline"} className="text-xs capitalize">
          {currentUser?.role}
        </Badge>
      </div>
      <p className="text-muted-foreground capitalize">
        {formattedDate}
      </p>
    </div>
  );
};

export default DashboardHeader;
