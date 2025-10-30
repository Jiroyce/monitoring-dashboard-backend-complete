import React, { useState, useEffect } from 'react';
import { Search, Filter, Download, RefreshCw, Calendar, Server, AlertTriangle } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import api from '../services/api';

const LogsExplorer = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    query: '',
    connector: 'all',
    type: 'all',
    status: '',
    success: null,
    minLatency: '',
    maxLatency: '',
    clientIP: '',
    service: '', // NOUVEAU: filtre par service pour les logs PROCESSING
    startTime: '',
    endTime: '',
    page: 1,
    limit: 50,
    sortBy: 'timestamp',
    sortOrder: 'desc'
  });
  const [showFilters, setShowFilters] = useState(true);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const cleanFilters = Object.fromEntries(
        Object.entries(filters).filter(([_, v]) => v !== '' && v !== null && v !== 'all')
      );
      const data = await api.searchLogs(cleanFilters);
      setLogs(data.logs || []);
    } catch (error) {
      console.error('Error fetching logs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [filters.page, filters.sortBy, filters.sortOrder]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchLogs();
  };

  const resetFilters = () => {
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
      startTime: '',
      endTime: '',
      page: 1,
      limit: 50,
      sortBy: 'timestamp',
      sortOrder: 'desc'
    });
  };

  const exportToCSV = () => {
    const headers = ['Timestamp', 'Connector', 'Type', 'Service', 'Method', 'Path', 'Status', 'Latency', 'Client IP'];
    const rows = logs.map(log => [
      log.timestamp,
      log.connector,
      log.type,
      log.service || '',
      log.method,
      log.path,
      log.status,
      log.latency_ms,
      log.client_ip
    ]);
    
    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `logs_${new Date().toISOString()}.csv`;
    a.click();
  };

  const getStatusColor = (status) => {
    if (status >= 200 && status < 300) return 'text-green-600 bg-green-100';
    if (status >= 400 && status < 500) return 'text-yellow-600 bg-yellow-100';
    if (status >= 500) return 'text-red-600 bg-red-100';
    return 'text-gray-600 bg-gray-100';
  };

  const getTypeColor = (type) => {
    const colors = {
      'API_IN': 'text-blue-600 bg-blue-100',
      'API_OUT': 'text-green-600 bg-green-100',
      'AUTH': 'text-purple-600 bg-purple-100',
      'PROCESSING': 'text-orange-600 bg-orange-100',
    };
    return colors[type] || 'text-gray-600 bg-gray-100';
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Logs Explorer</h1>
          <p className="text-gray-600 mt-1">Search and analyze logs with advanced filters</p>
        </div>
        <div className="flex space-x-2">
          <button 
            onClick={exportToCSV}
            className="btn-secondary flex items-center space-x-2"
          >
            <Download size={16} />
            <span>Export CSV</span>
          </button>
          <button 
            onClick={fetchLogs}
            className="btn-primary flex items-center space-x-2"
          >
            <RefreshCw size={16} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <form onSubmit={handleSearch} className="card">
        <div className="flex items-center space-x-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search by path, IP, messageId..."
              value={filters.query}
              onChange={(e) => handleFilterChange('query', e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <button 
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className={`px-4 py-3 rounded-lg font-medium transition-colors flex items-center space-x-2 ${
              showFilters ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
            }`}
          >
            <Filter size={20} />
            <span>Filters</span>
          </button>
          <button type="submit" className="btn-primary">
            Search
          </button>
        </div>
      </form>

      {/* Advanced Filters */}
      {showFilters && (
        <div className="card">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Connector */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Connector</label>
              <select
                value={filters.connector}
                onChange={(e) => handleFilterChange('connector', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All</option>
                <option value="pi-gateway">Pi-Gateway</option>
                <option value="pi-connector">Pi-Connector</option>
              </select>
            </div>

            {/* Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Log Type</label>
              <select
                value={filters.type}
                onChange={(e) => handleFilterChange('type', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Types</option>
                <option value="API_IN">API_IN</option>
                <option value="API_OUT">API_OUT</option>
                <option value="AUTH">AUTH</option>
                <option value="PROCESSING">PROCESSING</option>
              </select>
            </div>

            {/* Service (pour PROCESSING) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Service
                <span className="text-xs text-gray-500 ml-1">(for PROCESSING logs)</span>
              </label>
              <input
                type="text"
                placeholder="payment-service, etc."
                value={filters.service}
                onChange={(e) => handleFilterChange('service', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Status Code */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status Code</label>
              <input
                type="text"
                placeholder="200, 404, 5xx..."
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Success/Failure */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Success</label>
              <select
                value={filters.success === null ? '' : filters.success}
                onChange={(e) => handleFilterChange('success', e.target.value === '' ? null : e.target.value === 'true')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All</option>
                <option value="true">Success</option>
                <option value="false">Failures</option>
              </select>
            </div>

            {/* Min Latency */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Min Latency (ms)</label>
              <input
                type="number"
                placeholder="0"
                value={filters.minLatency}
                onChange={(e) => handleFilterChange('minLatency', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Max Latency */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Max Latency (ms)</label>
              <input
                type="number"
                placeholder="1000"
                value={filters.maxLatency}
                onChange={(e) => handleFilterChange('maxLatency', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Client IP */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Client IP</label>
              <input
                type="text"
                placeholder="192.168.1.1"
                value={filters.clientIP}
                onChange={(e) => handleFilterChange('clientIP', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex justify-end mt-4 space-x-2">
            <button onClick={resetFilters} className="btn-secondary">
              Reset Filters
            </button>
          </div>
        </div>
      )}

      {/* Sort Controls */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-gray-700">Sort by:</span>
          <select
            value={filters.sortBy}
            onChange={(e) => handleFilterChange('sortBy', e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="timestamp">Timestamp</option>
            <option value="latency">Latency</option>
          </select>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-gray-700">Order:</span>
          <select
            value={filters.sortOrder}
            onChange={(e) => handleFilterChange('sortOrder', e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="desc">Newest First</option>
            <option value="asc">Oldest First</option>
          </select>
        </div>
        <div className="text-sm text-gray-600">
          Showing {logs.length} logs
        </div>
      </div>

      {/* Logs Table */}
      <div className="card overflow-hidden">
        {loading ? (
          <LoadingSpinner message="Searching logs..." />
        ) : logs.length === 0 ? (
          <div className="text-center py-12">
            <AlertTriangle size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600 text-lg">No logs found</p>
            <p className="text-gray-500 text-sm mt-2">Try adjusting your filters</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Timestamp</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Connector</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Type</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Service</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Method</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Path</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Latency</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Client IP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {logs.map((log, index) => (
                  <tr key={index} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span className="badge badge-info">{log.connector}</span>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getTypeColor(log.type)}`}>
                        {log.type}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {log.service || '-'}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span className="font-mono font-semibold text-gray-700">{log.method}</span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 max-w-xs truncate">
                      {log.path}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(log.status)}`}>
                        {log.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {log.latency_ms}ms
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 font-mono">
                      {log.client_ip || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => handleFilterChange('page', Math.max(1, filters.page - 1))}
          disabled={filters.page === 1}
          className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Previous
        </button>
        <span className="text-sm text-gray-600">
          Page {filters.page}
        </span>
        <button
          onClick={() => handleFilterChange('page', filters.page + 1)}
          disabled={logs.length < filters.limit}
          className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default LogsExplorer;
