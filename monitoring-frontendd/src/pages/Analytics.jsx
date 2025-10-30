import React, { useState } from 'react';
import { useAutoRefresh } from '../hooks/useAutoRefresh';
import { analyticsApi } from '../services/api';
import { Header } from '../components/Header';
import { TrendingUp, TrendingDown, Activity } from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { formatNumber, formatPercentage } from '../utils/formatters';

export const Analytics = () => {
  const [timeRange, setTimeRange] = useState('7d');
  const [connector, setConnector] = useState('all');

  const { 
    data: trends, 
    loading, 
    lastUpdate, 
    refresh 
  } = useAutoRefresh(
    () => analyticsApi.getTrends(timeRange, connector),
    30000,
    true
  );

  if (loading && !trends) {
    return (
      <div className="min-h-screen bg-slate-900">
        <Header lastUpdate={lastUpdate} onRefresh={refresh} refreshing={loading} />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <Activity className="w-12 h-12 text-blue-400 animate-spin mx-auto mb-4" />
            <p className="text-slate-400">Chargement des analytics...</p>
          </div>
        </div>
      </div>
    );
  }

  const data = trends?.data || [];
  const insights = trends?.insights || [];
  const summary = trends?.summary || {};

  return (
    <div className="min-h-screen bg-slate-900">
      <Header lastUpdate={lastUpdate} onRefresh={refresh} refreshing={loading} />
      
      <div className="p-6 space-y-6">
        {/* Controls */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white">Analytics & Tendances</h2>
            <p className="text-slate-400 text-sm mt-1">Analyse des performances sur {timeRange}</p>
          </div>
          
          <div className="flex gap-3">
            <select
              value={connector}
              onChange={(e) => setConnector(e.target.value)}
              className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
            >
              <option value="all">Tous les connecteurs</option>
              <option value="pi-gateway">Pi-Gateway</option>
              <option value="pi-connector">Pi-Connector</option>
            </select>

            <div className="flex gap-2">
              {['24h', '7d', '30d'].map((range) => (
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
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
            <div className="text-sm text-slate-400 mb-2">Total Requêtes</div>
            <div className="text-3xl font-bold text-white mb-2">
              {formatNumber(summary.totalRequests)}
            </div>
            <div className="flex items-center gap-2 text-sm text-green-400">
              <TrendingUp className="w-4 h-4" />
              <span>{formatPercentage(summary.growth || 0)} vs période précédente</span>
            </div>
          </div>

          <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
            <div className="text-sm text-slate-400 mb-2">Taux de Succès Moyen</div>
            <div className="text-3xl font-bold text-green-400 mb-2">
              {formatPercentage(summary.avgSuccessRate)}
            </div>
            <div className="text-sm text-slate-400">
              Sur la période sélectionnée
            </div>
          </div>

          <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
            <div className="text-sm text-slate-400 mb-2">Latence Médiane</div>
            <div className="text-3xl font-bold text-purple-400 mb-2">
              {summary.medianLatency}ms
            </div>
            <div className="text-sm text-slate-400">
              P50 sur la période
            </div>
          </div>
        </div>

        {/* Trends Chart */}
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
          <h3 className="text-lg font-bold text-white mb-4">
            📈 Tendances des Requêtes
          </h3>
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis 
                dataKey="date" 
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
              <Line 
                type="monotone" 
                dataKey="requests" 
                stroke="#3b82f6" 
                strokeWidth={2}
                name="Requêtes"
                dot={{ r: 3 }}
              />
              <Line 
                type="monotone" 
                dataKey="errors" 
                stroke="#ef4444" 
                strokeWidth={2}
                name="Erreurs"
                dot={{ r: 3 }}
              />
              <Line 
                type="monotone" 
                dataKey="avgLatency" 
                stroke="#8b5cf6" 
                strokeWidth={2}
                name="Latence Moy (ms)"
                dot={{ r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Insights */}
        {insights && insights.length > 0 && (
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
            <h3 className="text-lg font-bold text-white mb-4">
              💡 Insights & Recommandations
            </h3>
            <div className="space-y-3">
              {insights.map((insight, index) => (
                <div 
                  key={index}
                  className="flex items-start gap-3 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg"
                >
                  <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-blue-400 text-sm font-bold">{index + 1}</span>
                  </div>
                  <p className="text-slate-300 text-sm">{insight}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
