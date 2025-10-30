import React, { useState } from 'react';
import { Search, GitBranch, Clock, AlertTriangle, CheckCircle } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import api from '../services/api';

const ProcessingTracer = () => {
  const [searchType, setSearchType] = useState('messageId');
  const [searchValue, setSearchValue] = useState('');
  const [trace, setTrace] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchValue.trim()) return;

    try {
      setLoading(true);
      setError(null);
      
      let traceData;
      if (searchType === 'messageId') {
        traceData = await api.getTraceByMessageId(searchValue.trim());
      } else {
        traceData = await api.getTraceByEndToEndId(searchValue.trim());
      }
      
      setTrace(traceData);
    } catch (err) {
      setError('Transaction not found or error occurred');
      setTrace(null);
    } finally {
      setLoading(false);
    }
  };

  const getStepColor = (status) => {
    switch (status) {
      case 'success': return 'bg-green-100 border-green-400 text-green-800';
      case 'error': return 'bg-red-100 border-red-400 text-red-800';
      case 'warning': return 'bg-yellow-100 border-yellow-400 text-yellow-800';
      default: return 'bg-gray-100 border-gray-400 text-gray-800';
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">🔬 Processing Tracer</h1>
        <p className="text-gray-600 mt-1">Trace complete transaction flow by Message ID or End-to-End ID</p>
      </div>

      {/* Search Form */}
      <div className="card">
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="flex items-center space-x-4">
            <div className="flex space-x-2">
              <button
                type="button"
                onClick={() => setSearchType('messageId')}
                className={`px-4 py-2 rounded-md font-medium transition-colors ${
                  searchType === 'messageId'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700'
                }`}
              >
                Message ID
              </button>
              <button
                type="button"
                onClick={() => setSearchType('endToEndId')}
                className={`px-4 py-2 rounded-md font-medium transition-colors ${
                  searchType === 'endToEndId'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700'
                }`}
              >
                End-to-End ID
              </button>
            </div>

            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder={`Enter ${searchType === 'messageId' ? 'Message ID' : 'End-to-End ID'}...`}
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <button type="submit" className="btn-primary">
              Trace
            </button>
          </div>
        </form>
      </div>

      {/* Error Message */}
      {error && (
        <div className="card bg-red-50 border-2 border-red-200">
          <div className="flex items-center space-x-3">
            <AlertTriangle size={24} className="text-red-600" />
            <div>
              <h3 className="font-bold text-red-900">Error</h3>
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Loading */}
      {loading && <LoadingSpinner message="Tracing transaction..." />}

      {/* Trace Results */}
      {trace && !loading && (
        <div className="space-y-6">
          {/* Summary */}
          <div className="card bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <p className="text-sm text-gray-600 mb-1">Message ID</p>
                <p className="text-lg font-bold text-gray-900 font-mono">{trace.message_id}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Duration</p>
                <p className="text-lg font-bold text-gray-900">{trace.total_duration_ms}ms</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Steps</p>
                <p className="text-lg font-bold text-gray-900">{trace.steps?.length || 0}</p>
              </div>
            </div>
          </div>

          {/* Bottlenecks */}
          {trace.bottlenecks && trace.bottlenecks.length > 0 && (
            <div className="card bg-yellow-50 border-2 border-yellow-200">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                <AlertTriangle size={20} className="text-yellow-600 mr-2" />
                Performance Bottlenecks
              </h3>
              <div className="space-y-3">
                {trace.bottlenecks.map((bottleneck, index) => (
                  <div key={index} className="bg-white p-4 rounded-lg border border-yellow-300">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-gray-900">Step {bottleneck.step}: {bottleneck.service}</p>
                        <p className="text-sm text-gray-600 mt-1">{bottleneck.suggestion}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-yellow-600">{bottleneck.duration_ms}ms</p>
                        <p className="text-sm text-gray-600">{bottleneck.percentage}% of total</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Transaction Flow */}
          <div className="card">
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
              <GitBranch size={20} className="mr-2" />
              Transaction Flow
            </h3>
            
            <div className="relative">
              {/* Timeline */}
              <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-300"></div>
              
              <div className="space-y-6">
                {trace.steps?.map((step, index) => (
                  <div key={index} className="relative pl-16">
                    {/* Step Number */}
                    <div className={`absolute left-0 w-16 h-16 rounded-full border-4 flex items-center justify-center font-bold text-lg z-10 ${getStepColor(step.status)}`}>
                      {step.sequence}
                    </div>
                    
                    {/* Step Content */}
                    <div className={`p-4 rounded-lg border-2 ${getStepColor(step.status)}`}>
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-bold text-lg">{step.step}</h4>
                          <p className="text-sm opacity-75">{step.service}</p>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center space-x-2">
                            {step.status === 'success' ? (
                              <CheckCircle size={20} className="text-green-600" />
                            ) : (
                              <AlertTriangle size={20} className="text-red-600" />
                            )}
                            <span className="font-bold text-lg">{step.duration_ms}ms</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm mt-3">
                        <div>
                          <p className="opacity-75">Timestamp</p>
                          <p className="font-mono">{new Date(step.timestamp).toLocaleString()}</p>
                        </div>
                        {step.method && step.path && (
                          <div>
                            <p className="opacity-75">Request</p>
                            <p className="font-mono">
                              <span className="font-bold">{step.method}</span> {step.path}
                            </p>
                          </div>
                        )}
                        {step.status_code && (
                          <div>
                            <p className="opacity-75">Status</p>
                            <p className="font-bold">{step.status_code}</p>
                          </div>
                        )}
                        {step.client_ip && (
                          <div>
                            <p className="opacity-75">Client IP</p>
                            <p className="font-mono">{step.client_ip}</p>
                          </div>
                        )}
                      </div>
                      
                      {step.message && (
                        <div className="mt-3 p-2 bg-white bg-opacity-50 rounded">
                          <p className="text-sm">{step.message}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!trace && !loading && !error && (
        <div className="card text-center py-12">
          <GitBranch size={64} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">No Trace Selected</h3>
          <p className="text-gray-600">
            Enter a Message ID or End-to-End ID to trace the complete transaction flow
          </p>
        </div>
      )}
    </div>
  );
};

export default ProcessingTracer;
