
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const createAdminUser = async (): Promise<boolean> => {
  try {
    const { data, error } = await supabase.functions.invoke('create-admin', {
      method: 'POST',
      body: {}
    });
    
    if (error) {
      console.error("Error creating admin user:", error);
      toast.error("Erro ao criar usuário administrador");
      return false;
    }
    
    if (data && data.success) {
      console.log("Admin user created or already exists:", data.message);
      return true;
    } else {
      console.error("Failed to create admin user:", data?.message || "Unknown error");
      return false;
    }
  } catch (error) {
    console.error("Exception during admin user creation:", error);
    return false;
  }
};
