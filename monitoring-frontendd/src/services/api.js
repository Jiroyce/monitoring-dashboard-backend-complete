import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour logger les erreurs
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

export const metricsApi = {
  getOverview: (timeRange = '1h') => 
    api.get(`/api/metrics/overview?timeRange=${timeRange}`),
  
  getConnectorDetails: (connectorName, timeRange = '24h') =>
    api.get(`/api/metrics/connector/${connectorName}?timeRange=${timeRange}`),
};

export const logsApi = {
  search: (params) => {
    const queryParams = new URLSearchParams();
    Object.keys(params).forEach(key => {
      if (params[key] !== null && params[key] !== undefined && params[key] !== '') {
        queryParams.append(key, params[key]);
      }
    });
    return api.get(`/api/logs/search?${queryParams.toString()}`);
  },
  
  getErrors: (connector = 'all', limit = 50) =>
    api.get(`/api/logs/errors?connector=${connector}&limit=${limit}`),
  
  getDetail: (logId) =>
    api.get(`/api/logs/${logId}`),
};

export const analyticsApi = {
  getTrends: (timeRange = '7d', connector = 'all') =>
    api.get(`/api/analytics/trends?timeRange=${timeRange}&connector=${connector}`),
  
  getComparison: (period1, period2) =>
    api.get(`/api/analytics/comparison?period1=${period1}&period2=${period2}`),
  
  getHeatmap: (days = 7) =>
    api.get(`/api/analytics/heatmap?days=${days}`),
  
  getAnomalies: (connector = 'all', hours = 24) =>
    api.get(`/api/analytics/anomalies?connector=${connector}&hours=${hours}`),
};

export const traceApi = {
  getTrace: (messageId) =>
    api.get(`/api/trace/${messageId}`),
};

export const alertsApi = {
  getActive: () =>
    api.get('/api/alerts/active'),
  
  acknowledge: (alertId, data) =>
    api.post(`/api/alerts/${alertId}/acknowledge`, data),
};

export default api;
