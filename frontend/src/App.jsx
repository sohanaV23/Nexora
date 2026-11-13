import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import { AppLayout } from './components/layout/AppLayout';
import { DashboardRouter } from './pages/DashboardRouter';
import { LoginPage } from './pages/LoginPage';
import { ComplaintsPage } from './features/complaints/ComplaintsPage';
import { SlasPage } from './features/slas/SlasPage';
import { DuesPage } from './features/maintenance/DuesPage';
import { VisitorsPage } from './features/visitors/VisitorsPage';
import { FacilitiesPage } from './features/facilities/FacilitiesPage';
import { ParkingPage } from './features/parking/ParkingPage';
import { NoticesPage } from './features/notices/NoticesPage';
import { DirectoryPage } from './features/directory/DirectoryPage';
import { AnalyticsPage } from './features/analytics/AnalyticsPage';
import { LeasesPage } from './features/leases/LeasesPage';
import { useDemoAuth } from './context/DemoAuthContext';

export default function App() {
  const { currentUser, isLoading } = useDemoAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-500 to-violet-500 flex items-center justify-center animate-pulse shadow-xl shadow-indigo-500/30">
          <Sparkles className="w-6 h-6 text-white" />
        </div>
        <p className="text-xs font-semibold tracking-widest uppercase text-indigo-400">
          Loading Nexora Platform...
        </p>
      </div>
    );
  }

  // If user is unauthenticated, show the Role-Based Login page as the primary entrance
  if (!currentUser) {
    return (
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="*" element={<LoginPage />} />
      </Routes>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={<Navigate to="/" replace />} />
      <Route element={<AppLayout />}>
        <Route path="/" element={<DashboardRouter />} />
        <Route path="/leases" element={<LeasesPage />} />
        <Route path="/complaints" element={<ComplaintsPage />} />
        <Route path="/slas" element={<SlasPage />} />
        <Route path="/dues" element={<DuesPage />} />
        <Route path="/visitors" element={<VisitorsPage />} />
        <Route path="/facilities" element={<FacilitiesPage />} />
        <Route path="/parking" element={<ParkingPage />} />
        <Route path="/notices" element={<NoticesPage />} />
        <Route path="/directory" element={<DirectoryPage />} />
        <Route path="/analytics" element={<AnalyticsPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
