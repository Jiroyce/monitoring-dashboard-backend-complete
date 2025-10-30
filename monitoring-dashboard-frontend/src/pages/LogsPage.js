import React, { useState, useEffect } from 'react';
import { Search, Filter, RefreshCw, Download, Clock, Server, AlertTriangle, Info } from 'lucide-react';
import axios from 'axios';
import { format } from 'date-fns';
import './LogsPage.css';

const API_BASE_URL = 'http://localhost:8080/api';
const REFRESH_INTERVAL = 5000; // 5 secondes

function LogsPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  
  // Filtres
  const [filters, setFilters] = useState({
    query: '',
    connector: 'all',
    type: 'all',
    status: '',
    success: null,
    minLatency: '',
    maxLatency: '',
    clientIP: '',
    service: '', // Pour PROCESSING uniquement
    page: 1,
    limit: 50,
    sortBy: 'timestamp',
    sortOrder: 'desc'
  });

  const [pagination, setPagination] = useState({
    total: 0,
    pages: 0,
    currentPage: 1
  });

  const [autoRefresh, setAutoRefresh] = useState(true);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const params = {};
      
      // Construire les params
      Object.keys(filters).forEach(key => {
        if (filters[key] !== '' && filters[key] !== null && filters[key] !== 'all') {
          params[key] = filters[key];
        }
      });

      const response = await axios.get(`${API_BASE_URL}/logs/search`, { params });
      
      setLogs(response.data.logs || []);
      setPagination({
        total: response.data.total || 0,
        pages: response.data.pages || 0,
        currentPage: response.data.page || 1
      });
      setLastUpdate(new Date());
      setError(null);
    } catch (err) {
      console.error('Error fetching logs:', err);
      setError('Erreur de connexion au backend');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
    if (autoRefresh) {
      const interval = setInterval(fetchLogs, REFRESH_INTERVAL);
      return () => clearInterval(interval);
    }
  }, [filters, autoRefresh]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
  };

  const handlePageChange = (newPage) => {
    setFilters(prev => ({ ...prev, page: newPage }));
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
      page: 1,
      limit: 50,
      sortBy: 'timestamp',
      sortOrder: 'desc'
    });
  };

  const exportLogs = () => {
    const headers = ['Timestamp', 'Type', 'Connector', 'Method', 'Path', 'Status', 'Success', 'Latency (ms)', 'Client IP'];
    
    // Ajouter les colonnes spécifiques pour PROCESSING
    if (filters.type === 'PROCESSING' || filters.type === 'all') {
      headers.push('Service', 'MessageId', 'EndToEndId');
    }

    const csv = [
      headers.join(','),
      ...logs.map(log => {
        const baseData = [
          format(new Date(log.timestamp), 'yyyy-MM-dd HH:mm:ss'),
          log.type,
          log.connector,
          log.method,
          `"${log.path || ''}"`,
          log.statusCode,
          log.success,
          log.responseTimeMs,
          log.clientIp || ''
        ];
        
        // Ajouter les données PROCESSING si nécessaire
        if (log.type === 'PROCESSING') {
          baseData.push(log.service || '', log.messageId || '', log.endToEndId || '');
        } else if (filters.type === 'all') {
          baseData.push('', '', '');
        }
        
        return baseData.join(',');
      })
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `logs-${format(new Date(), 'yyyy-MM-dd-HHmmss')}.csv`;
    a.click();
  };

  // Info sur les types de logs
  const getLogTypeInfo = (type) => {
    const info = {
      'API_IN': { connector: 'pi-gateway', desc: 'Requêtes entrantes', color: '#3b82f6' },
      'API_OUT': { connector: 'pi-connector', desc: 'Requêtes sortantes', color: '#10b981' },
      'AUTH': { connector: 'both', desc: 'Authentification', color: '#f59e0b' },
      'PROCESSING': { connector: 'both', desc: 'Traitement métier', color: '#ec4899' }
    };
    return info[type] || { connector: 'all', desc: 'Tous', color: '#64748b' };
  };

  return (
    <div className="logs-page">
      {/* Header */}
      <div className="logs-header">
        <div>
          <h1>Logs en Temps Réel</h1>
          <p className="subtitle">Exploration détaillée des logs par type et connecteur</p>
          
          {/* Info Box */}
          <div className="info-box">
            <Info size={16} />
            <span>
              <strong>API_IN</strong> = PI-Gateway (entrées) • 
              <strong> API_OUT</strong> = PI-Connector (sorties) • 
              <strong> PROCESSING</strong> = Traitement (avec service)
            </span>
          </div>
        </div>
        <div className="header-actions">
          <div className={`realtime-indicator ${!autoRefresh ? 'paused' : ''}`}>
            <div className={`realtime-dot ${!autoRefresh ? 'paused' : ''}`}></div>
            <span>{autoRefresh ? 'LIVE' : 'PAUSE'} - {format(lastUpdate, 'HH:mm:ss')}</span>
          </div>
          <button 
            className={`btn ${autoRefresh ? 'btn-secondary' : 'btn-primary'}`}
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            <RefreshCw size={18} />
            {autoRefresh ? 'Pause' : 'Auto-refresh'}
          </button>
          <button className="btn btn-secondary" onClick={exportLogs} disabled={logs.length === 0}>
            <Download size={18} />
            Export CSV
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="filters-section">
        <h3 className="filters-title">
          <Filter size={20} />
          Filtres de Recherche
        </h3>
        
        <div className="filters-grid">
          {/* Search */}
          <div className="filter-group">
            <label>
              <Search size={16} />
              Recherche
            </label>
            <input
              type="text"
              placeholder="messageId, path, IP..."
              value={filters.query}
              onChange={(e) => handleFilterChange('query', e.target.value)}
            />
          </div>

          {/* Type */}
          <div className="filter-group">
            <label>
              <Filter size={16} />
              Type de Log
            </label>
            <select
              value={filters.type}
              onChange={(e) => handleFilterChange('type', e.target.value)}
            >
              <option value="all">Tous les types</option>
              <option value="API_IN">API_IN (PI-Gateway - entrées)</option>
              <option value="API_OUT">API_OUT (PI-Connector - sorties)</option>
              <option value="AUTH">AUTH (Authentification)</option>
              <option value="PROCESSING">PROCESSING (Traitement)</option>
            </select>
          </div>

          {/* Connector */}
          <div className="filter-group">
            <label>
              <Server size={16} />
              Connecteur
            </label>
            <select
              value={filters.connector}
              onChange={(e) => handleFilterChange('connector', e.target.value)}
            >
              <option value="all">Tous</option>
              <option value="pi-gateway">PI-Gateway</option>
              <option value="pi-connector">PI-Connector</option>
            </select>
          </div>

          {/* Service (PROCESSING only) */}
          {filters.type === 'PROCESSING' && (
            <div className="filter-group filter-highlight">
              <label>
                <Server size={16} />
                Service (PROCESSING)
              </label>
              <input
                type="text"
                placeholder="payment-service, order-service..."
                value={filters.service}
                onChange={(e) => handleFilterChange('service', e.target.value)}
              />
            </div>
          )}

          {/* Status Code */}
          <div className="filter-group">
            <label>Status Code</label>
            <input
              type="text"
              placeholder="200, 404, 5xx..."
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
            />
          </div>

          {/* Success */}
          <div className="filter-group">
            <label>Résultat</label>
            <select
              value={filters.success === null ? '' : filters.success}
              onChange={(e) => handleFilterChange('success', e.target.value === '' ? null : e.target.value === 'true')}
            >
              <option value="">Tous</option>
              <option value="true">Succès</option>
              <option value="false">Erreurs</option>
            </select>
          </div>

          {/* Min Latency */}
          <div className="filter-group">
            <label>Latence Min (ms)</label>
            <input
              type="number"
              placeholder="0"
              value={filters.minLatency}
              onChange={(e) => handleFilterChange('minLatency', e.target.value)}
            />
          </div>

          {/* Max Latency */}
          <div className="filter-group">
            <label>Latence Max (ms)</label>
            <input
              type="number"
              placeholder="1000"
              value={filters.maxLatency}
              onChange={(e) => handleFilterChange('maxLatency', e.target.value)}
            />
          </div>

          {/* Client IP */}
          <div className="filter-group">
            <label>Client IP</label>
            <input
              type="text"
              placeholder="192.168.1.1"
              value={filters.clientIP}
              onChange={(e) => handleFilterChange('clientIP', e.target.value)}
            />
          </div>
        </div>

        <div className="filter-actions">
          <button className="btn btn-secondary" onClick={resetFilters}>
            Réinitialiser
          </button>
          <button className="btn btn-primary" onClick={fetchLogs}>
            <Search size={18} />
            Rechercher
          </button>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="logs-stats">
        <div className="stat-item">
          <span className="stat-label">Total Trouvés</span>
          <span className="stat-value">{pagination.total.toLocaleString()}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Page</span>
          <span className="stat-value">{pagination.currentPage} / {pagination.pages}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Affichés</span>
          <span className="stat-value">{logs.length}</span>
        </div>
      </div>

      {/* Logs Table */}
      {loading ? (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Chargement des logs...</p>
        </div>
      ) : error ? (
        <div className="error-container">
          <AlertTriangle size={48} color="#ef4444" />
          <h2>Erreur</h2>
          <p>{error}</p>
          <button className="btn btn-primary" onClick={fetchLogs}>
            Réessayer
          </button>
        </div>
      ) : logs.length === 0 ? (
        <div className="empty-state">
          <Filter size={64} color="#64748b" />
          <h2>Aucun log trouvé</h2>
          <p>Essayez de modifier vos filtres</p>
        </div>
      ) : (
        <>
          <div className="logs-table-container">
            <table className="logs-table">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Type</th>
                  <th>Connector</th>
                  {(filters.type === 'PROCESSING' || filters.type === 'all') && <th>Service</th>}
                  <th>Method</th>
                  <th>Path</th>
                  <th>Status</th>
                  <th>Latence</th>
                  <th>Success</th>
                  {filters.type === 'API_IN' && <th>Client IP</th>}
                  {(filters.type === 'PROCESSING' || filters.type === 'all') && (
                    <>
                      <th>MessageId</th>
                      <th>EndToEndId</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody>
                {logs.map((log, idx) => (
                  <tr key={log.id || idx} className="log-row">
                    <td className="timestamp-cell">
                      <Clock size={14} />
                      {format(new Date(log.timestamp), 'dd/MM HH:mm:ss')}
                    </td>
                    <td>
                      <span 
                        className={`badge badge-${getTypeBadgeClass(log.type)}`}
                        style={{ borderColor: getLogTypeInfo(log.type).color }}
                      >
                        {log.type}
                      </span>
                    </td>
                    <td>
                      <span className={`connector-badge connector-${log.connector}`}>
                        {log.connector}
                      </span>
                    </td>
                    {(filters.type === 'PROCESSING' || filters.type === 'all') && (
                      <td>
                        {log.type === 'PROCESSING' ? (
                          <span className="service-badge">{log.service || '-'}</span>
                        ) : (
                          <span className="text-muted">-</span>
                        )}
                      </td>
                    )}
                    <td>
                      <span className={`method-badge method-${log.method?.toLowerCase()}`}>
                        {log.method}
                      </span>
                    </td>
                    <td className="path-cell" title={log.path}>
                      {truncatePath(log.path)}
                    </td>
                    <td>
                      <span className={`status-badge status-${getStatusClass(log.statusCode)}`}>
                        {log.statusCode}
                      </span>
                    </td>
                    <td className={`latency-cell ${getLatencyClass(log.responseTimeMs)}`}>
                      {log.responseTimeMs?.toFixed(0)}ms
                    </td>
                    <td>
                      {log.success ? (
                        <span className="badge badge-success">✓</span>
                      ) : (
                        <span className="badge badge-error">✗</span>
                      )}
                    </td>
                    {filters.type === 'API_IN' && (
                      <td className="ip-cell">{log.clientIp || '-'}</td>
                    )}
                    {(filters.type === 'PROCESSING' || filters.type === 'all') && (
                      <>
                        <td className="id-cell" title={log.messageId}>
                          {log.type === 'PROCESSING' ? truncateId(log.messageId) : '-'}
                        </td>
                        <td className="id-cell" title={log.endToEndId}>
                          {log.type === 'PROCESSING' ? truncateId(log.endToEndId) : '-'}
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="pagination">
              <button
                className="btn btn-secondary"
                onClick={() => handlePageChange(pagination.currentPage - 1)}
                disabled={pagination.currentPage === 1}
              >
                Précédent
              </button>
              <span className="page-info">
                Page {pagination.currentPage} sur {pagination.pages}
              </span>
              <button
                className="btn btn-secondary"
                onClick={() => handlePageChange(pagination.currentPage + 1)}
                disabled={pagination.currentPage === pagination.pages}
              >
                Suivant
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// Helper functions
function getTypeBadgeClass(type) {
  const classes = {
    'API_IN': 'info',
    'API_OUT': 'success',
    'AUTH': 'warning',
    'PROCESSING': 'processing'
  };
  return classes[type] || 'info';
}

function getStatusClass(status) {
  if (status >= 200 && status < 300) return 'success';
  if (status >= 300 && status < 400) return 'info';
  if (status >= 400 && status < 500) return 'warning';
  if (status >= 500) return 'error';
  return 'info';
}

function getLatencyClass(latency) {
  if (!latency) return '';
  if (latency < 100) return 'latency-good';
  if (latency < 500) return 'latency-medium';
  return 'latency-bad';
}

function truncatePath(path) {
  if (!path) return '-';
  if (path.length <= 50) return path;
  return path.substring(0, 47) + '...';
}

function truncateId(id) {
  if (!id) return '-';
  if (id.length <= 12) return id;
  return id.substring(0, 12) + '...';
}

export default LogsPage;
