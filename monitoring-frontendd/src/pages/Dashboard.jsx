import React, { useState } from 'react';
import { useAutoRefresh } from '../hooks/useAutoRefresh';
import { metricsApi } from '../services/api';
import { adaptBackendResponse } from '../utils/dataAdapter';
import { Header } from '../components/Header';
import { MetricCard } from '../components/MetricCard';
import { 
  Activity, 
  CheckCircle, 
  XCircle, 
  Clock, 
  TrendingUp,
  Server,
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
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  formatNumber, 
  formatPercentage, 
  formatLatency 
} from '../utils/formatters';

const COLORS = {
  'pi-gateway': '#3b82f6',
  'pi-connector': '#8b5cf6',
  'API_IN': '#3b82f6',
  'API_OUT': '#8b5cf6',
  'PROCESSING': '#10b981',
  'AUTH': '#f59e0b',
};

export const Dashboard = () => {
  const [timeRange, setTimeRange] = useState('1h');
  const [refreshInterval, setRefreshInterval] = useState(10000); // 10 secondes

  const { 
    data: rawOverview, 
    loading, 
    lastUpdate, 
    refresh 
  } = useAutoRefresh(
    () => metricsApi.getOverview(timeRange),
    refreshInterval,
    true
  );

  // Adapter les données du backend
  const overview = rawOverview ? adaptBackendResponse(rawOverview) : null;

  if (loading && !overview) {
    return (
      <div className="min-h-screen bg-slate-900">
        <Header lastUpdate={lastUpdate} onRefresh={refresh} refreshing={loading} />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <Activity className="w-12 h-12 text-blue-400 animate-spin mx-auto mb-4" />
            <p className="text-slate-400">Chargement des métriques...</p>
          </div>
        </div>
      </div>
    );
  }

  const metrics = overview?.totalMetrics || {
    totalRequests: 0,
    successRate: 0,
    errorRate: 0,
    avgLatency: 0,
    p50Latency: 0,
    p95Latency: 0,
    p99Latency: 0
  };
  const connectors = overview?.connectorMetrics || [];
  const timeline = overview?.timeline || [];
  const statusDistribution = overview?.statusDistribution || {};

  // Préparer les données pour le pie chart
  const pieData = Object.entries(statusDistribution).length > 0 
    ? Object.entries(statusDistribution).map(([key, value]) => ({
        name: key,
        value: value,
        percentage: metrics.totalRequests > 0 
          ? ((value / metrics.totalRequests) * 100).toFixed(1)
          : '0'
      }))
    : [];

  return (
    <div className="min-h-screen bg-slate-900">
      <Header lastUpdate={lastUpdate} onRefresh={refresh} refreshing={loading} />
      
      <div className="p-6 space-y-6">
        {/* Time Range Selector */}
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">Vue d'ensemble</h2>
          <div className="flex gap-2">
            {['1h', '6h', '24h', '7d'].map((range) => (
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

        {/* Interval Selector */}
        <div className="flex items-center gap-4 bg-slate-800 p-4 rounded-lg border border-slate-700">
          <span className="text-sm text-slate-400">Actualisation automatique:</span>
          <div className="flex gap-2">
            {[
              { label: '5s', value: 5000 },
              { label: '10s', value: 10000 },
              { label: '30s', value: 30000 },
              { label: '1min', value: 60000 },
            ].map(({ label, value }) => (
              <button
                key={value}
                onClick={() => setRefreshInterval(value)}
                className={`
                  px-3 py-1 rounded text-sm font-medium transition-all
                  ${refreshInterval === value 
                    ? 'bg-green-600 text-white' 
                    : 'bg-slate-700 text-slate-400 hover:bg-slate-600'}
                `}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Total Requêtes"
            value={formatNumber(metrics.totalRequests)}
            change={metrics.requestsChange}
            changeLabel="vs période précédente"
            icon={Activity}
            color="blue"
          />
          <MetricCard
            title="Taux de Succès"
            value={formatPercentage(metrics.successRate)}
            change={metrics.successRateChange}
            icon={CheckCircle}
            color="green"
          />
          <MetricCard
            title="Taux d'Erreur"
            value={formatPercentage(metrics.errorRate)}
            change={metrics.errorRateChange}
            icon={XCircle}
            color="red"
            inverse={true}
          />
          <MetricCard
            title="Latence Moyenne"
            value={formatLatency(metrics.avgLatency)}
            change={metrics.latencyChange}
            icon={Clock}
            color="purple"
            inverse={true}
          />
        </div>

        {/* Connector Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {connectors.map((connector) => (
            <div 
              key={connector.name}
              className="bg-slate-800 border border-slate-700 rounded-lg p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Server className="w-6 h-6 text-blue-400" />
                  <div>
                    <h3 className="text-lg font-bold text-white">{connector.name}</h3>
                    <p className="text-sm text-slate-400">{connector.status}</p>
                  </div>
                </div>
                <div className={`
                  w-3 h-3 rounded-full
                  ${connector.uptime >= 99 ? 'bg-green-400' : 
                    connector.uptime >= 95 ? 'bg-yellow-400' : 'bg-red-400'}
                  animate-pulse-slow
                `} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-xs text-slate-400 mb-1">Uptime</div>
                  <div className="text-xl font-bold text-green-400">
                    {formatPercentage(connector.uptime)}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-slate-400 mb-1">Req/min</div>
                  <div className="text-xl font-bold text-white">
                    {formatNumber(connector.requestsPerMinute)}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-slate-400 mb-1">Latence</div>
                  <div className="text-xl font-bold text-purple-400">
                    {formatLatency(connector.avgLatency)}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-slate-400 mb-1">P95</div>
                  <div className="text-xl font-bold text-slate-300">
                    {formatLatency(connector.p95Latency)}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Timeline Chart */}
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-white">
              📊 Timeline des Requêtes
            </h3>
            <div className="text-sm text-slate-400">
              Dernières {timeRange}
            </div>
          </div>
          
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={timeline}>
              <defs>
                <linearGradient id="colorGateway" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={COLORS['pi-gateway']} stopOpacity={0.3}/>
                  <stop offset="95%" stopColor={COLORS['pi-gateway']} stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorConnector" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={COLORS['pi-connector']} stopOpacity={0.3}/>
                  <stop offset="95%" stopColor={COLORS['pi-connector']} stopOpacity={0}/>
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
                dataKey="pi-gateway" 
                stroke={COLORS['pi-gateway']} 
                fill="url(#colorGateway)"
                name="Pi-Gateway"
              />
              <Area 
                type="monotone" 
                dataKey="pi-connector" 
                stroke={COLORS['pi-connector']} 
                fill="url(#colorConnector)"
                name="Pi-Connector"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Bottom Row: Status Distribution & Latency */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Status Distribution Pie Chart */}
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
            <h3 className="text-lg font-bold text-white mb-4">
              📈 Distribution des Types de Logs
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percentage }) => `${name}: ${percentage}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[entry.name] || '#64748b'} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1e293b', 
                    border: '1px solid #334155',
                    borderRadius: '8px'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Latency Percentiles */}
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
            <h3 className="text-lg font-bold text-white mb-4">
              ⚡ Percentiles de Latence
            </h3>
            <div className="space-y-4">
              {[
                { label: 'P50 (Médiane)', value: metrics.p50Latency, color: 'bg-blue-500' },
                { label: 'P95', value: metrics.p95Latency, color: 'bg-yellow-500' },
                { label: 'P99', value: metrics.p99Latency, color: 'bg-red-500' },
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
                      style={{ width: `${Math.min((item.value / metrics.p99Latency) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
