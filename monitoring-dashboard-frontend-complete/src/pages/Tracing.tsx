import React, { useState } from 'react';
import { Search, AlertCircle } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Loading } from '@/components/ui/Loading';
import { apiService } from '@/services/api';
import { formatDate, formatDuration } from '@/utils';
import type { Trace } from '@/types';

export const Tracing: React.FC = () => {
  const [searchType, setSearchType] = useState<'messageId' | 'endToEndId'>('messageId');
  const [searchValue, setSearchValue] = useState('');
  const [trace, setTrace] = useState<Trace | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!searchValue.trim()) return;
    try {
      setLoading(true);
      setError(null);
      const result = searchType === 'messageId'
        ? await apiService.traceByMessageId(searchValue)
        : await apiService.traceByEndToEndId(searchValue);
      setTrace(result);
    } catch (err: any) {
      setError(err.response?.status === 404 ? 'Transaction not found' : 'Failed to load trace');
      setTrace(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Transaction Tracing</h1>
        <p className="text-gray-500 mt-1">Trace complete transaction flows</p>
      </div>
      <Card>
        <div className="space-y-4">
          <div className="flex items-center space-x-4">
            <select value={searchType} onChange={(e) => setSearchType(e.target.value as any)} className="input w-48">
              <option value="messageId">Message ID</option>
              <option value="endToEndId">End-to-End ID</option>
            </select>
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                placeholder={`Enter ${searchType}...`}
                className="input pl-10 w-full"
              />
            </div>
            <button onClick={handleSearch} className="btn btn-primary">Search</button>
          </div>
        </div>
      </Card>
      {loading && <Loading text="Loading trace..." />}
      {error && (
        <Card>
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <AlertCircle className="w-12 h-12 mx-auto text-red-500 mb-4" />
              <p className="text-lg font-medium text-gray-900">{error}</p>
            </div>
          </div>
        </Card>
      )}
      {trace && (
        <>
          <Card title="Transaction Overview">
            <div className="grid grid-cols-4 gap-6">
              <div>
                <p className="text-sm text-gray-500">Transaction ID</p>
                <p className="text-sm font-mono font-medium mt-1">{trace.transactionId}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <Badge variant={trace.status === 'success' ? 'success' : 'error'} className="mt-1">{trace.status}</Badge>
              </div>
              <div>
                <p className="text-sm text-gray-500">Duration</p>
                <p className="text-sm font-medium mt-1">{formatDuration(trace.totalDurationMs)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Steps</p>
                <p className="text-sm font-medium mt-1">{trace.steps.length}</p>
              </div>
            </div>
          </Card>
          <Card title="Transaction Timeline">
            <div className="space-y-1">
              {trace.steps.map((step, idx) => (
                <div key={idx} className="flex items-center py-3 border-b border-gray-100 last:border-0">
                  <div className="flex items-center w-20">
                    <span className="text-sm font-medium text-gray-500">#{step.sequence}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-3">
                      <Badge variant="info">{step.type}</Badge>
                      <span className="text-sm font-medium text-gray-900">{step.service}</span>
                      <span className="text-sm text-gray-600">{step.method} {step.path}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4 ml-4">
                    <span className="text-sm text-gray-500">{formatDate(step.timestamp, 'HH:mm:ss')}</span>
                    <span className="text-sm font-medium">{formatDuration(step.durationMs)}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </>
      )}
    </div>
  );
};
