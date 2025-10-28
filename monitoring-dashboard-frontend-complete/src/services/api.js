import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor pour gérer les erreurs
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
      console.error('API Error:', error);
      if (error.response) {
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
      }
      return Promise.reject(error);
    }
);

// ============================================================================
// METRICS API
// ============================================================================

export const metricsApi = {
  // Get all metrics
  getMetrics: (params) => apiClient.get('/metrics', { params }),

  // Get metrics for specific connector
  getConnectorMetrics: (connector, params) =>
      apiClient.get(`/metrics/connector/${connector}`, { params }),

  // Get real-time metrics
  getRealTimeMetrics: () => apiClient.get('/metrics/realtime'),

  // Get historical metrics
  getHistoricalMetrics: (timeRange, connector) =>
      apiClient.get('/metrics/historical', {
        params: { timeRange, connector }
      }),
};

// ============================================================================
// LOGS API
// ============================================================================

export const logsApi = {
  // Search logs with filters
  searchLogs: (filters) => apiClient.post('/logs/search', filters),

  // Get log by ID
  getLogById: (id) => apiClient.get(`/logs/${id}`),

  // Get recent logs
  getRecentLogs: (limit = 100, connector) =>
      apiClient.get('/logs/recent', {
        params: { limit, connector }
      }),

  // Get logs by time range
  getLogsByTimeRange: (startTime, endTime, connector) =>
      apiClient.get('/logs/range', {
        params: { startTime, endTime, connector }
      }),

  // Export logs
  exportLogs: (filters, format = 'json') =>
      apiClient.post('/logs/export', filters, {
        params: { format },
        responseType: 'blob'
      }),
};

// ============================================================================
// TRACE API
// ============================================================================

export const traceApi = {
  // Get trace by message ID
  getTrace: (messageId) => apiClient.get(`/trace/${messageId}`),

  // Search traces
  searchTraces: (params) => apiClient.get('/trace/search', { params }),

  // Get trace timeline
  getTraceTimeline: (messageId) => apiClient.get(`/trace/${messageId}/timeline`),
};

// ============================================================================
// ANALYTICS API (NOUVEAUX ENDPOINTS)
// ============================================================================

export const analyticsApi = {
  // Compare two periods
  comparePeriods: (period1, period2, connector) =>
      apiClient.get('/analytics/comparison', {
        params: { period1, period2, connector }
      }),

  // Get traffic heatmap
  getHeatmap: (days = 7, connector) =>
      apiClient.get('/analytics/heatmap', {
        params: { days, connector }
      }),

  // Get top clients
  getTopClients: (limit = 10, timeRange = '7d', connector) =>
      apiClient.get('/analytics/top-clients', {
        params: { limit, timeRange, connector }
      }),

  // Get trends for a metric
  getTrends: (metric, days = 30, connector) =>
      apiClient.get('/analytics/trends', {
        params: { metric, days, connector }
      }),

  // Get connector breakdown (pi-gateway vs pi-connector)
  getConnectorBreakdown: (timeRange = '24h') =>
      apiClient.get('/analytics/connector-breakdown', {
        params: { timeRange }
      }),

  // Detect anomalies
  getAnomalies: (days = 7, connector) =>
      apiClient.get('/analytics/anomalies', {
        params: { days, connector }
      }),

  // Get top endpoints (slowest or most errors)
  getTopEndpoints: (type = 'slowest', limit = 10, timeRange = '24h', connector) =>
      apiClient.get('/analytics/top-endpoints', {
        params: { type, limit, timeRange, connector }
      }),

  // Get status code distribution
  getStatusDistribution: (timeRange = '24h', connector) =>
      apiClient.get('/analytics/status-distribution', {
        params: { timeRange, connector }
      }),
};

// ============================================================================
// ALERTS API (pour page Alerts - à implémenter côté backend)
// ============================================================================

export const alertsApi = {
  // Get active alerts
  getActiveAlerts: (params) =>
      apiClient.get('/alerts/active', { params }),

  // Get alert by ID
  getAlertById: (id) =>
      apiClient.get(`/alerts/${id}`),

  // Acknowledge alert
  acknowledgeAlert: (id) =>
      apiClient.post(`/alerts/${id}/acknowledge`),

  // Get alert rules
  getAlertRules: () =>
      apiClient.get('/alerts/rules'),

  // Create alert rule
  createAlertRule: (rule) =>
      apiClient.post('/alerts/rules', rule),

  // Update alert rule
  updateAlertRule: (id, rule) =>
      apiClient.put(`/alerts/rules/${id}`, rule),

  // Delete alert rule
  deleteAlertRule: (id) =>
      apiClient.delete(`/alerts/rules/${id}`),

  // Get alert history
  getAlertHistory: (params) =>
      apiClient.get('/alerts/history', { params }),
};

// ============================================================================
// CONNECTORS API
// ============================================================================

export const connectorsApi = {
  // Get all connectors
  getConnectors: () => apiClient.get('/connectors'),

  // Get connector details
  getConnectorDetails: (connectorName) =>
      apiClient.get(`/connectors/${connectorName}`),

  // Get connector metrics
  getConnectorMetrics: (connectorName, timeRange) =>
      apiClient.get(`/connectors/${connectorName}/metrics`, {
        params: { timeRange }
      }),

  // Get connector logs
  getConnectorLogs: (connectorName, params) =>
      apiClient.get(`/connectors/${connectorName}/logs`, { params }),
};

// ============================================================================
// HEALTH CHECK
// ============================================================================

export const healthApi = {
  checkHealth: () => apiClient.get('/health'),
};

export default apiClient;