import axios from 'axios';

// Configuration de l'API
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour gérer les erreurs globalement
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    if (error.response) {
      // Erreur du serveur
      console.error('Response error:', error.response.data);
    } else if (error.request) {
      // Pas de réponse du serveur
      console.error('No response from server');
    } else {
      // Erreur de configuration
      console.error('Request error:', error.message);
    }
    return Promise.reject(error);
  }
);

// ============================================================================
// METRICS API
// ============================================================================

export const metricsApi = {
  /**
   * Récupérer les métriques d'overview
   * @param {string} timeRange - 1h, 6h, 24h, 7d, 30d
   */
  getOverview: (timeRange = '1h') => {
    return apiClient.get('/metrics/overview', {
      params: { timeRange },
    });
  },

  /**
   * Récupérer les détails d'un connector
   * @param {string} connectorName - pi-gateway, pi-connector
   * @param {string} timeRange - 1h, 6h, 24h, 7d, 30d
   */
  getConnectorDetails: (connectorName, timeRange = '24h') => {
    return apiClient.get(`/metrics/connector/${connectorName}`, {
      params: { timeRange },
    });
  },
};

// ============================================================================
// LOGS API
// ============================================================================

export const logsApi = {
  /**
   * Rechercher des logs avec filtres
   */
  searchLogs: (params) => {
    return apiClient.get('/logs/search', { params });
  },

  /**
   * Récupérer les logs d'erreur
   * @param {string} connector - pi-gateway, pi-connector, all
   * @param {number} limit - Nombre de résultats
   */
  getErrorLogs: (connector = 'all', limit = 50) => {
    return apiClient.get('/logs/errors', {
      params: { connector, limit },
    });
  },

  /**
   * Récupérer les détails d'un log
   * @param {string} logId - ID du log
   */
  getLogDetail: (logId) => {
    return apiClient.get(`/logs/${logId}`);
  },
};

// ============================================================================
// PROCESSING / TRACING API
// ============================================================================

export const tracingApi = {
  /**
   * Tracer une transaction par messageId
   * @param {string} messageId
   */
  traceByMessageId: (messageId) => {
    return apiClient.get(`/processing/trace/${messageId}`);
  },

  /**
   * Tracer une transaction par endToEndId
   * @param {string} endToEndId
   */
  traceByEndToEndId: (endToEndId) => {
    return apiClient.get('/processing/trace', {
      params: { endToEndId },
    });
  },
};

// ============================================================================
// ANALYTICS API (à implémenter côté backend)
// ============================================================================

export const analyticsApi = {
  /**
   * Comparer deux périodes
   */
  comparePeriods: (period1, period2) => {
    return apiClient.get('/analytics/comparison', {
      params: { period1, period2 },
    });
  },

  /**
   * Récupérer la heatmap du trafic
   */
  getHeatmap: (days = 7) => {
    return apiClient.get('/analytics/heatmap', {
      params: { days },
    });
  },

  /**
   * Récupérer les top clients
   */
  getTopClients: (limit = 10) => {
    return apiClient.get('/analytics/top-clients', {
      params: { limit },
    });
  },

  /**
   * Récupérer les tendances d'une métrique
   */
  getTrends: (metric, days = 30) => {
    return apiClient.get('/analytics/trends', {
      params: { metric, days },
    });
  },
};

// ============================================================================
// ALERTS API (à implémenter côté backend)
// ============================================================================

export const alertsApi = {
  /**
   * Récupérer les alertes actives
   */
  getActiveAlerts: () => {
    return apiClient.get('/alerts/active');
  },

  /**
   * Récupérer les règles d'alerte
   */
  getAlertRules: () => {
    return apiClient.get('/alerts/rules');
  },

  /**
   * Acknowledger une alerte
   */
  acknowledgeAlert: (alertId) => {
    return apiClient.post(`/alerts/${alertId}/acknowledge`);
  },
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Vérifier si l'API est accessible (health check)
 */
export const checkApiHealth = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL.replace('/api', '')}/actuator/health`, {
      timeout: 5000,
    });
    return response.status === 200;
  } catch (error) {
    console.error('API health check failed:', error);
    return false;
  }
};

/**
 * Formater une date pour l'API
 */
export const formatDateForApi = (date) => {
  return date.toISOString();
};

/**
 * Parser une réponse d'erreur
 */
export const parseApiError = (error) => {
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  if (error.message) {
    return error.message;
  }
  return 'Une erreur inconnue est survenue';
};

export default apiClient;
