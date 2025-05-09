
import React, { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { 
  CalendarRange, 
  Clock, 
  ClipboardCheck, 
  Users, 
  ChevronRight, 
  ChevronLeft,
  LayoutDashboard,
  LogOut,
  UserCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { Button } from "../ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { changeRequestService } from "@/services";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@/types";

interface SidebarLinkProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  badge?: number;
  collapsed: boolean;
}

const SidebarLink: React.FC<SidebarLinkProps> = ({ to, icon, label, badge, collapsed }) => {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <NavLink 
      to={to} 
      className={cn(
        "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-all hover:bg-accent",
        isActive ? "bg-accent text-accent-foreground" : "text-muted-foreground"
      )}
      title={collapsed ? label : undefined}
    >
      {icon}
      {!collapsed && <span className="flex-1">{label}</span>}
      {!collapsed && badge !== undefined && badge > 0 && (
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
          {badge}
        </span>
      )}
      {collapsed && badge !== undefined && badge > 0 && (
        <span className="absolute top-0 right-0 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[8px] text-primary-foreground">
          {badge}
        </span>
      )}
    </NavLink>
  );
};

export default function Sidebar() {
  const { currentUser, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const isMobile = useIsMobile();
  const [pendingCount, setPendingCount] = useState(0);
  const location = useLocation();
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
      <div className="flex h-14 items-center border-b px-4">
        <h2 className={cn(
          "text-lg font-semibold tracking-tight transition-opacity",
          collapsed ? "opacity-0 w-0" : "opacity-100"
        )}>
          TimeTracker
        </h2>
        <Button 
          variant="ghost" 
          size="icon" 
          className="ml-auto"
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </Button>
      </div>
      
      <nav className="flex-1 space-y-1 p-4">
        <SidebarLink 
          to="/dashboard" 
          icon={<LayoutDashboard size={20} />} 
          label="Dashboard" 
          collapsed={collapsed}
        />
        
        <SidebarLink 
          to="/time-records" 
          icon={<Clock size={20} />} 
          label="Meus Pontos" 
          collapsed={collapsed}
        />
        
        <SidebarLink 
          to="/time-history" 
          icon={<CalendarRange size={20} />} 
          label="Histórico de Pontos" 
          collapsed={collapsed}
        />
        
        {isAdmin && (
          <>
            <SidebarLink 
              to="/employees" 
              icon={<Users size={20} />} 
              label="Funcionários" 
              collapsed={collapsed}
            />
            
            <SidebarLink 
              to="/approvals" 
              icon={<ClipboardCheck size={20} />} 
              label="Aprovações"
              badge={pendingCount}
              collapsed={collapsed}
            />
          </>
        )}
      </nav>
      
      {/* User Profile & Logout Footer */}
      <div className={cn(
        "mt-auto border-t p-4",
        collapsed ? "flex justify-center" : "block"
      )}>
        {collapsed ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={userData?.avatar || currentUser.avatar} />
                  <AvatarFallback>{userData?.name?.charAt(0).toUpperCase() || currentUser.name?.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center" side="right">
              <div className="px-2 py-1.5 text-sm font-medium">{userData?.name || currentUser.name}</div>
              <DropdownMenuItem onClick={handleLogout} className="text-red-500 cursor-pointer">
                <LogOut size={16} className="mr-2" />
                Sair
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src={userData?.avatar || currentUser.avatar} />
                <AvatarFallback>{userData?.name?.charAt(0).toUpperCase() || currentUser.name?.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium">{userData?.name || currentUser.name}</p>
                <p className="text-xs text-muted-foreground capitalize">{userData?.role || currentUser.role}</p>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={handleLogout}
              className="text-red-500 hover:text-red-600"
              title="Sair"
            >
              <LogOut size={18} />
            </Button>
          </div>
        )}
      </div>
    </aside>
  );
}
