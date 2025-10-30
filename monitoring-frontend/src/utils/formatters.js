import { format, formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

export const formatDate = (date) => {
  if (!date) return '-';
  try {
    return format(new Date(date), 'dd/MM/yyyy HH:mm:ss', { locale: fr });
  } catch {
    return '-';
  }
};

export const formatTime = (date) => {
  if (!date) return '-';
  try {
    return format(new Date(date), 'HH:mm:ss', { locale: fr });
  } catch {
    return '-';
  }
};

export const formatRelativeTime = (date) => {
  if (!date) return '-';
  try {
    return formatDistanceToNow(new Date(date), { addSuffix: true, locale: fr });
  } catch {
    return '-';
  }
};

export const formatNumber = (num) => {
  if (num === null || num === undefined) return '-';
  return new Intl.NumberFormat('fr-FR').format(num);
};

export const formatPercentage = (value, decimals = 2) => {
  if (value === null || value === undefined) return '-';
  return `${value.toFixed(decimals)}%`;
};

export const formatLatency = (ms) => {
  if (ms === null || ms === undefined) return '-';
  if (ms < 1) return `${(ms * 1000).toFixed(0)}μs`;
  if (ms < 1000) return `${ms.toFixed(0)}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
};

export const formatBytes = (bytes) => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
};

export const getStatusColor = (status) => {
  if (status >= 200 && status < 300) return 'text-green-400';
  if (status >= 300 && status < 400) return 'text-blue-400';
  if (status >= 400 && status < 500) return 'text-yellow-400';
  if (status >= 500) return 'text-red-400';
  return 'text-gray-400';
};

export const getStatusBadgeColor = (status) => {
  if (status >= 200 && status < 300) return 'bg-green-500/20 text-green-400 border-green-500/50';
  if (status >= 300 && status < 400) return 'bg-blue-500/20 text-blue-400 border-blue-500/50';
  if (status >= 400 && status < 500) return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50';
  if (status >= 500) return 'bg-red-500/20 text-red-400 border-red-500/50';
  return 'bg-gray-500/20 text-gray-400 border-gray-500/50';
};

export const getHealthColor = (percentage) => {
  if (percentage >= 99) return 'text-green-400';
  if (percentage >= 95) return 'text-yellow-400';
  return 'text-red-400';
};

export const getHealthStatus = (percentage) => {
  if (percentage >= 99) return 'HEALTHY';
  if (percentage >= 95) return 'DEGRADED';
  return 'CRITICAL';
};

export const getTrendIcon = (value) => {
  if (value > 0) return '▲';
  if (value < 0) return '▼';
  return '─';
};

export const getTrendColor = (value, inverse = false) => {
  const positive = inverse ? value < 0 : value > 0;
  if (positive) return 'text-green-400';
  if (value === 0) return 'text-gray-400';
  return 'text-red-400';
};
