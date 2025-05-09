
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import { TimeRecordsProvider } from "@/context/TimeRecordsContext";
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import TimeRecords from "@/pages/TimeRecords";
import Approvals from "@/pages/Approvals";
import Employees from "@/pages/Employees";
import TimeHistory from "@/pages/TimeHistory";
import NotFound from "@/pages/NotFound";
import { useEffect } from "react";
import { createAdminUser } from "@/lib/create-admin-user";

const queryClient = new QueryClient();

const App = () => {
  // Create admin user when the app starts
  useEffect(() => {
    createAdminUser();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <TimeRecordsProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Navigate to="/login" replace />} />
                <Route path="/login" element={<Login />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/time-records" element={<TimeRecords />} />
                <Route path="/approvals" element={<Approvals />} />
                <Route path="/employees" element={<Employees />} />
                <Route path="/time-history" element={<TimeHistory />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TimeRecordsProvider>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
