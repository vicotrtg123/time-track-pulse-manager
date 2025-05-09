
import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useIsMobile } from "@/hooks/use-mobile";
import { changeRequestService } from "@/services";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@/types";
import { cn } from "@/lib/utils";

// Import refactored components
import SidebarHeader from "./sidebar/SidebarHeader";
import SidebarNavigation from "./sidebar/SidebarNavigation";
import UserProfileSection from "./sidebar/UserProfileSection";

const Sidebar: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const isMobile = useIsMobile();
  const [pendingCount, setPendingCount] = useState(0);
  const [userData, setUserData] = useState<User | null>(null);
  
  useEffect(() => {
    if (currentUser) {
      setUserData(currentUser);
      
      // Ensure we have the latest user data from Supabase
      const fetchUserData = async () => {
        try {
          const { data: profileData, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', currentUser.id)
            .maybeSingle();
            
          if (!error && profileData) {
            const freshUserData: User = {
              id: profileData.id,
              name: profileData.name,
              email: profileData.email,
              role: profileData.role as "admin" | "employee",
              active: profileData.active,
              avatar: profileData.avatar
            };
            
            setUserData(freshUserData);
          }
        } catch (err) {
          console.error("Error fetching user data in sidebar:", err);
        }
      };
      
      fetchUserData();
    }
  }, [currentUser]);
  
  // Load the number of pending approval requests
  useEffect(() => {
    const loadPendingCount = async () => {
      if (currentUser?.role === "admin" || userData?.role === "admin") {
        try {
          const pendingRequests = await changeRequestService.getPendingRequests();
          setPendingCount(pendingRequests.length || 0);
        } catch (error) {
          console.error("Error loading pending requests count:", error);
        }
      }
    };
    
    loadPendingCount();
    
    // Set up periodic refresh of pending count
    const intervalId = setInterval(loadPendingCount, 60000); // every minute
    
    return () => clearInterval(intervalId);
  }, [currentUser, userData]);
  
  // Force expand sidebar on mobile
  useEffect(() => {
    if (isMobile) {
      setCollapsed(true);
    }
  }, [isMobile]);

  const handleLogout = () => {
    logout();
  };

  if (!currentUser) {
    return null;
  }

  const isAdmin = userData?.role === "admin" || currentUser?.role === "admin";

  return (
    <aside className={cn(
      "flex flex-col border-r bg-background transition-all duration-300 relative",
      collapsed ? "w-16" : "w-64"
    )}>
      <SidebarHeader 
        collapsed={collapsed} 
        toggleCollapsed={() => setCollapsed(!collapsed)} 
      />
      
      <SidebarNavigation 
        isAdmin={isAdmin} 
        collapsed={collapsed} 
        pendingCount={pendingCount} 
      />
      
      <UserProfileSection 
        userData={userData} 
        collapsed={collapsed} 
        handleLogout={handleLogout} 
      />
    </aside>
  );
};

export default Sidebar;
