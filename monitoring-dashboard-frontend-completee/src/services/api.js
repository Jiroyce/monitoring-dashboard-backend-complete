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
    // Get all metrics (overview)
    getMetrics: (params) => apiClient.get('/metrics', { params }),

    // Get overview metrics (pour OverviewPage)
    getOverview: (timeRange = '1h') =>
        apiClient.get('/metrics/overview', { params: { timeRange } }),

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
    // Search logs with filters (CORRECTION: GET au lieu de POST)
    searchLogs: (filters) => apiClient.get('/logs/search', { params: filters }),

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

    // Get processing trace (pour ProcessingPage)
    getProcessingTrace: (messageId) => apiClient.get(`/processing/trace/${messageId}`),

    // Get trace by endToEndId
    getTraceByEndToEndId: (endToEndId) => apiClient.get('/processing/trace', {
        params: { endToEndId }
    }),
};

// ============================================================================
// ANALYTICS API
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

    // Get comparison (alias pour compatibilité)
    getComparison: (timeRange = '24h') =>
        apiClient.get('/analytics/comparison', {
            params: { time_range: timeRange }
        }),
};

// ============================================================================
// ALERTS API
// ============================================================================

export const alertsApi = {
    // Get active alerts
    getActiveAlerts: (params) =>
        apiClient.get('/alerts/active', { params }),

    // Get alert by ID
    getAlertById: (id) =>
        apiClient.get(`/alerts/${id}`),

    // Acknowledge alert
    acknowledgeAlert: (id, data) =>
        apiClient.post(`/alerts/${id}/acknowledge`, data),

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
    getConnectorDetails: (connectorName, timeRange) =>
        apiClient.get(`/connectors/${connectorName}`, {
            params: { timeRange }
        }),

    // Get connector metrics (alias)
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

// ============================================================================
// EXPORTS POUR COMPATIBILITÉ AVEC L'ANCIEN CODE
// ============================================================================

// Export pour Overview page
export const overviewApi = {
    getOverview: (timeRange) => metricsApi.getOverview(timeRange),
};

// Export pour Connector page
export const connectorApi = {
    getDetails: (name, timeRange) => connectorsApi.getConnectorDetails(name, timeRange),
};

// Export pour Tracing
export const tracingApi = {
    getTrace: (messageId) => traceApi.getProcessingTrace(messageId),
    getTraceByEndToEndId: (endToEndId) => traceApi.getTraceByEndToEndId(endToEndId),
};

// Export default pour compatibilité
const api = {
    // Metrics
    getOverview: (timeRange) => metricsApi.getOverview(timeRange),
    getConnectorDetails: (name, timeRange) => connectorsApi.getConnectorDetails(name, timeRange),

    // Logs
    searchLogs: (params) => logsApi.searchLogs(params),
    getLogDetails: (logId) => logsApi.getLogById(logId),
    getErrorLogs: (params) => apiClient.get('/logs/errors', { params }),

    // Processing Trace
    getProcessingTrace: (messageId) => traceApi.getProcessingTrace(messageId),
    getTraceByEndToEndId: (endToEndId) => traceApi.getTraceByEndToEndId(endToEndId),

    // Analytics
    getTrends: (timeRange, metric) => analyticsApi.getTrends(metric, 30, null),
    getComparison: (timeRange) => analyticsApi.getComparison(timeRange),
    getHeatmap: (days) => analyticsApi.getHeatmap(days, null),

    // Alerts
    getActiveAlerts: () => alertsApi.getActiveAlerts(),
    acknowledgeAlert: (alertId, data) => alertsApi.acknowledgeAlert(alertId, data),
};

export default api;