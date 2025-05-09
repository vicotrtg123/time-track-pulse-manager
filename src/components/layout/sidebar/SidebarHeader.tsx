
import React from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarHeaderProps {
  collapsed: boolean;
  toggleCollapsed: () => void;
}

const SidebarHeader: React.FC<SidebarHeaderProps> = ({ collapsed, toggleCollapsed }) => {
  return (
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
        onClick={toggleCollapsed}
      >
        {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
      </Button>
    </div>
  );
};

export default SidebarHeader;
