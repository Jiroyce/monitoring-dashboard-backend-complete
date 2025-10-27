import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Download, 
  RefreshCw,
  Eye,
  AlertCircle,
  CheckCircle,
  Clock,
  MapPin
} from 'lucide-react';
import { logsApi } from '../services/api';
import {
  formatDate,
  formatLatency,
  getStatusCodeColor,
  getLogTypeLabel,
  exportToCSV,
  exportToJSON
} from '../utils/helpers';
import {
  Card,
  CardHeader,
  CardBody,
  CardTitle,
  Badge,
  Loading,
  ErrorState,
  EmptyState
} from '../components/ui';
import toast from 'react-hot-toast';

const LogsPage = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [logs, setLogs] = useState([]);
  const [summary, setSummary] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 50,
    total: 0,
    pages: 0
  });

  // Filtres
  const [filters, setFilters] = useState({
    query: '',
    connector: 'all',
    type: 'all',
    status: '',
    success: null,
    minLatency: '',
    maxLatency: '',
    clientIp: '',
    sortBy: 'timestamp',
    sortOrder: 'desc'
  });

  const [showFilters, setShowFilters] = useState(false);

  // Charger les logs
  const loadLogs = async (page = 1) => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        ...filters,
        page,
        limit: pagination.limit,
        success: filters.success === 'true' ? true : filters.success === 'false' ? false : null,
        minLatency: filters.minLatency ? parseInt(filters.minLatency) : null,
        maxLatency: filters.maxLatency ? parseInt(filters.maxLatency) : null,
      };

      // Retirer les valeurs vides
      Object.keys(params).forEach(key => {
        if (params[key] === '' || params[key] === null || params[key] === 'all') {
          delete params[key];
        }
      });

      const response = await logsApi.searchLogs(params);
      const data = response.data;

      setLogs(data.logs || []);
      setSummary(data.summary || null);
      setPagination({
        page: data.page,
        limit: data.limit,
        total: data.total,
        pages: data.pages
      });
    } catch (err) {
      console.error('Error loading logs:', err);
      setError(err.message || 'Erreur lors du chargement des logs');
      toast.error('Impossible de charger les logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, []);

  const handleSearch = () => {
    loadLogs(1);
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handlePageChange = (newPage) => {
    loadLogs(newPage);
  };

  const handleExport = (format) => {
    if (logs.length === 0) {
      toast.error('Aucun log à exporter');
      return;
    }

    const exportData = logs.map(log => ({
      timestamp: formatDate(log.timestamp),
      type: log.type,
      connector: log.connector,
      method: log.method,
      path: log.path,
      statusCode: log.statusCode,
      success: log.success ? 'Oui' : 'Non',
      responseTime: log.responseTimeMs,
      clientIp: log.clientIp,
      messageId: log.messageId,
      endToEndId: log.endToEndId
    }));

    if (format === 'csv') {
      exportToCSV(exportData, `logs_${Date.now()}`);
    } else {
      exportToJSON(exportData, `logs_${Date.now()}`);
    }

    toast.success(`Export ${format.toUpperCase()} réussi`);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Logs</h1>
          <p className="mt-1 text-sm text-gray-500">
            Recherche et exploration des logs en temps réel
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => handleExport('csv')}
            className="btn btn-secondary"
            disabled={logs.length === 0}
          >
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </button>
          <button
            onClick={() => handleExport('json')}
            className="btn btn-secondary"
            disabled={logs.length === 0}
          >
            <Download className="w-4 h-4 mr-2" />
            Export JSON
          </button>
        </div>
      </div>

      {/* Summary */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardBody>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Taux de succès</p>
                  <p className="mt-1 text-2xl font-bold text-success-600">
                    {summary.successRate.toFixed(2)}%
                  </p>
                </div>
                <CheckCircle className="w-8 h-8 text-success-600" />
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Latence moyenne</p>
                  <p className="mt-1 text-2xl font-bold text-primary-600">
                    {formatLatency(summary.avgLatencyMs)}
                  </p>
                </div>
                <Clock className="w-8 h-8 text-primary-600" />
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Erreurs</p>
                  <p className="mt-1 text-2xl font-bold text-danger-600">
                    {summary.errorCount}
                  </p>
                </div>
                <AlertCircle className="w-8 h-8 text-danger-600" />
              </div>
            </CardBody>
          </Card>
        </div>
      )}

      {/* Search & Filters */}
      <Card>
        <CardBody>
          <div className="space-y-4">
            {/* Search bar */}
            <div className="flex items-center space-x-3">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Rechercher par path, IP, messageId..."
                    value={filters.query}
                    onChange={(e) => handleFilterChange('query', e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>

              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`btn ${showFilters ? 'btn-primary' : 'btn-secondary'}`}
              >
                <Filter className="w-4 h-4 mr-2" />
                Filtres
              </button>

              <button
                onClick={handleSearch}
                disabled={loading}
                className="btn btn-primary"
              >
                <Search className="w-4 h-4 mr-2" />
                Rechercher
              </button>

              <button
                onClick={() => loadLogs(pagination.page)}
                disabled={loading}
                className="btn btn-secondary"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>

            {/* Advanced filters */}
            {showFilters && (
              <div className="pt-4 border-t border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Connector
                    </label>
                    <select
                      value={filters.connector}
                      onChange={(e) => handleFilterChange('connector', e.target.value)}
                      className="select"
                    >
                      <option value="all">Tous</option>
                      <option value="pi-gateway">PI Gateway</option>
                      <option value="pi-connector">PI Connector</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Type
                    </label>
                    <select
                      value={filters.type}
                      onChange={(e) => handleFilterChange('type', e.target.value)}
                      className="select"
                    >
                      <option value="all">Tous</option>
                      <option value="API_IN">API Entrante</option>
                      <option value="API_OUT">API Sortante</option>
                      <option value="AUTH">Authentification</option>
                      <option value="PROCESSING">Traitement</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <select
                      value={filters.status}
                      onChange={(e) => handleFilterChange('status', e.target.value)}
                      className="select"
                    >
                      <option value="">Tous</option>
                      <option value="200">200 OK</option>
                      <option value="4xx">4xx Client Error</option>
                      <option value="5xx">5xx Server Error</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Succès
                    </label>
                    <select
                      value={filters.success || ''}
                      onChange={(e) => handleFilterChange('success', e.target.value)}
                      className="select"
                    >
                      <option value="">Tous</option>
                      <option value="true">Succès uniquement</option>
                      <option value="false">Erreurs uniquement</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Latence min (ms)
                    </label>
                    <input
                      type="number"
                      value={filters.minLatency}
                      onChange={(e) => handleFilterChange('minLatency', e.target.value)}
                      placeholder="0"
                      className="input"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Latence max (ms)
                    </label>
                    <input
                      type="number"
                      value={filters.maxLatency}
                      onChange={(e) => handleFilterChange('maxLatency', e.target.value)}
                      placeholder="1000"
                      className="input"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      IP Client
                    </label>
                    <input
                      type="text"
                      value={filters.clientIp}
                      onChange={(e) => handleFilterChange('clientIp', e.target.value)}
                      placeholder="192.168.1.1"
                      className="input"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Trier par
                    </label>
                    <select
                      value={filters.sortBy}
                      onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                      className="select"
                    >
                      <option value="timestamp">Date</option>
                      <option value="latency">Latence</option>
                    </select>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-end space-x-3">
                  <button
                    onClick={() => {
                      setFilters({
                        query: '',
                        connector: 'all',
                        type: 'all',
                        status: '',
                        success: null,
                        minLatency: '',
                        maxLatency: '',
                        clientIp: '',
                        sortBy: 'timestamp',
                        sortOrder: 'desc'
                      });
                      setShowFilters(false);
                    }}
                    className="btn btn-secondary"
                  >
                    Réinitialiser
                  </button>
                  <button
                    onClick={() => {
                      handleSearch();
                      setShowFilters(false);
                    }}
                    className="btn btn-primary"
                  >
                    Appliquer les filtres
                  </button>
                </div>
              </div>
            )}
          </div>
        </CardBody>
      </Card>

      {/* Logs Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>
              Résultats ({pagination.total} logs)
            </CardTitle>
            <div className="text-sm text-gray-500">
              Page {pagination.page} sur {pagination.pages}
            </div>
          </div>
        </CardHeader>
        <CardBody className="p-0">
          {loading && !logs.length ? (
            <Loading text="Chargement des logs..." />
          ) : error ? (
            <ErrorState
              title="Erreur de chargement"
              message={error}
              onRetry={() => loadLogs(pagination.page)}
            />
          ) : logs.length === 0 ? (
            <EmptyState
              icon={Search}
              title="Aucun log trouvé"
              description="Essayez de modifier vos critères de recherche"
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Timestamp
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Connector
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Méthode & Path
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Latence
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      IP Client
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {logs.map((log) => (
                    <tr
                      key={log.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(log.timestamp, 'dd/MM HH:mm:ss')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge variant="info">
                          {getLogTypeLabel(log.type)}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {log.connector}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        <div>
                          <span className="font-medium">{log.method}</span>
                          <span className="ml-2 text-gray-600">{log.path}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge variant={getStatusCodeColor(log.statusCode)}>
                          {log.statusCode}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={
                          log.responseTimeMs > 100
                            ? 'text-warning-600 font-medium'
                            : 'text-gray-900'
                        }>
                          {formatLatency(log.responseTimeMs)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        <div className="flex items-center">
                          <MapPin className="w-4 h-4 mr-1" />
                          {log.clientIp}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button
                          onClick={() => window.open(`/logs/${log.id}`, '_blank')}
                          className="text-primary-600 hover:text-primary-700"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardBody>
      </Card>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Affichage de {((pagination.page - 1) * pagination.limit) + 1} à{' '}
            {Math.min(pagination.page * pagination.limit, pagination.total)} sur{' '}
            {pagination.total} résultats
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
              className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Précédent
            </button>

            {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
              const page = i + 1;
              return (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`px-4 py-2 border rounded-lg ${
                    pagination.page === page
                      ? 'bg-primary-600 text-white border-primary-600'
                      : 'border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {page}
                </button>
              );
            })}

            <button
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page === pagination.pages}
              className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Suivant
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LogsPage;
