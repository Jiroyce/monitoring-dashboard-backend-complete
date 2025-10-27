// src/pages/LogsExplorer.tsx

import React, { useState, useEffect } from 'react';
import { Search, Filter, Download, RefreshCw, Calendar, X } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Loading } from '@/components/ui/Loading';
import { apiService } from '@/services/api';
import {
  formatDate,
  formatDuration,
  getHttpStatusColor,
  downloadJSON,
  debounce,
} from '@/utils';
import type { LogEntry, LogSearchParams, LogSearchResponse } from '@/types';

export const LogsExplorer: React.FC = () => {
  const [searchParams, setSearchParams] = useState<LogSearchParams>({
    connector: 'all',
    type: 'all',
    page: 1,
    limit: 50,
    sortBy: 'timestamp',
    sortOrder: 'desc',
  });
  const [data, setData] = useState<LogSearchResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedLog, setSelectedLog] = useState<LogEntry | null>(null);

  useEffect(() => {
    fetchLogs();
  }, [searchParams.page, searchParams.sortBy, searchParams.sortOrder]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const response = await apiService.searchLogs(searchParams);
      setData(response);
    } catch (err) {
      console.error('Failed to fetch logs:', err);
    } finally {
      setLoading(false);
    }
  };

  const debouncedSearch = debounce(() => {
    setSearchParams((prev) => ({ ...prev, page: 1 }));
    fetchLogs();
  }, 500);

  const handleSearchChange = (field: keyof LogSearchParams, value: any) => {
    setSearchParams((prev) => ({ ...prev, [field]: value }));
    if (field === 'query') {
      debouncedSearch();
    }
  };

  const handleExport = () => {
    if (data) {
      downloadJSON(data.logs, `logs-${Date.now()}.json`);
    }
  };

  const handlePageChange = (newPage: number) => {
    setSearchParams((prev) => ({ ...prev, page: newPage }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Logs Explorer</h1>
          <p className="text-gray-500 mt-1">Search and analyze system logs</p>
        </div>
        <div className="flex items-center space-x-3">
          <button onClick={fetchLogs} className="btn btn-secondary">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </button>
          <button onClick={handleExport} className="btn btn-primary" disabled={!data?.logs.length}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <div className="space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchParams.query || ''}
              onChange={(e) => handleSearchChange('query', e.target.value)}
              placeholder="Search by path, IP, messageId..."
              className="input pl-10 w-full"
            />
          </div>

          {/* Filters Row */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {/* Connector */}
            <select
              value={searchParams.connector}
              onChange={(e) => {
                handleSearchChange('connector', e.target.value);
                fetchLogs();
              }}
              className="input"
            >
              <option value="all">All Connectors</option>
              <option value="pi-gateway">PI Gateway</option>
              <option value="pi-connector">PI Connector</option>
            </select>

            {/* Type */}
            <select
              value={searchParams.type}
              onChange={(e) => {
                handleSearchChange('type', e.target.value);
                fetchLogs();
              }}
              className="input"
            >
              <option value="all">All Types</option>
              <option value="API_IN">API IN</option>
              <option value="API_OUT">API OUT</option>
              <option value="AUTH">AUTH</option>
              <option value="PROCESSING">PROCESSING</option>
            </select>

            {/* Status */}
            <select
              value={searchParams.status || ''}
              onChange={(e) => {
                handleSearchChange('status', e.target.value);
                fetchLogs();
              }}
              className="input"
            >
              <option value="">All Statuses</option>
              <option value="2xx">2xx (Success)</option>
              <option value="4xx">4xx (Client Error)</option>
              <option value="5xx">5xx (Server Error)</option>
              <option value="200">200 OK</option>
              <option value="404">404 Not Found</option>
              <option value="500">500 Internal Error</option>
            </select>

            {/* Success Filter */}
            <select
              value={searchParams.success === undefined ? '' : String(searchParams.success)}
              onChange={(e) => {
                const value = e.target.value === '' ? undefined : e.target.value === 'true';
                handleSearchChange('success', value);
                fetchLogs();
              }}
              className="input"
            >
              <option value="">All Results</option>
              <option value="true">Success Only</option>
              <option value="false">Errors Only</option>
            </select>

            {/* Limit */}
            <select
              value={searchParams.limit}
              onChange={(e) => {
                handleSearchChange('limit', Number(e.target.value));
                fetchLogs();
              }}
              className="input"
            >
              <option value="25">25 per page</option>
              <option value="50">50 per page</option>
              <option value="100">100 per page</option>
              <option value="200">200 per page</option>
            </select>
          </div>

          {/* Summary */}
          {data && (
            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
              <div className="flex items-center space-x-6 text-sm">
                <span className="text-gray-600">
                  Total: <span className="font-semibold">{data.total}</span>
                </span>
                <span className="text-gray-600">
                  Success Rate:{' '}
                  <span className="font-semibold text-green-600">
                    {data.summary.successRate.toFixed(2)}%
                  </span>
                </span>
                <span className="text-gray-600">
                  Avg Latency:{' '}
                  <span className="font-semibold">{data.summary.avgLatencyMs.toFixed(1)}ms</span>
                </span>
                <span className="text-gray-600">
                  Errors: <span className="font-semibold text-red-600">{data.summary.errorCount}</span>
                </span>
              </div>
              <div className="text-sm text-gray-500">
                Page {data.page} of {data.pages}
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Logs Table */}
      {loading ? (
        <Loading text="Loading logs..." />
      ) : data?.logs.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <p className="text-gray-500">No logs found matching your criteria</p>
          </div>
        </Card>
      ) : (
        <>
          <Card>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Timestamp
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Type
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Connector
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Method
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Path
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Latency
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Client IP
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {data?.logs.map((log) => (
                    <tr
                      key={log.id}
                      onClick={() => setSelectedLog(log)}
                      className="hover:bg-gray-50 cursor-pointer transition-colors"
                    >
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(log.timestamp, 'PPpp')}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <Badge variant="info">{log.type}</Badge>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                        {log.connector}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <Badge>{log.method}</Badge>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 max-w-xs truncate">
                        {log.path}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <Badge
                          className={getHttpStatusColor(log.statusCode)}
                        >
                          {log.statusCode}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
                        {formatDuration(log.responseTimeMs)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                        {log.clientIp}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Pagination */}
          {data && data.pages > 1 && (
            <div className="flex items-center justify-between">
              <button
                onClick={() => handlePageChange(data.page - 1)}
                disabled={data.page === 1}
                className="btn btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <div className="text-sm text-gray-600">
                Page {data.page} of {data.pages}
              </div>
              <button
                onClick={() => handlePageChange(data.page + 1)}
                disabled={data.page === data.pages}
                className="btn btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

      {/* Log Detail Modal */}
      {selectedLog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Log Details</h3>
              <button
                onClick={() => setSelectedLog(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Log ID</p>
                  <p className="text-sm text-gray-900 font-mono">{selectedLog.id}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Timestamp</p>
                  <p className="text-sm text-gray-900">{formatDate(selectedLog.timestamp, 'PPpp')}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Type</p>
                  <p className="text-sm text-gray-900">{selectedLog.type}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Connector</p>
                  <p className="text-sm text-gray-900">{selectedLog.connector}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Method</p>
                  <p className="text-sm text-gray-900">{selectedLog.method}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Status Code</p>
                  <Badge className={getHttpStatusColor(selectedLog.statusCode)}>
                    {selectedLog.statusCode}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Response Time</p>
                  <p className="text-sm text-gray-900">{formatDuration(selectedLog.responseTimeMs)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Client IP</p>
                  <p className="text-sm text-gray-900 font-mono">{selectedLog.clientIp}</p>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-500 mb-2">Path</p>
                <p className="text-sm text-gray-900 font-mono bg-gray-50 p-3 rounded break-all">
                  {selectedLog.path}
                </p>
              </div>

              {selectedLog.messageId && (
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-2">Message ID</p>
                  <p className="text-sm text-gray-900 font-mono bg-gray-50 p-3 rounded">
                    {selectedLog.messageId}
                  </p>
                </div>
              )}

              {selectedLog.endToEndId && (
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-2">End-to-End ID</p>
                  <p className="text-sm text-gray-900 font-mono bg-gray-50 p-3 rounded">
                    {selectedLog.endToEndId}
                  </p>
                </div>
              )}

              {selectedLog.error && (
                <div>
                  <p className="text-sm font-medium text-red-600 mb-2">Error</p>
                  <p className="text-sm text-red-900 bg-red-50 p-3 rounded font-mono">
                    {selectedLog.error}
                  </p>
                </div>
              )}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default LogsExplorer;
