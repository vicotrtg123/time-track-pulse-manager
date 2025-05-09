
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.43.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders, status: 204 });
  }

  try {
    // Create a Supabase client with the Admin key
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const email = "dsv4@bremen.com.br";
    const password = "123";
    
    // Check if user already exists
    const { data: existingUsers, error: searchError } = await supabase
      .from("profiles")
      .select("*")
      .eq("email", email);
    
    if (searchError) {
      throw new Error(`Error checking for existing user: ${searchError.message}`);
    }
    
    // If user exists, return success
    if (existingUsers && existingUsers.length > 0) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "Admin user already exists", 
          userId: existingUsers[0].id 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }

    // If user doesn't exist, create one
    const { data: userData, error: userError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { name: "Admin Bremen" }
    });

    if (userError || !userData.user) {
      throw new Error(`Error creating user: ${userError?.message || "Unknown error"}`);
    }

    // Set user role to admin in profiles
    const { error: updateError } = await supabase
      .from("profiles")
      .update({ role: "admin" })
      .eq("id", userData.user.id);

    if (updateError) {
      throw new Error(`Error updating user role: ${updateError.message}`);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Admin user created successfully", 
        userId: userData.user.id 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error) {
    console.error("Error:", error.message);
    return new Response(
      JSON.stringify({ success: false, message: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
