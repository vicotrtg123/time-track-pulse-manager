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
  ClipboardList
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { Button } from "../ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { changeRequestService } from "@/services";

interface SidebarLinkProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  badge?: number;
}

const SidebarLink: React.FC<SidebarLinkProps> = ({ to, icon, label, badge }) => {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <NavLink 
      to={to} 
      className={cn(
        "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-all hover:bg-accent",
        isActive ? "bg-accent text-accent-foreground" : "text-muted-foreground"
      )}
    >
      {icon}
      <span className="flex-1">{label}</span>
      {badge !== undefined && badge > 0 && (
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
          {badge}
        </span>
      )}
    </NavLink>
  );
};

export default function Sidebar() {
  const { currentUser } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const isMobile = useIsMobile();
  const [pendingCount, setPendingCount] = useState(0);
  
  // Load the number of pending approval requests
  useEffect(() => {
    const loadPendingCount = async () => {
      if (currentUser?.role === "admin") {
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
  }, [currentUser]);
  
  // Force expand sidebar on mobile
  useEffect(() => {
    if (isMobile) {
      setCollapsed(true);
    }
  }, [isMobile]);

  if (!currentUser) {
    return null;
  }

  return (
    <aside className={cn(
      "flex flex-col border-r bg-background transition-all duration-300",
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
        />
        
        <SidebarLink 
          to="/time-records" 
          icon={<Clock size={20} />} 
          label="Meus Pontos" 
        />
        
        <SidebarLink 
          to="/time-history" 
          icon={<CalendarRange size={20} />} 
          label="Histórico de Pontos" 
        />
        
        {currentUser.role === "admin" && (
          <>
            <SidebarLink 
              to="/employees" 
              icon={<Users size={20} />} 
              label="Funcionários" 
            />
            
            <SidebarLink 
              to="/approvals" 
              icon={<ClipboardCheck size={20} />} 
              label="Aprovações"
              badge={pendingCount}
            />
          </>
        )}
      </nav>
    </aside>
  );
}
