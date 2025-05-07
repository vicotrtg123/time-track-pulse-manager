
import React from "react";
import AppLayout from "@/components/layout/AppLayout";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import TimeClockCard from "@/components/dashboard/TimeClockCard";
import RecentRecords from "@/components/dashboard/RecentRecords";
import PendingRequestsCard from "@/components/dashboard/PendingRequestsCard";
import { useAuth } from "@/context/AuthContext";

const Dashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const isAdmin = currentUser?.role === "admin";
  
  return (
    <AppLayout>
      <DashboardHeader />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <TimeClockCard />
        <RecentRecords />
      </div>
      
      {isAdmin && (
        <div className="mt-6">
          <PendingRequestsCard />
        </div>
      )}
    </AppLayout>
  );
};

export default Dashboard;
