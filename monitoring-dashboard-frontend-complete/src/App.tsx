// src/App.tsx

import * as React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { Overview } from './pages/Overview';
import { LogsExplorer } from './pages/LogsExplorer';
import { Tracing } from './pages/Tracing';
import { Analytics } from './pages/Analytics';
import { Alerts } from './pages/Alerts';
import { Settings } from './pages/Settings';


function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Overview />} />
          <Route path="/logs" element={<LogsExplorer />} />
          <Route path="/tracing" element={<Tracing />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/alerts" element={<Alerts />} />
          <Route path="/settings" element={<Settings />} />

        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
