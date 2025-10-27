import React, { useState } from 'react';
import { Search, Activity, Clock, AlertTriangle, TrendingUp, Download } from 'lucide-react';
import { tracingApi } from '../services/api';
import {
  formatDate,
  formatLatency,
  getStatusCodeColor,
  exportToJSON
} from '../utils/helpers';
import {
  Card,
  CardHeader,
  CardBody,
  CardTitle,
  Badge,
  Loading,
  ErrorState,
  EmptyState
} from '../components/ui';
import toast from 'react-hot-toast';

const ProcessingPage = () => {
  const [searchType, setSearchType] = useState('messageId');
  const [searchValue, setSearchValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [trace, setTrace] = useState(null);

  const handleSearch = async () => {
    if (!searchValue.trim()) {
      toast.error('Veuillez entrer un ID à rechercher');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setTrace(null);

      let response;
      if (searchType === 'messageId') {
        response = await tracingApi.traceByMessageId(searchValue);
      } else {
        response = await tracingApi.traceByEndToEndId(searchValue);
      }

      setTrace(response.data);
      toast.success('Trace récupérée avec succès');
    } catch (err) {
      console.error('Error tracing:', err);
      if (err.response?.status === 404) {
        setError('Transaction introuvable');
        toast.error('Aucune transaction trouvée');
      } else {
        setError(err.message || 'Erreur lors du tracing');
        toast.error('Erreur lors du tracing');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    if (!trace) return;
    exportToJSON(trace, `trace_${trace.transactionId}_${Date.now()}`);
    toast.success('Export JSON réussi');
  };

  const getStepStatusColor = (status) => {
    if (!status) return 'bg-gray-400';
    if (status >= 200 && status < 300) return 'bg-success-500';
    if (status >= 300 && status < 400) return 'bg-primary-500';
    if (status >= 400 && status < 500) return 'bg-warning-500';
    return 'bg-danger-500';
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Processing Tracer</h1>
          <p className="mt-1 text-sm text-gray-500">
            Tracer le parcours complet d'une transaction
          </p>
        </div>

        {trace && (
          <button
            onClick={handleExport}
            className="btn btn-secondary"
          >
            <Download className="w-4 h-4 mr-2" />
            Export JSON
          </button>
        )}
      </div>

      {/* Search */}
      <Card>
        <CardBody>
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id="messageId"
                  value="messageId"
                  checked={searchType === 'messageId'}
                  onChange={(e) => setSearchType(e.target.value)}
                  className="w-4 h-4 text-primary-600"
                />
                <label htmlFor="messageId" className="text-sm font-medium text-gray-700">
                  Message ID
                </label>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id="endToEndId"
                  value="endToEndId"
                  checked={searchType === 'endToEndId'}
                  onChange={(e) => setSearchType(e.target.value)}
                  className="w-4 h-4 text-primary-600"
                />
                <label htmlFor="endToEndId" className="text-sm font-medium text-gray-700">
                  End-to-End ID
                </label>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="flex-1">
                <input
                  type="text"
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder={`Entrer un ${searchType === 'messageId' ? 'Message ID' : 'End-to-End ID'}...`}
                  className="input"
                />
              </div>

              <button
                onClick={handleSearch}
                disabled={loading}
                className="btn btn-primary"
              >
                <Search className="w-4 h-4 mr-2" />
                Tracer
              </button>
            </div>

            {/* Examples */}
            <div className="text-xs text-gray-500">
              <p>Exemples :</p>
              <ul className="mt-1 space-y-1">
                <li>• Message ID : MSG20251027123456789</li>
                <li>• End-to-End ID : E2E-20251027-ABCD1234</li>
              </ul>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Loading */}
      {loading && <Loading text="Recherche de la transaction..." />}

      {/* Error */}
      {error && !trace && (
        <Card>
          <CardBody>
            <ErrorState
              title="Transaction introuvable"
              message={error}
              onRetry={handleSearch}
            />
          </CardBody>
        </Card>
      )}

      {/* Trace Results */}
      {trace && !loading && (
        <>
          {/* Summary */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardBody>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Transaction ID</p>
                    <p className="mt-1 text-lg font-bold text-gray-900 truncate">
                      {trace.transactionId}
                    </p>
                  </div>
                  <Activity className="w-8 h-8 text-primary-600" />
                </div>
              </CardBody>
            </Card>

            <Card>
              <CardBody>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Durée totale</p>
                    <p className="mt-1 text-lg font-bold text-gray-900">
                      {formatLatency(trace.totalDurationMs)}
                    </p>
                  </div>
                  <Clock className="w-8 h-8 text-warning-600" />
                </div>
              </CardBody>
            </Card>

            <Card>
              <CardBody>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Nombre d'étapes</p>
                    <p className="mt-1 text-lg font-bold text-gray-900">
                      {trace.steps.length}
                    </p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-success-600" />
                </div>
              </CardBody>
            </Card>

            <Card>
              <CardBody>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Status</p>
                    <Badge variant={trace.status === 'success' ? 'success' : 'danger'} className="mt-1">
                      {trace.status === 'success' ? 'Succès' : 'Échec'}
                    </Badge>
                  </div>
                  {trace.status === 'success' ? (
                    <div className="w-8 h-8 bg-success-100 rounded-full flex items-center justify-center">
                      <span className="text-success-600 text-xl">✓</span>
                    </div>
                  ) : (
                    <AlertTriangle className="w-8 h-8 text-danger-600" />
                  )}
                </div>
              </CardBody>
            </Card>
          </div>

          {/* Bottlenecks Alert */}
          {trace.bottlenecks && trace.bottlenecks.length > 0 && (
            <Card className="border-warning-200 bg-warning-50">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="w-5 h-5 text-warning-600" />
                  <CardTitle className="text-warning-900">
                    Goulots d'étranglement détectés ({trace.bottlenecks.length})
                  </CardTitle>
                </div>
              </CardHeader>
              <CardBody>
                <div className="space-y-3">
                  {trace.bottlenecks.map((bottleneck, index) => (
                    <div
                      key={index}
                      className="p-4 bg-white rounded-lg border border-warning-200"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-3">
                          <Badge variant="warning">Étape {bottleneck.step}</Badge>
                          <span className="font-medium text-gray-900">
                            {bottleneck.service}
                          </span>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-warning-700">
                            {formatLatency(bottleneck.durationMs)}
                          </p>
                          <p className="text-sm text-gray-600">
                            {bottleneck.percentage.toFixed(1)}% du temps total
                          </p>
                        </div>
                      </div>
                      <p className="text-sm text-gray-700">
                        💡 {bottleneck.suggestion}
                      </p>
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>
          )}

          {/* Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Timeline de la transaction</CardTitle>
            </CardHeader>
            <CardBody>
              <div className="space-y-4">
                {trace.steps.map((step, index) => (
                  <div key={index} className="relative">
                    {/* Connector line */}
                    {index < trace.steps.length - 1 && (
                      <div className="absolute left-5 top-12 bottom-0 w-0.5 bg-gray-300"></div>
                    )}

                    {/* Step card */}
                    <div className="flex items-start space-x-4">
                      {/* Step number */}
                      <div className="flex-shrink-0">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getStepStatusColor(step.status)} text-white font-bold z-10 relative`}>
                          {step.sequence}
                        </div>
                      </div>

                      {/* Step content */}
                      <div className="flex-1 pb-8">
                        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:border-primary-300 transition-colors">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-3">
                              <Badge variant="info">{step.type}</Badge>
                              <span className="font-medium text-gray-900">
                                {step.service}
                              </span>
                            </div>
                            <div className="flex items-center space-x-4">
                              {step.status && (
                                <Badge variant={getStatusCodeColor(step.status)}>
                                  {step.status}
                                </Badge>
                              )}
                              {step.durationMs && (
                                <span className="text-sm font-medium text-gray-700">
                                  <Clock className="w-4 h-4 inline mr-1" />
                                  {formatLatency(step.durationMs)}
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <p className="text-gray-600">Timestamp</p>
                              <p className="font-medium text-gray-900">
                                {formatDate(step.timestamp)}
                              </p>
                            </div>
                            {step.method && step.path && (
                              <div>
                                <p className="text-gray-600">Endpoint</p>
                                <p className="font-medium text-gray-900">
                                  {step.method} {step.path}
                                </p>
                              </div>
                            )}
                            {step.clientIp && (
                              <div>
                                <p className="text-gray-600">Client IP</p>
                                <p className="font-medium text-gray-900">
                                  {step.clientIp}
                                </p>
                              </div>
                            )}
                            {step.message && (
                              <div className="col-span-2">
                                <p className="text-gray-600">Message</p>
                                <p className="font-medium text-gray-900 truncate">
                                  {step.message}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>

          {/* Transaction Info */}
          <Card>
            <CardHeader>
              <CardTitle>Informations de la transaction</CardTitle>
            </CardHeader>
            <CardBody>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Message ID</p>
                  <p className="font-medium text-gray-900 mt-1">
                    {trace.messageId || '-'}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">End-to-End ID</p>
                  <p className="font-medium text-gray-900 mt-1">
                    {trace.endToEndId || '-'}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Heure de début</p>
                  <p className="font-medium text-gray-900 mt-1">
                    {formatDate(trace.startTime)}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Heure de fin</p>
                  <p className="font-medium text-gray-900 mt-1">
                    {formatDate(trace.endTime)}
                  </p>
                </div>
              </div>
            </CardBody>
          </Card>
        </>
      )}

      {/* Empty state */}
      {!trace && !loading && !error && (
        <Card>
          <CardBody>
            <EmptyState
              icon={Search}
              title="Aucune trace affichée"
              description="Entrez un Message ID ou End-to-End ID pour tracer une transaction"
            />
          </CardBody>
        </Card>
      )}
    </div>
  );
};

export default ProcessingPage;
