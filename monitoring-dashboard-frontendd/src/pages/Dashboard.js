import React, { useState, useEffect } from 'react';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell } from 'recharts';
import { Activity, TrendingUp, AlertCircle, CheckCircle, Clock, Zap, Server, FileText } from 'lucide-react';
import axios from 'axios';
import { format } from 'date-fns';
import './Dashboard.css';

const API_BASE_URL = 'http://localhost:8080/api';
const REFRESH_INTERVAL = 3000; // 3 secondes

const COLORS = {
  'pi-gateway': '#3b82f6',
  'pi-connector': '#10b981'
};

function Dashboard() {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [timeRange, setTimeRange] = useState('1h');

  const fetchMetrics = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/metrics/overview`, {
        params: { timeRange }
      });
      setMetrics(response.data);
      setLastUpdate(new Date());
      setError(null);
    } catch (err) {
      console.error('Error fetching metrics:', err);
      setError('Erreur de connexion au backend');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
    const interval = setInterval(fetchMetrics, REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, [timeRange]);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Chargement des métriques en temps réel...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <AlertCircle size={48} color="#ef4444" />
        <h2>Erreur</h2>
        <p>{error}</p>
        <button className="btn btn-primary" onClick={fetchMetrics}>
          Réessayer
        </button>
      </div>
    );
  }

  const totals = metrics?.totals || {};
  const services = metrics?.services || [];
  const timeline = metrics?.timeline || [];

  // Séparer les connecteurs
  const piGateway = services.find(s => s.connector === 'pi-gateway') || {};
  const piConnector = services.find(s => s.connector === 'pi-connector') || {};

  const successRate = totals.totalRequests > 0 
    ? ((totals.successfulRequests / totals.totalRequests) * 100).toFixed(1)
    : 0;

  const errorRate = totals.totalRequests > 0 
    ? ((totals.failedRequests / totals.totalRequests) * 100).toFixed(1)
    : 0;

  // Données pour le pie chart
  const connectorDistribution = [
    { name: 'PI-Gateway', value: piGateway.totalRequests || 0, color: COLORS['pi-gateway'] },
    { name: 'PI-Connector', value: piConnector.totalRequests || 0, color: COLORS['pi-connector'] }
  ];

  return (
    <div className="dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <div>
          <h1>Dashboard Monitoring - Temps Réel</h1>
          <p className="subtitle">Surveillance PI-Gateway (API_IN) & PI-Connector (API_OUT)</p>
        </div>
        <div className="header-actions">
          <div className="realtime-indicator">
            <div className="realtime-dot"></div>
            <span>LIVE - {format(lastUpdate, 'HH:mm:ss')}</span>
          </div>
          <select 
            className="time-range-selector"
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
          >
            <option value="1h">Dernière heure</option>
            <option value="6h">6 heures</option>
            <option value="24h">24 heures</option>
            <option value="7d">7 jours</option>
            <option value="30d">30 jours</option>
          </select>
        </div>
      </div>

      {/* Stats Globales */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon" style={{ background: 'rgba(59, 130, 246, 0.1)' }}>
              <Activity size={24} color="#3b82f6" />
            </div>
            <TrendingUp size={20} color="#10b981" />
          </div>
          <div className="stat-value">{(totals.totalRequests || 0).toLocaleString()}</div>
          <div className="stat-label">Total Requêtes</div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon" style={{ background: 'rgba(16, 185, 129, 0.1)' }}>
              <CheckCircle size={24} color="#10b981" />
            </div>
            <span className="badge badge-success">{successRate}%</span>
          </div>
          <div className="stat-value">{(totals.successfulRequests || 0).toLocaleString()}</div>
          <div className="stat-label">Succès</div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon" style={{ background: 'rgba(239, 68, 68, 0.1)' }}>
              <AlertCircle size={24} color="#ef4444" />
            </div>
            <span className="badge badge-error">{errorRate}%</span>
          </div>
          <div className="stat-value">{(totals.failedRequests || 0).toLocaleString()}</div>
          <div className="stat-label">Erreurs</div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon" style={{ background: 'rgba(245, 158, 11, 0.1)' }}>
              <Clock size={24} color="#f59e0b" />
            </div>
          </div>
          <div className="stat-value">{(totals.avgResponseTime || 0).toFixed(0)}ms</div>
          <div className="stat-label">Latence Moyenne</div>
        </div>
      </div>

      {/* Connecteurs Séparés */}
      <div className="connectors-grid">
        {/* PI-GATEWAY */}
        <div className="connector-card" style={{ borderColor: COLORS['pi-gateway'] }}>
          <div className="connector-header">
            <div className="connector-title">
              <Server size={24} color={COLORS['pi-gateway']} />
              <h2>PI-Gateway</h2>
              <span className="badge badge-info">API_IN</span>
            </div>
            <span className={`badge ${piGateway.status === 'UP' ? 'badge-success' : 'badge-error'}`}>
              {piGateway.status || 'UNKNOWN'}
            </span>
          </div>
          
          <div className="connector-stats">
            <div className="connector-stat">
              <FileText size={16} />
              <div>
                <div className="stat-value-small">{(piGateway.totalRequests || 0).toLocaleString()}</div>
                <div className="stat-label-small">Requêtes</div>
              </div>
            </div>
            
            <div className="connector-stat">
              <CheckCircle size={16} color="#10b981" />
              <div>
                <div className="stat-value-small">{(piGateway.successRate || 0).toFixed(1)}%</div>
                <div className="stat-label-small">Success Rate</div>
              </div>
            </div>
            
            <div className="connector-stat">
              <Clock size={16} color="#f59e0b" />
              <div>
                <div className="stat-value-small">{(piGateway.avgLatency || 0).toFixed(0)}ms</div>
                <div className="stat-label-small">Latence Moy.</div>
              </div>
            </div>
            
            <div className="connector-stat">
              <Zap size={16} color="#10b981" />
              <div>
                <div className="stat-value-small">{(piGateway.uptime || 0).toFixed(1)}%</div>
                <div className="stat-label-small">Uptime</div>
              </div>
            </div>
          </div>
        </div>

        {/* PI-CONNECTOR */}
        <div className="connector-card" style={{ borderColor: COLORS['pi-connector'] }}>
          <div className="connector-header">
            <div className="connector-title">
              <Server size={24} color={COLORS['pi-connector']} />
              <h2>PI-Connector</h2>
              <span className="badge badge-success">API_OUT</span>
            </div>
            <span className={`badge ${piConnector.status === 'UP' ? 'badge-success' : 'badge-error'}`}>
              {piConnector.status || 'UNKNOWN'}
            </span>
          </div>
          
          <div className="connector-stats">
            <div className="connector-stat">
              <FileText size={16} />
              <div>
                <div className="stat-value-small">{(piConnector.totalRequests || 0).toLocaleString()}</div>
                <div className="stat-label-small">Requêtes</div>
              </div>
            </div>
            
            <div className="connector-stat">
              <CheckCircle size={16} color="#10b981" />
              <div>
                <div className="stat-value-small">{(piConnector.successRate || 0).toFixed(1)}%</div>
                <div className="stat-label-small">Success Rate</div>
              </div>
            </div>
            
            <div className="connector-stat">
              <Clock size={16} color="#f59e0b" />
              <div>
                <div className="stat-value-small">{(piConnector.avgLatency || 0).toFixed(0)}ms</div>
                <div className="stat-label-small">Latence Moy.</div>
              </div>
            </div>
            
            <div className="connector-stat">
              <Zap size={16} color="#10b981" />
              <div>
                <div className="stat-value-small">{(piConnector.uptime || 0).toFixed(1)}%</div>
                <div className="stat-label-small">Uptime</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Distribution des Connecteurs */}
      {connectorDistribution.some(d => d.value > 0) && (
        <div className="metric-card">
          <h2 className="card-title">
            <Activity size={24} />
            Distribution des Requêtes par Connecteur
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={connectorDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value, percent }) => `${name}: ${value.toLocaleString()} (${(percent * 100).toFixed(0)}%)`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {connectorDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Timeline Chart */}
      {timeline.length > 0 && (
        <div className="metric-card">
          <h2 className="card-title">
            <Zap size={24} />
            Timeline Requêtes Temps Réel
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={timeline}>
              <defs>
                <linearGradient id="colorRequests" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorErrors" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="timestamp" 
                stroke="#94a3b8"
                tickFormatter={(value) => format(new Date(value), 'HH:mm')}
              />
              <YAxis stroke="#94a3b8" />
              <Tooltip 
                contentStyle={{ 
                  background: '#1e293b', 
                  border: '1px solid #3b82f6',
                  borderRadius: '8px'
                }}
                labelFormatter={(value) => format(new Date(value), 'dd/MM HH:mm')}
              />
              <Legend />
              <Area 
                type="monotone" 
                dataKey="requests" 
                stroke="#3b82f6" 
                fillOpacity={1}
                fill="url(#colorRequests)" 
                name="Requêtes"
              />
              <Area 
                type="monotone" 
                dataKey="errors" 
                stroke="#ef4444" 
                fillOpacity={1}
                fill="url(#colorErrors)" 
                name="Erreurs"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Latency Chart */}
      {timeline.length > 0 && (
        <div className="metric-card">
          <h2 className="card-title">
            <Clock size={24} />
            Latence Temps Réel (P50 / P95 / P99)
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={timeline}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="timestamp" 
                stroke="#94a3b8"
                tickFormatter={(value) => format(new Date(value), 'HH:mm')}
              />
              <YAxis stroke="#94a3b8" label={{ value: 'ms', angle: -90, position: 'insideLeft' }} />
              <Tooltip 
                contentStyle={{ 
                  background: '#1e293b', 
                  border: '1px solid #3b82f6',
                  borderRadius: '8px'
                }}
                labelFormatter={(value) => format(new Date(value), 'dd/MM HH:mm')}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="avgLatency" 
                stroke="#10b981" 
                strokeWidth={2}
                dot={{ fill: '#10b981', r: 3 }}
                name="P50 (Médiane)"
              />
              <Line 
                type="monotone" 
                dataKey="p95Latency" 
                stroke="#f59e0b" 
                strokeWidth={2}
                dot={{ fill: '#f59e0b', r: 3 }}
                name="P95"
              />
              <Line 
                type="monotone" 
                dataKey="p99Latency" 
                stroke="#ef4444" 
                strokeWidth={2}
                dot={{ fill: '#ef4444', r: 3 }}
                name="P99"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
