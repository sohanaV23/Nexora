import React from 'react';
import { useDemoAuth } from '../context/DemoAuthContext';
import { ResidentDashboard } from '../features/dashboard/ResidentDashboard';
import { AdminDashboard } from '../features/dashboard/AdminDashboard';
import { WorkerDashboard } from '../features/dashboard/WorkerDashboard';
import { SecurityDashboard } from '../features/dashboard/SecurityDashboard';
import { SuperAdminDashboard } from '../features/dashboard/SuperAdminDashboard';

export const DashboardRouter = () => {
  const { currentRole } = useDemoAuth();

  switch (currentRole) {
    case 'super_admin':
      return <SuperAdminDashboard />;
    case 'admin':
      return <AdminDashboard />;
    case 'worker':
      return <WorkerDashboard />;
    case 'security':
      return <SecurityDashboard />;
    case 'tenant':
    case 'landlord':
    case 'resident':
    default:
      return <ResidentDashboard />;
  }
};
