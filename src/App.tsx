import React, { useState } from 'react';
import { BrowserRouter, HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import GisMap from './pages/GisMap';
import Infrastructure from './pages/Infrastructure';
import Topology from './pages/Topology';
import CctvFeeds from './pages/CctvFeeds';
import Anomalies from './pages/Anomalies';
import Copilot from './pages/Copilot';
import AreaDiagnostics from './pages/AreaDiagnostics';
import Alerts from './pages/Alerts';
import FrsSearch from './pages/FrsSearch';
import SurveyTracking from './pages/SurveyTracking';
import Login from './pages/Login';
import VehicleTracking from './pages/VehicleTracking';
import { AuditLogProvider } from './context/AuditLogContext';
import { IS_OFFLINE_DEMO } from './utils/offlineDemo';

const Router = IS_OFFLINE_DEMO ? HashRouter : BrowserRouter;

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  if (!isAuthenticated) {
    return <Login onLogin={() => setIsAuthenticated(true)} />;
  }

  return (
    <AuditLogProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="gis-map" element={<GisMap />} />
            <Route path="gis-map/garbage-trucks" element={<VehicleTracking mode="garbage" />} />
            <Route path="gis-map/water-sprinklers" element={<VehicleTracking mode="sprinkler" />} />
            <Route path="infrastructure" element={<Infrastructure />} />
            <Route path="survey-tracking" element={<SurveyTracking />} />
            <Route path="area-diagnostics" element={<AreaDiagnostics />} />
            <Route path="cctv-feeds" element={<CctvFeeds />} />
            <Route path="topology" element={<Topology />} />
            <Route path="anomalies" element={<Anomalies />} />
            <Route path="alerts" element={<Alerts />} />
            <Route path="frs-search" element={<FrsSearch />} />
            <Route path="copilot" element={<Copilot />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </Router>
    </AuditLogProvider>
  );
}
