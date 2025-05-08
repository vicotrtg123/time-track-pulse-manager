
import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  Calendar, 
  ClipboardList, 
  Clock,
  LogOut, 
  Menu, 
  X, 
  PanelLeftOpen,
  PanelLeftClose,
  Users
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/context/AuthContext";
import { Badge } from "@/components/ui/badge";
import { useTimeRecords } from "@/context/TimeRecordsContext";

const Sidebar = () => {
  const { currentUser, logout } = useAuth();
  const { getPendingChangeRequests } = useTimeRecords();
  const [expanded, setExpanded] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const location = useLocation();
  
  const role = currentUser?.role || "employee";
  const isAdmin = role === "admin";

  // Update pending requests count
  useEffect(() => {
    const fetchPendingRequests = async () => {
      if (isAdmin) {
        const pendingRequests = await getPendingChangeRequests();
        setPendingCount(pendingRequests.length);
      }
    };
    
    fetchPendingRequests();
  }, [getPendingChangeRequests, isAdmin]);

  const toggleSidebar = () => {
    setExpanded(!expanded);
  };

  const toggleMobileSidebar = () => {
    setMobileOpen(!mobileOpen);
  };

  const closeMobileSidebar = () => {
    setMobileOpen(false);
  };

  const navigation = [
    { name: "Painel", href: "/dashboard", icon: <Clock className="h-5 w-5" /> },
    { name: "Meu Ponto", href: "/time-records", icon: <Calendar className="h-5 w-5" /> },
    ...(isAdmin
      ? [
          {
            name: "Aprovações",
            href: "/approvals",
            icon: <ClipboardList className="h-5 w-5" />,
            badge: pendingCount > 0,
            badgeCount: pendingCount,
          },
          { 
            name: "Funcionários", 
            href: "/employees", 
            icon: <Users className="h-5 w-5" /> 
          },
        ]
      : []),
  ];

  return (
    <>
      {/* Mobile menu button */}
      <div className="fixed top-4 left-4 z-40 block md:hidden">
        <Button
          variant="outline"
          size="icon"
          onClick={toggleMobileSidebar}
          className="h-10 w-10 border border-border rounded-md shadow-md bg-white"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </div>

      {/* Overlay for mobile */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
          onClick={closeMobileSidebar}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          "fixed z-50 inset-y-0 left-0 bg-white border-r border-border transition-all duration-300 ease-in-out flex flex-col",
          expanded ? "w-64" : "w-[70px]",
          mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        <div className="flex items-center justify-between p-4 border-b border-border h-16">
          <Link to="/dashboard" className={cn("flex items-center", !expanded && "hidden")}>
            <Clock className="h-6 w-6 text-primary" />
            <span className="ml-2 text-lg font-semibold">PulseManager</span>
          </Link>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleMobileSidebar}
              className="md:hidden"
            >
              <X className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleSidebar}
              className="hidden md:flex"
            >
              {expanded ? (
                <PanelLeftClose className="h-5 w-5" />
              ) : (
                <PanelLeftOpen className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto py-4 flex flex-col justify-between">
          {/* Navigation */}
          <nav className="px-2 space-y-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  location.pathname === item.href
                    ? "bg-primary/10 text-primary"
                    : "text-gray-600 hover:bg-gray-100",
                  "group flex items-center px-2 py-3 rounded-md transition-all",
                  expanded ? "justify-start" : "justify-center"
                )}
              >
                <div className="relative">
                  {item.icon}
                  {item.badge && (
                    <Badge
                      variant="destructive"
                      className={cn(
                        "absolute -top-1 -right-1 min-w-[1.1rem] h-[1.1rem] flex items-center justify-center px-1 text-xs",
                        !expanded && "-right-1"
                      )}
                    >
                      {item.badgeCount}
                    </Badge>
                  )}
                </div>
                {expanded && <span className="ml-3">{item.name}</span>}
              </Link>
            ))}
          </nav>

          {/* User info and logout */}
          <div className={cn("border-t border-border mt-6 pt-4 px-2")}>
            <div className={cn("flex items-center px-2 py-3", expanded ? "justify-between" : "justify-center")}>
              <div className={cn("flex items-center", expanded ? "space-x-3" : "")}>
                <Avatar className="h-8 w-8">
                  <AvatarImage src={currentUser?.avatar} alt={currentUser?.name} />
                  <AvatarFallback>{currentUser?.name?.charAt(0)}</AvatarFallback>
                </Avatar>
                {expanded && (
                  <div>
                    <p className="text-sm font-medium">{currentUser?.name}</p>
                    <p className="text-xs text-gray-500 capitalize">{currentUser?.role}</p>
                  </div>
                )}
              </div>
              {expanded && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={logout}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <LogOut className="h-5 w-5" />
                </Button>
              )}
            </div>
            {!expanded && (
              <Button
                variant="ghost"
                size="icon"
                onClick={logout}
                className="w-full mt-2 text-gray-400 hover:text-gray-500"
              >
                <LogOut className="h-5 w-5" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
