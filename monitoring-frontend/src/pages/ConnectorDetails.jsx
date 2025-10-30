import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAutoRefresh } from '../hooks/useAutoRefresh';
import { metricsApi } from '../services/api';
import { Header } from '../components/Header';
import { MetricCard } from '../components/MetricCard';
import { 
  Server, 
  Activity, 
  Clock, 
  CheckCircle, 
  XCircle,
  TrendingUp,
  Zap
} from 'lucide-react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { 
  formatNumber, 
  formatPercentage, 
  formatLatency 
} from '../utils/formatters';

export const ConnectorDetails = ({ connectorName }) => {
  const [timeRange, setTimeRange] = useState('24h');

  const { 
    data: details, 
    loading, 
    lastUpdate, 
    refresh 
  } = useAutoRefresh(
    () => metricsApi.getConnectorDetails(connectorName, timeRange),
    15000,
    true
  );

  if (loading && !details) {
    return (
      <div className="min-h-screen bg-slate-900">
        <Header lastUpdate={lastUpdate} onRefresh={refresh} refreshing={loading} />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <Activity className="w-12 h-12 text-blue-400 animate-spin mx-auto mb-4" />
            <p className="text-slate-400">Chargement des détails...</p>
          </div>
        </div>
      </div>
    );
  }

  const metrics = details?.metrics || {};
  const timeline = details?.timeline || [];
  const statusBreakdown = details?.statusBreakdown || {};
  const topEndpoints = details?.topEndpoints || [];
  const latencyPercentiles = details?.latencyPercentiles || {};

  return (
    <div className="min-h-screen bg-slate-900">
      <Header lastUpdate={lastUpdate} onRefresh={refresh} refreshing={loading} />
      
      <div className="p-6 space-y-6">
        {/* Title & Time Range */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Server className="w-8 h-8 text-blue-400" />
            <div>
              <h2 className="text-2xl font-bold text-white capitalize">
                {connectorName}
              </h2>
              <p className="text-slate-400 text-sm">Métriques détaillées</p>
            </div>
          </div>
          <div className="flex gap-2">
            {['1h', '6h', '24h', '7d', '30d'].map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`
                  px-4 py-2 rounded-lg font-medium transition-all
                  ${timeRange === range 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}
                `}
              >
                {range}
              </button>
            ))}
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Uptime"
            value={formatPercentage(metrics.uptime)}
            icon={CheckCircle}
            color="green"
          />
          <MetricCard
            title="Requêtes/min"
            value={formatNumber(metrics.requestsPerMinute)}
            icon={Activity}
            color="blue"
          />
          <MetricCard
            title="Latence Moyenne"
            value={formatLatency(metrics.avgLatency)}
            icon={Clock}
            color="purple"
          />
          <MetricCard
            title="Taux d'Erreur"
            value={formatPercentage(metrics.errorRate)}
            icon={XCircle}
            color="red"
          />
        </div>

        {/* Timeline Chart */}
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
          <h3 className="text-lg font-bold text-white mb-4">
            📊 Activité sur {timeRange}
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={timeline}>
              <defs>
                <linearGradient id="colorRequests" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis 
                dataKey="timestamp" 
                stroke="#64748b"
                tick={{ fill: '#94a3b8' }}
              />
              <YAxis 
                stroke="#64748b"
                tick={{ fill: '#94a3b8' }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1e293b', 
                  border: '1px solid #334155',
                  borderRadius: '8px'
                }}
                labelStyle={{ color: '#e2e8f0' }}
              />
              <Legend />
              <Area 
                type="monotone" 
                dataKey="requests" 
                stroke="#3b82f6" 
                fill="url(#colorRequests)"
                name="Requêtes"
              />
              <Area 
                type="monotone" 
                dataKey="errors" 
                stroke="#ef4444" 
                fill="none"
                name="Erreurs"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Bottom Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Status Breakdown */}
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
            <h3 className="text-lg font-bold text-white mb-4">
              📈 Répartition des Status
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={Object.entries(statusBreakdown).map(([status, count]) => ({
                status,
                count
              }))}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis 
                  dataKey="status" 
                  stroke="#64748b"
                  tick={{ fill: '#94a3b8' }}
                />
                <YAxis 
                  stroke="#64748b"
                  tick={{ fill: '#94a3b8' }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1e293b', 
                    border: '1px solid #334155',
                    borderRadius: '8px'
                  }}
                />
                <Bar dataKey="count" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Latency Percentiles */}
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
            <h3 className="text-lg font-bold text-white mb-4">
              ⚡ Percentiles de Latence
            </h3>
            <div className="space-y-4">
              {[
                { label: 'P50 (Médiane)', value: latencyPercentiles.p50, color: 'bg-blue-500' },
                { label: 'P90', value: latencyPercentiles.p90, color: 'bg-cyan-500' },
                { label: 'P95', value: latencyPercentiles.p95, color: 'bg-yellow-500' },
                { label: 'P99', value: latencyPercentiles.p99, color: 'bg-red-500' },
              ].map((item) => (
                <div key={item.label}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-slate-400">{item.label}</span>
                    <span className="text-lg font-bold text-white">
                      {formatLatency(item.value)}
                    </span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-2">
                    <div 
                      className={`${item.color} h-2 rounded-full transition-all duration-500`}
                      style={{ 
                        width: `${Math.min((item.value / latencyPercentiles.p99) * 100, 100)}%` 
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top Endpoints */}
        {topEndpoints && topEndpoints.length > 0 && (
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
            <h3 className="text-lg font-bold text-white mb-4">
              🔝 Top Endpoints
            </h3>
            <div className="space-y-3">
              {topEndpoints.map((endpoint, index) => (
                <div 
                  key={index}
                  className="flex items-center justify-between p-3 bg-slate-900 rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs text-blue-400 font-medium">
                        {endpoint.method}
                      </span>
                      <span className="text-sm text-white font-mono">
                        {endpoint.path}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-slate-400">
                      <span>{formatNumber(endpoint.count)} requêtes</span>
                      <span>Latence: {formatLatency(endpoint.avgLatency)}</span>
                      <span>Erreurs: {formatPercentage(endpoint.errorRate)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export const GatewayDetails = () => (
  <ConnectorDetails connectorName="pi-gateway" />
);

export const ConnectorDetailsPage = () => (
  <ConnectorDetails connectorName="pi-connector" />
);
