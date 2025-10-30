const API_BASE_URL = 'http://localhost:8080/api';

class ApiService {
  // Helper pour gérer les requêtes
  async fetchData(endpoint, params = {}) {
    const url = new URL(`${API_BASE_URL}${endpoint}`);
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== null) {
        url.searchParams.append(key, params[key]);
      }
    });

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // METRICS
  async getOverview(timeRange = '1h') {
    return this.fetchData('/metrics/overview', { timeRange });
  }

  async getConnectorMetrics(connectorName, timeRange = '24h') {
    return this.fetchData(`/metrics/connector/${connectorName}`, { timeRange });
  }

  // LOGS
  async searchLogs(params = {}) {
    return this.fetchData('/logs/search', params);
  }

  async getErrors(connector = 'all', limit = 50) {
    return this.fetchData('/logs/errors', { connector, limit });
  }

  async getLogById(logId) {
    return this.fetchData(`/logs/${logId}`);
  }

  // PROCESSING
  async getTraceByMessageId(messageId) {
    return this.fetchData(`/processing/trace/${messageId}`);
  }

  async getTraceByEndToEndId(endToEndId) {
    return this.fetchData('/processing/trace', { endToEndId });
  }

  // ANALYTICS
  async getComparison(period1, period2, connector = null) {
    const params = { period1, period2 };
    if (connector) params.connector = connector;
    return this.fetchData('/analytics/comparison', params);
  }

  async getHeatmap(days = 7, connector = null) {
    const params = { days };
    if (connector) params.connector = connector;
    return this.fetchData('/analytics/heatmap', params);
  }

  async getTrends(metric, days = 30, connector = null) {
    const params = { metric, days };
    if (connector) params.connector = connector;
    return this.fetchData('/analytics/trends', params);
  }

  async getTopClients(limit = 10, timeRange = '7d', connector = null) {
    const params = { limit, timeRange };
    if (connector) params.connector = connector;
    return this.fetchData('/analytics/top-clients', params);
  }

  async getConnectorBreakdown(timeRange = '24h') {
    return this.fetchData('/analytics/connector-breakdown', { timeRange });
  }

  async getAnomalies(days = 7, connector = null) {
    const params = { days };
    if (connector) params.connector = connector;
    return this.fetchData('/analytics/anomalies', params);
  }

  async getTopEndpoints(type = 'slowest', limit = 10, timeRange = '24h', connector = null) {
    const params = { type, limit, timeRange };
    if (connector) params.connector = connector;
    return this.fetchData('/analytics/top-endpoints', params);
  }

  async getStatusDistribution(timeRange = '24h', connector = null) {
    const params = { timeRange };
    if (connector) params.connector = connector;
    return this.fetchData('/analytics/status-distribution', params);
  }
}

export default new ApiService();
