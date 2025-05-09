
import React, { useEffect, useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useAuth } from "@/context/AuthContext";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";

const DashboardHeader: React.FC = () => {
  const { currentUser } = useAuth();
  const [userName, setUserName] = useState<string>("");
  const currentDate = new Date();

  const formattedDate = format(currentDate, "EEEE, dd 'de' MMMM 'de' yyyy", {
    locale: ptBR,
  });
  
  useEffect(() => {
    if (currentUser) {
      // Set the user name from the current user
      setUserName(currentUser.name);
      
      // Double-check with Supabase to ensure we have the most up-to-date name
      const fetchUserName = async () => {
        if (currentUser.id) {
          try {
            const { data: profileData, error } = await supabase
              .from('profiles')
              .select('name')
              .eq('id', currentUser.id)
              .maybeSingle();
              
            if (!error && profileData && profileData.name) {
              setUserName(profileData.name);
            }
          } catch (err) {
            console.error("Error fetching user name:", err);
          }
        }
      };
      
      fetchUserName();
    }
  }, [currentUser]);

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-3xl font-bold tracking-tight">
          Olá, {userName ? userName.split(" ")[0] : currentUser?.name?.split(" ")[0] || 'Usuário'}
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
