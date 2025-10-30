import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Calendar,
  Users,
  Activity,
  AlertTriangle,
  Download,
  RefreshCw,
  Filter,
  BarChart3,
  PieChart,
  Clock
} from 'lucide-react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart as RechartsPie,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ScatterChart,
  Scatter
} from 'recharts';
import { analyticsApi, metricsApi } from '../services/api';
import {
  formatNumber,
  formatPercentage,
  formatLatency,
  formatDate,
  exportToCSV,
  exportToJSON,
  getChartColor
} from '../utils/helpers';
import {
  Card,
  CardHeader,
  CardBody,
  CardTitle,
  StatCard,
  Badge,
  Loading,
  ErrorState,
  Tabs
} from '../components/ui';
import toast from 'react-hot-toast';

const AnalyticsPage = () => {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [timeRange, setTimeRange] = useState('7d');
  const [comparisonData, setComparisonData] = useState(null);
  const [heatmapData, setHeatmapData] = useState(null);
  const [topClientsData, setTopClientsData] = useState(null);
  const [trendsData, setTrendsData] = useState(null);

  // Charger les données selon l'onglet actif
  useEffect(() => {
    loadData();
  }, [activeTab, timeRange]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'comparison') {
        await loadComparison();
      } else if (activeTab === 'heatmap') {
        await loadHeatmap();
      } else if (activeTab === 'clients') {
        await loadTopClients();
      } else if (activeTab === 'trends') {
        await loadTrends();
      } else {
        await loadAllOverview();
      }
    } catch (error) {
      console.error('Error loading analytics:', error);
      toast.error('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const loadAllOverview = async () => {
    // Charger un résumé de tout
    await Promise.all([
      loadComparison(),
      loadHeatmap(),
      loadTopClients(),
      loadTrends()
    ]);
  };

  const loadComparison = async () => {
    try {
      const response = await analyticsApi.comparePeriods('current', 'previous', null);
      setComparisonData(response.data);
    } catch (error) {
      console.error('Error loading comparison:', error);
      toast.error('Erreur lors du chargement de la comparaison');
    }
  };

  const loadHeatmap = async () => {
    try {
      const daysMap = {
        '7d': 7,
        '14d': 14,
        '30d': 30
      };
      const days = daysMap[timeRange] || 7;

      const response = await analyticsApi.getHeatmap(days, null);
      setHeatmapData(response.data);
    } catch (error) {
      console.error('Error loading heatmap:', error);
      toast.error('Erreur lors du chargement de la heatmap');
    }
  };

  const loadTopClients = async () => {
    try {
      const response = await analyticsApi.getTopClients(10, timeRange, null);
      setTopClientsData(response.data);
    } catch (error) {
      console.error('Error loading top clients:', error);
      toast.error('Erreur lors du chargement des top clients');
    }
  };

  const loadTrends = async () => {
    try {
      const daysMap = {
        '7d': 7,
        '14d': 14,
        '30d': 30
      };
      const days = daysMap[timeRange] || 30;

      // Charger les tendances pour requests
      const trendsResponse = await analyticsApi.getTrends('requests', days, null);

      // Charger les anomalies
      const anomaliesResponse = await analyticsApi.getAnomalies(days, null);

      setTrendsData({
        requests: trendsResponse.data.data || [],
        anomalies: anomaliesResponse.data || []
      });
    } catch (error) {
      console.error('Error loading trends:', error);
      toast.error('Erreur lors du chargement des tendances');
    }
  };

  const getTrafficLevel = (requests) => {
    if (requests < 300) return 'low';
    if (requests < 600) return 'medium';
    if (requests < 900) return 'high';
    return 'very_high';
  };

  const getTrafficColor = (level) => {
    const colors = {
      low: '#dcfce7',
      medium: '#fed7aa',
      high: '#fecaca',
      very_high: '#dc2626'
    };
    return colors[level];
  };

  const handleExport = (data, filename) => {
    exportToJSON(data, filename);
    toast.success('Export réussi');
  };

  const tabs = [
    { id: 'overview', label: 'Vue d\'ensemble' },
    { id: 'comparison', label: 'Comparaison' },
    { id: 'heatmap', label: 'Heatmap' },
    { id: 'clients', label: 'Top Clients' },
    { id: 'trends', label: 'Tendances' }
  ];

  return (
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
            <p className="mt-1 text-sm text-gray-500">
              Analyses approfondies et insights
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="select"
            >
              <option value="24h">24 heures</option>
              <option value="7d">7 jours</option>
              <option value="30d">30 jours</option>
              <option value="90d">90 jours</option>
            </select>

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

        {/* Tabs */}
        <Card>
          <CardBody>
            <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />
          </CardBody>
        </Card>

        {/* Content based on active tab */}
        {loading && !comparisonData ? (
            <Loading text="Chargement des analytics..." />
        ) : (
            <>
              {activeTab === 'overview' && (
                  <OverviewTab
                      comparisonData={comparisonData}
                      heatmapData={heatmapData}
                      topClientsData={topClientsData}
                      trendsData={trendsData}
                  />
              )}

              {activeTab === 'comparison' && (
                  <ComparisonTab data={comparisonData} onExport={handleExport} />
              )}

              {activeTab === 'heatmap' && (
                  <HeatmapTab data={heatmapData} onExport={handleExport} />
              )}

              {activeTab === 'clients' && (
                  <ClientsTab data={topClientsData} onExport={handleExport} />
              )}

              {activeTab === 'trends' && (
                  <TrendsTab data={trendsData} onExport={handleExport} />
              )}
            </>
        )}
      </div>
  );
};

// ============================================================================
// OVERVIEW TAB
// ============================================================================

const OverviewTab = ({ comparisonData, heatmapData, topClientsData, trendsData }) => {
  return (
      <div className="space-y-6">
        {/* Stats comparison */}
        {comparisonData && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardBody>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Requêtes</p>
                      <p className="mt-1 text-2xl font-bold text-gray-900">
                        {formatNumber(comparisonData.period1.requests)}
                      </p>
                      <div className="mt-2 flex items-center">
                        {comparisonData.changes.requests > 0 ? (
                            <TrendingUp className="w-4 h-4 text-success-600 mr-1" />
                        ) : (
                            <TrendingDown className="w-4 h-4 text-danger-600 mr-1" />
                        )}
                        <span className={`text-sm font-medium ${
                            comparisonData.changes.requests > 0 ? 'text-success-600' : 'text-danger-600'
                        }`}>
                      {Math.abs(comparisonData.changes.requests).toFixed(1)}%
                    </span>
                      </div>
                    </div>
                    <Activity className="w-8 h-8 text-primary-600" />
                  </div>
                </CardBody>
              </Card>

              <Card>
                <CardBody>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Latence moy.</p>
                      <p className="mt-1 text-2xl font-bold text-gray-900">
                        {formatLatency(comparisonData.period1.avgLatency)}
                      </p>
                      <div className="mt-2 flex items-center">
                        {comparisonData.changes.latency < 0 ? (
                            <TrendingDown className="w-4 h-4 text-success-600 mr-1" />
                        ) : (
                            <TrendingUp className="w-4 h-4 text-danger-600 mr-1" />
                        )}
                        <span className={`text-sm font-medium ${
                            comparisonData.changes.latency < 0 ? 'text-success-600' : 'text-danger-600'
                        }`}>
                      {Math.abs(comparisonData.changes.latency).toFixed(1)}%
                    </span>
                      </div>
                    </div>
                    <Clock className="w-8 h-8 text-warning-600" />
                  </div>
                </CardBody>
              </Card>

              <Card>
                <CardBody>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Taux d'erreur</p>
                      <p className="mt-1 text-2xl font-bold text-gray-900">
                        {formatPercentage(comparisonData.period1.errorRate)}
                      </p>
                      <div className="mt-2 flex items-center">
                        {comparisonData.changes.errorRate < 0 ? (
                            <TrendingDown className="w-4 h-4 text-success-600 mr-1" />
                        ) : (
                            <TrendingUp className="w-4 h-4 text-danger-600 mr-1" />
                        )}
                        <span className={`text-sm font-medium ${
                            comparisonData.changes.errorRate < 0 ? 'text-success-600' : 'text-danger-600'
                        }`}>
                      {Math.abs(comparisonData.changes.errorRate).toFixed(1)}%
                    </span>
                      </div>
                    </div>
                    <AlertTriangle className="w-8 h-8 text-danger-600" />
                  </div>
                </CardBody>
              </Card>

              <Card>
                <CardBody>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Taux de succès</p>
                      <p className="mt-1 text-2xl font-bold text-gray-900">
                        {formatPercentage(comparisonData.period1.successRate)}
                      </p>
                      <div className="mt-2 flex items-center">
                        {comparisonData.changes.successRate > 0 ? (
                            <TrendingUp className="w-4 h-4 text-success-600 mr-1" />
                        ) : (
                            <TrendingDown className="w-4 h-4 text-danger-600 mr-1" />
                        )}
                        <span className={`text-sm font-medium ${
                            comparisonData.changes.successRate > 0 ? 'text-success-600' : 'text-danger-600'
                        }`}>
                      {Math.abs(comparisonData.changes.successRate).toFixed(1)}%
                    </span>
                      </div>
                    </div>
                    <TrendingUp className="w-8 h-8 text-success-600" />
                  </div>
                </CardBody>
              </Card>
            </div>
        )}

        {/* Mini Heatmap */}
        {heatmapData && (
            <Card>
              <CardHeader>
                <CardTitle>Heatmap du trafic (7 derniers jours)</CardTitle>
              </CardHeader>
              <CardBody>
                <div className="text-xs text-gray-500 mb-2">
                  Plus la couleur est foncée, plus le trafic est élevé
                </div>
                <div className="overflow-x-auto">
                  <div className="inline-block min-w-full">
                    {heatmapData.slice(0, 7).map((day, dayIndex) => (
                        <div key={dayIndex} className="flex items-center mb-1">
                          <div className="w-12 text-xs font-medium text-gray-700">
                            {day.day}
                          </div>
                          <div className="flex space-x-0.5">
                            {day.hours.map((hour, hourIndex) => (
                                <div
                                    key={hourIndex}
                                    className="w-6 h-6 rounded"
                                    style={{ backgroundColor: getTrafficColor(hour.level) }}
                                    title={`${hour.hour}h: ${hour.requests} requêtes`}
                                />
                            ))}
                          </div>
                        </div>
                    ))}
                  </div>
                </div>
              </CardBody>
            </Card>
        )}

        {/* Top Clients preview */}
        {topClientsData && (
            <Card>
              <CardHeader>
                <CardTitle>Top 5 Clients</CardTitle>
              </CardHeader>
              <CardBody>
                <div className="space-y-3">
                  {topClientsData.slice(0, 5).map((client, index) => (
                      <div
                          key={index}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="flex items-center justify-center w-8 h-8 bg-primary-100 text-primary-700 rounded-full font-bold">
                            {index + 1}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{client.ip}</p>
                            <p className="text-sm text-gray-500">
                              {formatNumber(client.requests)} requêtes
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-900">
                            {formatLatency(client.avgLatency)}
                          </p>
                          <p className="text-sm text-gray-500">
                            {client.errors} erreurs
                          </p>
                        </div>
                      </div>
                  ))}
                </div>
              </CardBody>
            </Card>
        )}
      </div>
  );
};

// ============================================================================
// COMPARISON TAB
// ============================================================================

const ComparisonTab = ({ data, onExport }) => {
  if (!data) return <Loading />;

  return (
      <div className="space-y-6">
        <div className="flex justify-end">
          <button
              onClick={() => onExport(data, 'comparison')}
              className="btn btn-secondary"
          >
            <Download className="w-4 h-4 mr-2" />
            Export JSON
          </button>
        </div>

        {/* Comparison cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>{data.period1.name}</CardTitle>
            </CardHeader>
            <CardBody>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Requêtes</span>
                  <span className="text-xl font-bold text-gray-900">
                  {formatNumber(data.period1.requests)}
                </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Latence moyenne</span>
                  <span className="text-xl font-bold text-gray-900">
                  {formatLatency(data.period1.avgLatency)}
                </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Taux d'erreur</span>
                  <span className="text-xl font-bold text-danger-600">
                  {formatPercentage(data.period1.errorRate)}
                </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Taux de succès</span>
                  <span className="text-xl font-bold text-success-600">
                  {formatPercentage(data.period1.successRate)}
                </span>
                </div>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{data.period2.name}</CardTitle>
            </CardHeader>
            <CardBody>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Requêtes</span>
                  <span className="text-xl font-bold text-gray-900">
                  {formatNumber(data.period2.requests)}
                </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Latence moyenne</span>
                  <span className="text-xl font-bold text-gray-900">
                  {formatLatency(data.period2.avgLatency)}
                </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Taux d'erreur</span>
                  <span className="text-xl font-bold text-danger-600">
                  {formatPercentage(data.period2.errorRate)}
                </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Taux de succès</span>
                  <span className="text-xl font-bold text-success-600">
                  {formatPercentage(data.period2.successRate)}
                </span>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Changes */}
        <Card>
          <CardHeader>
            <CardTitle>Évolution</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {Object.entries(data.changes).map(([key, value]) => (
                  <div key={key} className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600 capitalize mb-2">
                      {key === 'requests' ? 'Requêtes' :
                          key === 'latency' ? 'Latence' :
                              key === 'errorRate' ? 'Taux d\'erreur' :
                                  'Taux de succès'}
                    </p>
                    <div className="flex items-center space-x-2">
                      {value > 0 ? (
                          <TrendingUp className="w-5 h-5 text-success-600" />
                      ) : (
                          <TrendingDown className="w-5 h-5 text-danger-600" />
                      )}
                      <span className={`text-2xl font-bold ${
                          value > 0 ? 'text-success-600' : 'text-danger-600'
                      }`}>
                    {value > 0 ? '+' : ''}{value.toFixed(1)}%
                  </span>
                    </div>
                  </div>
              ))}
            </div>
          </CardBody>
        </Card>
      </div>
  );
};

// ============================================================================
// HEATMAP TAB
// ============================================================================

const HeatmapTab = ({ data, onExport }) => {
  if (!data) return <Loading />;

  return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm text-gray-600">
              Visualisation du trafic par heure et par jour
            </p>
          </div>
          <button
              onClick={() => onExport(data, 'heatmap')}
              className="btn btn-secondary"
          >
            <Download className="w-4 h-4 mr-2" />
            Export JSON
          </button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Heatmap du trafic (7 derniers jours)</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="overflow-x-auto">
              <div className="inline-block min-w-full">
                {/* Hours header */}
                <div className="flex items-center mb-4">
                  <div className="w-16"></div>
                  <div className="flex space-x-2">
                    {Array.from({ length: 24 }, (_, i) => (
                        <div key={i} className="w-8 text-center text-xs text-gray-500">
                          {i}h
                        </div>
                    ))}
                  </div>
                </div>

                {/* Days rows */}
                {data.map((day, dayIndex) => (
                    <div key={dayIndex} className="flex items-center mb-2">
                      <div className="w-16 text-sm font-medium text-gray-700">
                        {day.day}
                      </div>
                      <div className="flex space-x-2">
                        {day.hours.map((hour, hourIndex) => (
                            <div
                                key={hourIndex}
                                className="w-8 h-8 rounded cursor-pointer hover:opacity-80 transition-opacity"
                                style={{ backgroundColor: getTrafficColor(hour.level) }}
                                title={`${day.day} ${hour.hour}h: ${hour.requests} requêtes`}
                            />
                        ))}
                      </div>
                    </div>
                ))}

                {/* Legend */}
                <div className="mt-6 flex items-center space-x-4">
                  <span className="text-sm text-gray-600">Trafic:</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 rounded" style={{ backgroundColor: '#dcfce7' }}></div>
                    <span className="text-xs text-gray-600">Faible</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 rounded" style={{ backgroundColor: '#fed7aa' }}></div>
                    <span className="text-xs text-gray-600">Moyen</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 rounded" style={{ backgroundColor: '#fecaca' }}></div>
                    <span className="text-xs text-gray-600">Élevé</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 rounded" style={{ backgroundColor: '#dc2626' }}></div>
                    <span className="text-xs text-gray-600">Très élevé</span>
                  </div>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Insights */}
        <Card>
          <CardHeader>
            <CardTitle>Insights</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="space-y-3">
              <div className="p-4 bg-primary-50 rounded-lg">
                <p className="text-sm text-primary-900">
                  💡 Le trafic est plus élevé en semaine entre 9h et 18h
                </p>
              </div>
              <div className="p-4 bg-warning-50 rounded-lg">
                <p className="text-sm text-warning-900">
                  ⚠️ Pic de trafic détecté le mercredi vers 14h
                </p>
              </div>
              <div className="p-4 bg-success-50 rounded-lg">
                <p className="text-sm text-success-900">
                  ✓ Trafic stable le weekend avec peu de variations
                </p>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
  );
};

// ============================================================================
// CLIENTS TAB
// ============================================================================

const ClientsTab = ({ data, onExport }) => {
  if (!data) return <Loading />;

  return (
      <div className="space-y-6">
        <div className="flex justify-end">
          <button
              onClick={() => onExport(data, 'top_clients')}
              className="btn btn-secondary"
          >
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Top 10 Clients par volume de requêtes</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Rang
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Adresse IP
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Requêtes
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Erreurs
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Taux d'erreur
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Latence moy.
                  </th>
                </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                {data.map((client, index) => {
                  const errorRate = (client.errors / client.requests) * 100;
                  return (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center justify-center w-8 h-8 bg-primary-100 text-primary-700 rounded-full font-bold text-sm">
                            {index + 1}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <Users className="w-4 h-4 text-gray-400 mr-2" />
                            <span className="font-medium text-gray-900">
                            {client.ip}
                          </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-gray-900">
                          {formatNumber(client.requests)}
                        </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-danger-600 font-medium">
                          {client.errors}
                        </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge variant={errorRate > 5 ? 'danger' : errorRate > 2 ? 'warning' : 'success'}>
                            {formatPercentage(errorRate)}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`text-sm font-medium ${
                            client.avgLatency > 50 ? 'text-warning-600' : 'text-gray-900'
                        }`}>
                          {formatLatency(client.avgLatency)}
                        </span>
                        </td>
                      </tr>
                  );
                })}
                </tbody>
              </table>
            </div>
          </CardBody>
        </Card>
      </div>
  );
};

// ============================================================================
// TRENDS TAB
// ============================================================================

const TrendsTab = ({ data, onExport }) => {
  if (!data) return <Loading />;

  return (
      <div className="space-y-6">
        <div className="flex justify-end">
          <button
              onClick={() => onExport(data, 'trends')}
              className="btn btn-secondary"
          >
            <Download className="w-4 h-4 mr-2" />
            Export JSON
          </button>
        </div>

        {/* Anomalies */}
        {data.anomalies && data.anomalies.length > 0 && (
            <Card className="border-warning-200 bg-warning-50">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="w-5 h-5 text-warning-600" />
                  <CardTitle className="text-warning-900">
                    Anomalies détectées ({data.anomalies.length})
                  </CardTitle>
                </div>
              </CardHeader>
              <CardBody>
                <div className="space-y-3">
                  {data.anomalies.map((anomaly, index) => (
                      <div key={index} className="p-4 bg-white rounded-lg border border-warning-200">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <Badge variant="warning">{anomaly.metric}</Badge>
                              <span className="text-sm text-gray-600">
                          {formatDate(anomaly.date, 'dd/MM/yyyy HH:mm')}
                        </span>
                            </div>
                            <p className="text-sm font-medium text-gray-900 mb-1">
                              {anomaly.description}
                            </p>
                            <p className="text-sm text-gray-600">
                              💡 Cause probable : {anomaly.rootCause}
                            </p>
                          </div>
                          <div className="ml-4 text-right">
                            <p className="text-lg font-bold text-warning-700">
                              {anomaly.value.toFixed(1)}
                            </p>
                          </div>
                        </div>
                      </div>
                  ))}
                </div>
              </CardBody>
            </Card>
        )}

        {/* Requests trend */}
        <Card>
          <CardHeader>
            <CardTitle>Tendance du volume de requêtes (30 derniers jours)</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.requests}>
                  <defs>
                    <linearGradient id="colorRequests" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis
                      dataKey="date"
                      tickFormatter={(value) => formatDate(value, 'dd/MM')}
                      stroke="#6b7280"
                  />
                  <YAxis stroke="#6b7280" />
                  <Tooltip
                      contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb' }}
                      labelFormatter={(value) => formatDate(value, 'dd/MM/yyyy')}
                      formatter={(value) => [formatNumber(value), 'Requêtes']}
                  />
                  <Area
                      type="monotone"
                      dataKey="requests"
                      stroke="#0ea5e9"
                      fillOpacity={1}
                      fill="url(#colorRequests)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardBody>
        </Card>

        {/* Error rate and latency trends */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Tendance du taux d'erreur</CardTitle>
            </CardHeader>
            <CardBody>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data.requests}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis
                        dataKey="date"
                        tickFormatter={(value) => formatDate(value, 'dd/MM')}
                        stroke="#6b7280"
                    />
                    <YAxis stroke="#6b7280" />
                    <Tooltip
                        contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb' }}
                        formatter={(value) => [formatPercentage(value), 'Taux d\'erreur']}
                    />
                    <Line
                        type="monotone"
                        dataKey="errorRate"
                        stroke="#ef4444"
                        strokeWidth={2}
                        dot={{ fill: '#ef4444', r: 3 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Tendance de la latence moyenne</CardTitle>
            </CardHeader>
            <CardBody>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data.requests}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis
                        dataKey="date"
                        tickFormatter={(value) => formatDate(value, 'dd/MM')}
                        stroke="#6b7280"
                    />
                    <YAxis stroke="#6b7280" />
                    <Tooltip
                        contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb' }}
                        formatter={(value) => [formatLatency(value), 'Latence']}
                    />
                    <Line
                        type="monotone"
                        dataKey="avgLatency"
                        stroke="#f59e0b"
                        strokeWidth={2}
                        dot={{ fill: '#f59e0b', r: 3 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
  );
};

// Helper function (move to component scope if needed)
const getTrafficColor = (level) => {
  const colors = {
    low: '#dcfce7',
    medium: '#fed7aa',
    high: '#fecaca',
    very_high: '#dc2626'
  };
  return colors[level];
};

export default AnalyticsPage;