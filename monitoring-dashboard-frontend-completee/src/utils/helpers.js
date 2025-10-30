import { format, formatDistanceToNow, parseISO, subHours, subDays } from 'date-fns';
import { fr } from 'date-fns/locale';
import clsx from 'clsx';

// ============================================================================
// DATE & TIME UTILITIES
// ============================================================================

/**
 * Formater une date
 */
export const formatDate = (date, formatStr = 'dd/MM/yyyy HH:mm:ss') => {
  if (!date) return '-';
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, formatStr, { locale: fr });
};

/**
 * Formater une date relative (il y a X minutes)
 */
export const formatRelativeTime = (date) => {
  if (!date) return '-';
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return formatDistanceToNow(dateObj, { addSuffix: true, locale: fr });
};

/**
 * Calculer les dates de début/fin selon le timeRange
 */
export const getTimeRangeDates = (timeRange) => {
  const endDate = new Date();
  let startDate;

  switch (timeRange) {
    case '1h':
      startDate = subHours(endDate, 1);
      break;
    case '6h':
      startDate = subHours(endDate, 6);
      break;
    case '24h':
      startDate = subHours(endDate, 24);
      break;
    case '7d':
      startDate = subDays(endDate, 7);
      break;
    case '30d':
      startDate = subDays(endDate, 30);
      break;
    default:
      startDate = subHours(endDate, 1);
  }

  return { startDate, endDate };
};

// ============================================================================
// NUMBER UTILITIES
// ============================================================================

/**
 * Formater un nombre avec séparateur de milliers
 */
export const formatNumber = (num) => {
  if (num === null || num === undefined) return '-';
  return new Intl.NumberFormat('fr-FR').format(num);
};

/**
 * Formater un pourcentage
 */
export const formatPercentage = (value, decimals = 2) => {
  if (value === null || value === undefined) return '-';
  return `${value.toFixed(decimals)}%`;
};

/**
 * Formater une latence en ms
 */
export const formatLatency = (ms) => {
  if (ms === null || ms === undefined) return '-';
  if (ms < 1) return `${(ms * 1000).toFixed(0)}μs`;
  if (ms < 1000) return `${ms.toFixed(2)}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
};

/**
 * Formater une taille en bytes
 */
export const formatBytes = (bytes) => {
  if (bytes === null || bytes === undefined || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

/**
 * Arrondir un nombre
 */
export const roundNumber = (num, decimals = 2) => {
  if (num === null || num === undefined) return 0;
  return Math.round(num * Math.pow(10, decimals)) / Math.pow(10, decimals);
};

// ============================================================================
// STATUS UTILITIES
// ============================================================================

/**
 * Obtenir le statut basé sur l'uptime
 */
export const getStatusFromUptime = (uptimePercentage) => {
  if (uptimePercentage >= 99.9) return 'healthy';
  if (uptimePercentage >= 95) return 'degraded';
  return 'down';
};

/**
 * Obtenir le statut basé sur le taux d'erreur
 */
export const getStatusFromErrorRate = (errorRate) => {
  if (errorRate < 1) return 'healthy';
  if (errorRate < 5) return 'degraded';
  return 'down';
};

/**
 * Obtenir la classe CSS pour un statut
 */
export const getStatusClass = (status) => {
  const statusMap = {
    healthy: 'text-success-700 bg-success-100',
    degraded: 'text-warning-700 bg-warning-100',
    down: 'text-danger-700 bg-danger-100',
    unknown: 'text-gray-700 bg-gray-100',
  };
  return statusMap[status] || statusMap.unknown;
};

/**
 * Obtenir le texte pour un statut
 */
export const getStatusText = (status) => {
  const statusMap = {
    healthy: 'Opérationnel',
    degraded: 'Dégradé',
    down: 'Hors ligne',
    unknown: 'Inconnu',
  };
  return statusMap[status] || statusMap.unknown;
};

/**
 * Obtenir la couleur pour un statut code HTTP
 */
export const getStatusCodeColor = (statusCode) => {
  if (statusCode >= 200 && statusCode < 300) return 'success';
  if (statusCode >= 300 && statusCode < 400) return 'info';
  if (statusCode >= 400 && statusCode < 500) return 'warning';
  if (statusCode >= 500) return 'danger';
  return 'secondary';
};

// ============================================================================
// CONNECTOR UTILITIES
// ============================================================================

/**
 * Obtenir le nom complet d'un connector
 */
export const getConnectorFullName = (connector) => {
  const connectorMap = {
    'pi-gateway': 'PI Gateway',
    'pi-connector': 'PI Connector',
    'all': 'Tous les connecteurs',
  };
  return connectorMap[connector] || connector;
};

/**
 * Obtenir l'icône d'un connector
 */
export const getConnectorIcon = (connector) => {
  const iconMap = {
    'pi-gateway': '🌐',
    'pi-connector': '🔌',
  };
  return iconMap[connector] || '📊';
};

// ============================================================================
// CHART UTILITIES
// ============================================================================

/**
 * Générer des couleurs pour les charts
 */
export const getChartColor = (index) => {
  const colors = [
    '#0ea5e9', // primary-500
    '#22c55e', // success-500
    '#f59e0b', // warning-500
    '#ef4444', // danger-500
    '#8b5cf6', // purple-500
    '#ec4899', // pink-500
  ];
  return colors[index % colors.length];
};

/**
 * Formater les données pour Recharts
 */
export const formatChartData = (data, xKey, yKey) => {
  if (!data || !Array.isArray(data)) return [];
  return data.map(item => ({
    [xKey]: item[xKey],
    [yKey]: item[yKey],
  }));
};

// ============================================================================
// LOG UTILITIES
// ============================================================================

/**
 * Obtenir le label pour un type de log
 */
export const getLogTypeLabel = (type) => {
  const typeMap = {
    'API_IN': 'API Entrante',
    'API_OUT': 'API Sortante',
    'AUTH': 'Authentification',
    'PROCESSING': 'Traitement',
    'ERROR': 'Erreur',
    'all': 'Tous',
  };
  return typeMap[type] || type;
};

/**
 * Extraire le path court (sans query params)
 */
export const extractShortPath = (path) => {
  if (!path) return '-';
  return path.split('?')[0];
};

/**
 * Highlighter du texte dans une recherche
 */
export const highlightText = (text, query) => {
  if (!query || !text) return text;
  const regex = new RegExp(`(${query})`, 'gi');
  return text.replace(regex, '<mark class="bg-yellow-200">$1</mark>');
};

// ============================================================================
// CLASSNAME UTILITIES
// ============================================================================

/**
 * Combiner des classes CSS (wrapper autour de clsx)
 */
export const cn = clsx;

// ============================================================================
// VALIDATION UTILITIES
// ============================================================================

/**
 * Valider un messageId
 */
export const isValidMessageId = (messageId) => {
  return messageId && messageId.length > 0;
};

/**
 * Valider un endToEndId
 */
export const isValidEndToEndId = (endToEndId) => {
  return endToEndId && endToEndId.length > 0;
};

/**
 * Valider une adresse IP
 */
export const isValidIP = (ip) => {
  const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
  return ipRegex.test(ip);
};

// ============================================================================
// EXPORT UTILITIES
// ============================================================================

/**
 * Exporter des données en CSV
 */
export const exportToCSV = (data, filename) => {
  if (!data || data.length === 0) return;

  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map(row => headers.map(header => `"${row[header] || ''}"`).join(',')),
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${filename}.csv`;
  link.click();
};

/**
 * Exporter des données en JSON
 */
export const exportToJSON = (data, filename) => {
  if (!data) return;

  const jsonContent = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonContent], { type: 'application/json' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${filename}.json`;
  link.click();
};

// ============================================================================
// LOCAL STORAGE UTILITIES
// ============================================================================

/**
 * Sauvegarder dans le localStorage
 */
export const saveToLocalStorage = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
};

/**
 * Récupérer du localStorage
 */
export const loadFromLocalStorage = (key, defaultValue = null) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error('Error loading from localStorage:', error);
    return defaultValue;
  }
};

/**
 * Supprimer du localStorage
 */
export const removeFromLocalStorage = (key) => {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error('Error removing from localStorage:', error);
  }
};
