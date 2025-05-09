
import React from "react";
import { 
  CalendarRange, 
  Clock, 
  ClipboardCheck, 
  Users,
  LayoutDashboard,
} from "lucide-react";
import SidebarLink from "./SidebarLink";

interface SidebarNavigationProps {
  isAdmin: boolean;
  collapsed: boolean;
  pendingCount: number;
}

const SidebarNavigation: React.FC<SidebarNavigationProps> = ({ isAdmin, collapsed, pendingCount }) => {
  return (
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
  );
};

export default SidebarNavigation;
