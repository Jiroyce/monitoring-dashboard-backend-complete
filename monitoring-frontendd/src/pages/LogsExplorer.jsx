import React, { useState, useEffect } from 'react';
import { useAutoRefresh } from '../hooks/useAutoRefresh';
import { logsApi } from '../services/api';
import { Header } from '../components/Header';
import { LogEntry } from '../components/LogEntry';
import { Search, Filter, Download, X, RefreshCw } from 'lucide-react';
import { formatNumber } from '../utils/formatters';

export const LogsExplorer = () => {
  const [filters, setFilters] = useState({
    query: '',
    connector: 'all',
    type: 'all',
    status: '',
    success: null,
    minLatency: '',
    maxLatency: '',
    clientIP: '',
    service: '', // Pour les logs PROCESSING
    page: 1,
    limit: 50,
    sortBy: 'timestamp',
    sortOrder: 'desc'
  });

  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(10000);
  const [showFilters, setShowFilters] = useState(true);

  const { 
    data: logsData, 
    loading, 
    lastUpdate, 
    refresh 
  } = useAutoRefresh(
    () => logsApi.search(filters),
    refreshInterval,
    autoRefresh
  );

  const logs = logsData?.logs || [];
  const total = logsData?.total || 0;
  const totalPages = Math.ceil(total / filters.limit);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1 // Reset to first page when filters change
    }));
  };

  const handleClearFilters = () => {
    setFilters({
      query: '',
      connector: 'all',
      type: 'all',
      status: '',
      success: null,
      minLatency: '',
      maxLatency: '',
      clientIP: '',
      service: '',
      page: 1,
      limit: 50,
      sortBy: 'timestamp',
      sortOrder: 'desc'
    });
  };

  const handleExport = () => {
    // Export logs to JSON
    const dataStr = JSON.stringify(logs, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `logs_${new Date().toISOString()}.json`;
    link.click();
  };

  // Show service filter only for PROCESSING logs
  const showServiceFilter = filters.type === 'PROCESSING';

  return (
    <div className="min-h-screen bg-slate-900">
      <Header lastUpdate={lastUpdate} onRefresh={refresh} refreshing={loading} />
      
      <div className="p-6 space-y-6">
        {/* Top Controls */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white">Explorateur de Logs</h2>
            <p className="text-slate-400 text-sm mt-1">
              {formatNumber(total)} logs trouvés
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg border border-slate-700"
            >
              <Download className="w-4 h-4" />
              Exporter
            </button>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-lg border
                ${showFilters 
                  ? 'bg-blue-600 text-white border-blue-600' 
                  : 'bg-slate-800 text-slate-400 border-slate-700'}
              `}
            >
              <Filter className="w-4 h-4" />
              Filtres
            </button>
          </div>
        </div>

        {/* Auto-refresh Controls */}
        <div className="flex items-center gap-4 bg-slate-800 p-4 rounded-lg border border-slate-700">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="w-4 h-4 rounded"
            />
            <span className="text-sm text-slate-400">Actualisation automatique</span>
          </label>

          {autoRefresh && (
            <>
              <span className="text-slate-600">|</span>
              <span className="text-sm text-slate-400">Intervalle:</span>
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
            </>
          )}
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white">Filtres de Recherche</h3>
              <button
                onClick={handleClearFilters}
                className="flex items-center gap-2 text-sm text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
                Effacer tout
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Search Query */}
              <div>
                <label className="block text-sm text-slate-400 mb-2">Recherche</label>
                <input
                  type="text"
                  value={filters.query}
                  onChange={(e) => handleFilterChange('query', e.target.value)}
                  placeholder="Path, IP, MessageId..."
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                />
              </div>

              {/* Connector */}
              <div>
                <label className="block text-sm text-slate-400 mb-2">Connecteur</label>
                <select
                  value={filters.connector}
                  onChange={(e) => handleFilterChange('connector', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                >
                  <option value="all">Tous</option>
                  <option value="pi-gateway">Pi-Gateway</option>
                  <option value="pi-connector">Pi-Connector</option>
                </select>
              </div>

              {/* Type */}
              <div>
                <label className="block text-sm text-slate-400 mb-2">Type</label>
                <select
                  value={filters.type}
                  onChange={(e) => handleFilterChange('type', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                >
                  <option value="all">Tous</option>
                  <option value="API_IN">API_IN</option>
                  <option value="API_OUT">API_OUT</option>
                  <option value="PROCESSING">PROCESSING</option>
                  <option value="AUTH">AUTH</option>
                </select>
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm text-slate-400 mb-2">Status Code</label>
                <input
                  type="text"
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  placeholder="200, 404, 5xx..."
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                />
              </div>

              {/* Success */}
              <div>
                <label className="block text-sm text-slate-400 mb-2">Succès</label>
                <select
                  value={filters.success === null ? '' : filters.success}
                  onChange={(e) => handleFilterChange('success', e.target.value === '' ? null : e.target.value === 'true')}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                >
                  <option value="">Tous</option>
                  <option value="true">Succès uniquement</option>
                  <option value="false">Erreurs uniquement</option>
                </select>
              </div>

              {/* Min Latency */}
              <div>
                <label className="block text-sm text-slate-400 mb-2">Latence min (ms)</label>
                <input
                  type="number"
                  value={filters.minLatency}
                  onChange={(e) => handleFilterChange('minLatency', e.target.value)}
                  placeholder="0"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                />
              </div>

              {/* Max Latency */}
              <div>
                <label className="block text-sm text-slate-400 mb-2">Latence max (ms)</label>
                <input
                  type="number"
                  value={filters.maxLatency}
                  onChange={(e) => handleFilterChange('maxLatency', e.target.value)}
                  placeholder="1000"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                />
              </div>

              {/* Client IP */}
              <div>
                <label className="block text-sm text-slate-400 mb-2">IP Client</label>
                <input
                  type="text"
                  value={filters.clientIP}
                  onChange={(e) => handleFilterChange('clientIP', e.target.value)}
                  placeholder="35.197.32.224"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                />
              </div>

              {/* Service (only for PROCESSING) */}
              {showServiceFilter && (
                <div className="col-span-1 md:col-span-2 lg:col-span-1">
                  <label className="block text-sm text-emerald-400 mb-2 font-medium">
                    🔧 Service (PROCESSING)
                  </label>
                  <input
                    type="text"
                    value={filters.service}
                    onChange={(e) => handleFilterChange('service', e.target.value)}
                    placeholder="payment-service, notification-service..."
                    className="w-full px-3 py-2 bg-slate-900 border border-emerald-500/50 rounded-lg text-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              )}
            </div>

            {/* Sort Options */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-slate-700">
              <div>
                <label className="block text-sm text-slate-400 mb-2">Trier par</label>
                <select
                  value={filters.sortBy}
                  onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                >
                  <option value="timestamp">Timestamp</option>
                  <option value="latency">Latence</option>
                </select>
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-2">Ordre</label>
                <select
                  value={filters.sortOrder}
                  onChange={(e) => handleFilterChange('sortOrder', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                >
                  <option value="desc">Plus récent d'abord</option>
                  <option value="asc">Plus ancien d'abord</option>
                </select>
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-2">Résultats par page</label>
                <select
                  value={filters.limit}
                  onChange={(e) => handleFilterChange('limit', Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                >
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                  <option value={200}>200</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Logs List */}
        <div className="space-y-3">
          {loading && logs.length === 0 ? (
            <div className="text-center py-12">
              <RefreshCw className="w-8 h-8 text-blue-400 animate-spin mx-auto mb-4" />
              <p className="text-slate-400">Chargement des logs...</p>
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-12 bg-slate-800 border border-slate-700 rounded-lg">
              <Search className="w-12 h-12 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400">Aucun log trouvé</p>
              <p className="text-slate-500 text-sm mt-2">Essayez de modifier vos filtres</p>
            </div>
          ) : (
            logs.map((log, index) => (
              <LogEntry 
                key={`${log.timestamp}-${index}`} 
                log={log}
                onClick={(log) => console.log('Log clicked:', log)}
              />
            ))
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={() => handleFilterChange('page', Math.max(1, filters.page - 1))}
              disabled={filters.page === 1}
              className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-700"
            >
              Précédent
            </button>

            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (filters.page <= 3) {
                  pageNum = i + 1;
                } else if (filters.page >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = filters.page - 2 + i;
                }

                return (
                  <button
                    key={pageNum}
                    onClick={() => handleFilterChange('page', pageNum)}
                    className={`
                      px-4 py-2 rounded-lg border
                      ${filters.page === pageNum
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'}
                    `}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => handleFilterChange('page', Math.min(totalPages, filters.page + 1))}
              disabled={filters.page === totalPages}
              className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-700"
            >
              Suivant
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
