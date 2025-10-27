import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Activity,
  TrendingUp,
  AlertCircle,
  Clock,
  Zap,
  RefreshCw,
} from 'lucide-react';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { metricsApi } from '../services/api';
import { 
  formatNumber, 
  formatPercentage, 
  formatLatency, 
  formatDate,
  getStatusFromUptime,
  getStatusText,
  getConnectorFullName
} from '../utils/helpers';
import {
  Card,
  CardHeader,
  CardBody,
  CardTitle,
  StatCard,
  StatusIndicator,
  Loading,
  ErrorState,
  Badge,
  Tabs
} from '../components/ui';
import toast, { Toaster } from 'react-hot-toast';

const TIME_RANGES = [
  { id: '1h', label: '1 heure' },
  { id: '6h', label: '6 heures' },
  { id: '24h', label: '24 heures' },
  { id: '7d', label: '7 jours' },
  { id: '30d', label: '30 jours' },
];

const OverviewPage = () => {
  const navigate = useNavigate();
  const [timeRange, setTimeRange] = useState('1h');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(false);

  // Charger les données
  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await metricsApi.getOverview(timeRange);
      setData(response.data);
    } catch (err) {
      console.error('Error loading overview data:', err);
      setError(err.message || 'Erreur lors du chargement des données');
      toast.error('Impossible de charger les données');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [timeRange]);

  // Auto-refresh toutes les 30 secondes si activé
  useEffect(() => {
    if (!autoRefresh) return;
    
    const interval = setInterval(() => {
      loadData();
    }, 30000); // 30 secondes

    return () => clearInterval(interval);
  }, [autoRefresh, timeRange]);

  if (loading && !data) {
    return (
      <div className="max-w-7xl mx-auto">
        <Loading text="Chargement des métriques..." />
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="max-w-7xl mx-auto">
        <ErrorState
          title="Erreur de chargement"
          message={error}
          onRetry={loadData}
        />
      </div>
    );
  }

  const services = data?.services || [];
  const totals = data?.totals || {};
  const timeline = data?.timeline || [];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <Toaster position="top-right" />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Overview</h1>
          <p className="mt-1 text-sm text-gray-500">
            Vue d'ensemble des performances en temps réel
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Auto-refresh toggle */}
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              autoRefresh
                ? 'bg-primary-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            <RefreshCw className={`w-4 h-4 ${autoRefresh ? 'animate-spin' : ''}`} />
            <span>{autoRefresh ? 'Auto-refresh ON' : 'Auto-refresh OFF'}</span>
          </button>

          {/* Manual refresh */}
          <button
            onClick={loadData}
            disabled={loading}
            className="btn btn-secondary"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Actualiser
          </button>
        </div>
      </div>

      {/* Time Range Selector */}
      <Card>
        <CardBody>
          <Tabs
            tabs={TIME_RANGES.map(tr => ({ id: tr.id, label: tr.label }))}
            activeTab={timeRange}
            onChange={setTimeRange}
          />
        </CardBody>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Requêtes totales"
          value={formatNumber(totals.totalRequests || 0)}
          icon={Activity}
          loading={loading}
        />
        <StatCard
          title="Taux de succès"
          value={formatPercentage(totals.successRate || 0)}
          icon={TrendingUp}
          loading={loading}
        />
        <StatCard
          title="Taux d'erreur"
          value={formatPercentage(totals.errorRate || 0)}
          icon={AlertCircle}
          loading={loading}
        />
        <StatCard
          title="Latence moyenne"
          value={formatLatency(totals.avgLatencyMs || 0)}
          icon={Clock}
          loading={loading}
        />
      </div>

      {/* Services Status */}
      <Card>
        <CardHeader>
          <CardTitle>État des services</CardTitle>
        </CardHeader>
        <CardBody>
          <div className="space-y-4">
            {services.map((service) => {
              const status = getStatusFromUptime(service.uptimePercentage || 0);
              
              return (
                <div
                  key={service.name}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                  onClick={() => navigate(`/connector/${service.name}`)}
                >
                  <div className="flex items-center space-x-4">
                    <StatusIndicator status={status} size="lg" />
                    <div>
                      <h4 className="font-semibold text-gray-900">
                        {getConnectorFullName(service.name)}
                      </h4>
                      <p className="text-sm text-gray-500">
                        {getStatusText(status)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-8 text-sm">
                    <div className="text-center">
                      <p className="font-semibold text-gray-900">
                        {formatPercentage(service.uptimePercentage || 0)}
                      </p>
                      <p className="text-gray-500">Uptime</p>
                    </div>
                    <div className="text-center">
                      <p className="font-semibold text-gray-900">
                        {formatNumber(service.requestsPerMinute || 0)}
                      </p>
                      <p className="text-gray-500">Req/min</p>
                    </div>
                    <div className="text-center">
                      <p className="font-semibold text-gray-900">
                        {formatLatency(service.avgLatencyMs || 0)}
                      </p>
                      <p className="text-gray-500">Latence moy.</p>
                    </div>
                    <div className="text-center">
                      <p className="font-semibold text-gray-900">
                        {formatPercentage(service.successRate || 0)}
                      </p>
                      <p className="text-gray-500">Succès</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardBody>
      </Card>

      {/* Traffic Timeline */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Trafic en temps réel</CardTitle>
            <Badge variant="info">
              {timeline.length} points de données
            </Badge>
          </div>
        </CardHeader>
        <CardBody>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timeline}>
                <defs>
                  <linearGradient id="colorGateway" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorConnector" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="timestamp" 
                  tickFormatter={(value) => formatDate(value, 'HH:mm')}
                  stroke="#6b7280"
                />
                <YAxis stroke="#6b7280" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb' }}
                  labelFormatter={(value) => formatDate(value, 'dd/MM/yyyy HH:mm')}
                />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="piGatewayRequests"
                  name="PI Gateway"
                  stroke="#0ea5e9"
                  fillOpacity={1}
                  fill="url(#colorGateway)"
                />
                <Area
                  type="monotone"
                  dataKey="piConnectorRequests"
                  name="PI Connector"
                  stroke="#22c55e"
                  fillOpacity={1}
                  fill="url(#colorConnector)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardBody>
      </Card>

      {/* Latency Percentiles */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Percentiles de latence</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="space-y-4">
              {[
                { label: 'P50 (médiane)', value: totals.p50LatencyMs, color: 'success' },
                { label: 'P95', value: totals.p95LatencyMs, color: 'warning' },
                { label: 'P99', value: totals.p99LatencyMs, color: 'danger' },
              ].map((percentile) => (
                <div key={percentile.label} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">
                      {percentile.label}
                    </span>
                    <span className="text-sm font-bold text-gray-900">
                      {formatLatency(percentile.value || 0)}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full bg-${percentile.color}-600`}
                      style={{ 
                        width: `${Math.min((percentile.value / 200) * 100, 100)}%` 
                      }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Métriques clés</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-gray-200">
                <span className="text-sm font-medium text-gray-700">
                  Taux de timeout
                </span>
                <span className="text-sm font-bold text-gray-900">
                  {formatPercentage(totals.timeoutRate || 0)}
                </span>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-gray-200">
                <span className="text-sm font-medium text-gray-700">
                  Requêtes réussies
                </span>
                <span className="text-sm font-bold text-success-600">
                  {formatNumber((totals.totalRequests || 0) * (totals.successRate || 0) / 100)}
                </span>
              </div>
              <div className="flex items-center justify-between py-3">
                <span className="text-sm font-medium text-gray-700">
                  Requêtes en erreur
                </span>
                <span className="text-sm font-bold text-danger-600">
                  {formatNumber((totals.totalRequests || 0) * (totals.errorRate || 0) / 100)}
                </span>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Actions rapides</CardTitle>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => navigate('/logs?type=ERROR')}
              className="p-4 text-left bg-danger-50 hover:bg-danger-100 rounded-lg transition-colors"
            >
              <AlertCircle className="w-8 h-8 text-danger-600 mb-2" />
              <h4 className="font-semibold text-gray-900">Voir les erreurs</h4>
              <p className="text-sm text-gray-600 mt-1">
                Consulter les derniers logs d'erreur
              </p>
            </button>

            <button
              onClick={() => navigate('/processing')}
              className="p-4 text-left bg-primary-50 hover:bg-primary-100 rounded-lg transition-colors"
            >
              <Activity className="w-8 h-8 text-primary-600 mb-2" />
              <h4 className="font-semibold text-gray-900">Tracer une transaction</h4>
              <p className="text-sm text-gray-600 mt-1">
                Suivre le parcours d'une transaction
              </p>
            </button>

            <button
              onClick={() => navigate('/analytics')}
              className="p-4 text-left bg-success-50 hover:bg-success-100 rounded-lg transition-colors"
            >
              <Zap className="w-8 h-8 text-success-600 mb-2" />
              <h4 className="font-semibold text-gray-900">Voir les analytics</h4>
              <p className="text-sm text-gray-600 mt-1">
                Analyser les tendances et performances
              </p>
            </button>
          </div>
        </CardBody>
      </Card>
    </div>
  );
};

export default OverviewPage;
