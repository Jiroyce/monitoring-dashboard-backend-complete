import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import OverviewPage from './pages/OverviewPage';
import LogsPage from './pages/LogsPage';
import ProcessingPage from './pages/ProcessingPage';
import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" />
      <Layout>
        <Routes>
          <Route path="/" element={<OverviewPage />} />
          <Route path="/logs" element={<LogsPage />} />
          <Route path="/processing" element={<ProcessingPage />} />
          <Route path="/analytics" element={<AnalyticsPlaceholder />} />
          <Route path="/alerts" element={<AlertsPlaceholder />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

// Placeholder pour Analytics (à implémenter)
const AnalyticsPlaceholder = () => {
  return (
    <div className="max-w-7xl mx-auto">
      <div className="text-center py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Analytics</h1>
        <p className="text-gray-600">Page en cours de développement...</p>
        <p className="text-sm text-gray-500 mt-2">
          Cette page contiendra :
        </p>
        <ul className="mt-4 space-y-2 text-sm text-gray-600">
          <li>• Comparaison de périodes</li>
          <li>• Heatmap du trafic</li>
          <li>• Top clients</li>
          <li>• Tendances et anomalies</li>
          <li>• Rapports personnalisés</li>
        </ul>
      </div>
    </div>
  );
};

// Placeholder pour Alerts (à implémenter)
const AlertsPlaceholder = () => {
  return (
    <div className="max-w-7xl mx-auto">
      <div className="text-center py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Alertes</h1>
        <p className="text-gray-600">Page en cours de développement...</p>
        <p className="text-sm text-gray-500 mt-2">
          Cette page contiendra :
        </p>
        <ul className="mt-4 space-y-2 text-sm text-gray-600">
          <li>• Alertes actives</li>
          <li>• Configuration des règles d'alerte</li>
          <li>• Historique des alertes</li>
          <li>• Notifications</li>
          <li>• Escalades</li>
        </ul>
      </div>
    </div>
  );
};

// Page 404
const NotFound = () => {
  return (
    <div className="max-w-7xl mx-auto">
      <div className="text-center py-12">
        <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
        <p className="text-xl text-gray-600 mb-8">Page introuvable</p>
        <a href="/" className="btn btn-primary">
          Retour à l'accueil
        </a>
      </div>
    </div>
  );
};

export default App;
