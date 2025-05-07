
import React, { ReactNode } from "react";
import { useAuth } from "@/context/AuthContext";
import Sidebar from "./Sidebar";
import { Navigate } from "react-router-dom";

interface AppLayoutProps {
  children: ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const { isAuthenticated, currentUser } = useAuth();

  if (!isAuthenticated || !currentUser) {
    return <Navigate to="/login" />;
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1 p-4 md:p-6 overflow-y-auto">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};

export default AppLayout;
