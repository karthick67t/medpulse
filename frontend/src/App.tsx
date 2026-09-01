import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { MainLayout } from './layouts/MainLayout';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { RiskQueuePage } from './pages/RiskQueuePage';
import { PatientsPage } from './pages/PatientsPage';
import { PatientDetailPage } from './pages/PatientDetailPage';
import { CalendarPage } from './pages/CalendarPage';
import { RiskSimulatorPage } from './pages/RiskSimulatorPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { InterventionsPage } from './pages/InterventionsPage';
import { CareContinuityPage } from './pages/CareContinuityPage';
import { DataQualityPage } from './pages/DataQualityPage';
import { ModelMonitoringPage } from './pages/ModelMonitoringPage';
import { SettingsPage } from './pages/SettingsPage';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  if (!user && !localStorage.getItem('caretrack_user')) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />

          {/* Protected Care Workspace Routes */}
          <Route
            element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/risk-queue" element={<RiskQueuePage />} />
            <Route path="/patients" element={<PatientsPage />} />
            <Route path="/patients/:id" element={<PatientDetailPage />} />
            <Route path="/calendar" element={<CalendarPage />} />
            <Route path="/simulator" element={<RiskSimulatorPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/interventions" element={<InterventionsPage />} />
            <Route path="/continuity" element={<CareContinuityPage />} />
            <Route path="/data-quality" element={<DataQualityPage />} />
            <Route path="/model-monitoring" element={<ModelMonitoringPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
