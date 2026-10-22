import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import { DashboardRouter } from './pages/DashboardRouter';
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

export default function App() {
  return (
    <Routes>
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
