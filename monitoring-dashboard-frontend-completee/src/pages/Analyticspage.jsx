import React, { useState, useEffect } from 'react';
import {
    TrendingUp,
    Activity,
    Calendar,
    Users,
    BarChart3,
    RefreshCw,
    Layers,
    AlertCircle
} from 'lucide-react';
import {
    LineChart,
    Line,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from 'recharts';
import { analyticsApi } from '../services/api';
import { Card, CardHeader, CardBody, CardTitle, Loading, Tabs } from '../components/ui';
import toast from 'react-hot-toast';

const AnalyticsPage = () => {
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('overview');
    const [timeRange, setTimeRange] = useState('7d');
    const [selectedConnector, setSelectedConnector] = useState('pi-gateway'); // DEFAULT: pi-gateway

    const [comparisonData, setComparisonData] = useState(null);
    const [heatmapData, setHeatmapData] = useState(null);
    const [topClientsData, setTopClientsData] = useState(null);
    const [trendsData, setTrendsData] = useState(null);

    // 🆕 DEBUG : Stocker les erreurs
    const [errors, setErrors] = useState({
        comparison: null,
        heatmap: null,
        clients: null,
        trends: null
    });

    useEffect(() => {
        loadData();
    }, [activeTab, timeRange, selectedConnector]);

    const loadData = async () => {
        setLoading(true);
        setErrors({ comparison: null, heatmap: null, clients: null, trends: null });

        try {
            if (activeTab === 'overview') {
                // Charger tout en parallèle
                await Promise.allSettled([
                    loadComparison(),
                    loadHeatmap(),
                    loadTopClients(),
                    loadTrends()
                ]);
            } else if (activeTab === 'comparison') {
                await loadComparison();
            } else if (activeTab === 'heatmap') {
                await loadHeatmap();
            } else if (activeTab === 'clients') {
                await loadTopClients();
            } else if (activeTab === 'trends') {
                await loadTrends();
            }
        } finally {
            setLoading(false);
        }
    };

    const getConnectorParam = () => {
        return selectedConnector === 'all' ? undefined : selectedConnector;
    };

    const loadComparison = async () => {
        try {
            const connector = getConnectorParam();
            console.log('🔍 [Comparison] Appel API avec connector:', connector);

            const response = await analyticsApi.comparePeriods('current', 'previous', connector);

            console.log('✅ [Comparison] Réponse:', response.data);
            setComparisonData(response.data);
            setErrors(prev => ({ ...prev, comparison: null }));
        } catch (error) {
            console.error('❌ [Comparison] Erreur:', error);
            console.error('❌ [Comparison] Response:', error.response?.data);
            console.error('❌ [Comparison] Status:', error.response?.status);

            const errorMsg = error.response?.data?.message || error.message || 'Erreur inconnue';
            setErrors(prev => ({ ...prev, comparison: errorMsg }));
            toast.error(`Comparaison: ${errorMsg}`);
        }
    };

    const loadHeatmap = async () => {
        try {
            const daysMap = { '7d': 7, '14d': 14, '30d': 30 };
            const days = daysMap[timeRange] || 7;
            const connector = getConnectorParam();

            console.log('🔍 [Heatmap] Appel API avec days:', days, 'connector:', connector);

            const response = await analyticsApi.getHeatmap(days, connector);

            console.log('✅ [Heatmap] Réponse:', response.data);
            setHeatmapData(response.data);
            setErrors(prev => ({ ...prev, heatmap: null }));
        } catch (error) {
            console.error('❌ [Heatmap] Erreur:', error);
            console.error('❌ [Heatmap] Response:', error.response?.data);

            const errorMsg = error.response?.data?.message || error.message || 'Erreur inconnue';
            setErrors(prev => ({ ...prev, heatmap: errorMsg }));
            toast.error(`Heatmap: ${errorMsg}`);
        }
    };

    const loadTopClients = async () => {
        try {
            const connector = getConnectorParam();
            console.log('🔍 [TopClients] Appel API avec timeRange:', timeRange, 'connector:', connector);

            const response = await analyticsApi.getTopClients(10, timeRange, connector);

            console.log('✅ [TopClients] Réponse:', response.data);
            setTopClientsData(response.data);
            setErrors(prev => ({ ...prev, clients: null }));
        } catch (error) {
            console.error('❌ [TopClients] Erreur:', error);
            console.error('❌ [TopClients] Response:', error.response?.data);

            const errorMsg = error.response?.data?.message || error.message || 'Erreur inconnue';
            setErrors(prev => ({ ...prev, clients: errorMsg }));
            toast.error(`Top Clients: ${errorMsg}`);
        }
    };

    const loadTrends = async () => {
        try {
            const daysMap = { '7d': 7, '14d': 14, '30d': 30 };
            const days = daysMap[timeRange] || 7;
            const connector = getConnectorParam();

            console.log('🔍 [Trends] Appel API avec days:', days, 'connector:', connector);

            const response = await analyticsApi.getTrends('requests', days, connector);

            console.log('✅ [Trends] Réponse:', response.data);
            setTrendsData(response.data);
            setErrors(prev => ({ ...prev, trends: null }));
        } catch (error) {
            console.error('❌ [Trends] Erreur:', error);
            console.error('❌ [Trends] Response:', error.response?.data);

            const errorMsg = error.response?.data?.message || error.message || 'Erreur inconnue';
            setErrors(prev => ({ ...prev, trends: errorMsg }));
            toast.error(`Trends: ${errorMsg}`);
        }
    };

    const ConnectorSelector = () => (
        <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg border border-gray-200">
            <Layers className="w-4 h-4 text-gray-500" />
            <select
                value={selectedConnector}
                onChange={(e) => setSelectedConnector(e.target.value)}
                className="border-0 bg-transparent text-sm font-medium text-gray-700 focus:outline-none focus:ring-0 cursor-pointer"
            >
                <option value="all">Tous les connecteurs</option>
                <option value="pi-gateway">PI Gateway</option>
                <option value="pi-connector">PI Connector</option>
            </select>
        </div>
    );

    const tabs = [
        { id: 'overview', label: 'Vue d\'ensemble', icon: BarChart3 },
        { id: 'comparison', label: 'Comparaison', icon: Activity },
        { id: 'heatmap', label: 'Heatmap', icon: Calendar },
        { id: 'clients', label: 'Top Clients', icon: Users },
        { id: 'trends', label: 'Tendances', icon: TrendingUp }
    ];

    const timeRangeOptions = [
        { value: '7d', label: '7 jours' },
        { value: '14d', label: '14 jours' },
        { value: '30d', label: '30 jours' }
    ];

    // 🆕 DEBUG : Afficher les erreurs
    const hasErrors = Object.values(errors).some(e => e !== null);

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Analytics (DEBUG)</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Version debug avec logs détaillés
                    </p>
                </div>

                <div className="flex items-center gap-4">
                    <ConnectorSelector />

                    <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg border border-gray-200">
                        <Calendar className="w-4 h-4 text-gray-500" />
                        <select
                            value={timeRange}
                            onChange={(e) => setTimeRange(e.target.value)}
                            className="border-0 bg-transparent text-sm font-medium text-gray-700 focus:outline-none focus:ring-0"
                        >
                            {timeRangeOptions.map(option => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <button
                        onClick={loadData}
                        disabled={loading}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                        <span className="text-sm font-medium">Actualiser</span>
                    </button>
                </div>
            </div>

            {/* Badge connector */}
            {selectedConnector !== 'all' && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-center gap-2">
                    <Layers className="w-4 h-4 text-blue-600" />
                    <span className="text-sm text-blue-700">
                        Données filtrées pour : <strong>{selectedConnector === 'pi-gateway' ? 'PI Gateway' : 'PI Connector'}</strong>
                    </span>
                </div>
            )}

            {/* 🆕 DEBUG : Afficher les erreurs en haut */}
            {hasErrors && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 space-y-2">
                    <div className="flex items-center gap-2 text-red-800 font-medium">
                        <AlertCircle className="w-5 h-5" />
                        <span>Erreurs détectées (voir console F12 pour plus de détails)</span>
                    </div>
                    {errors.comparison && (
                        <div className="text-sm text-red-700">
                            <strong>Comparison:</strong> {errors.comparison}
                        </div>
                    )}
                    {errors.heatmap && (
                        <div className="text-sm text-red-700">
                            <strong>Heatmap:</strong> {errors.heatmap}
                        </div>
                    )}
                    {errors.clients && (
                        <div className="text-sm text-red-700">
                            <strong>Top Clients:</strong> {errors.clients}
                        </div>
                    )}
                    {errors.trends && (
                        <div className="text-sm text-red-700">
                            <strong>Trends:</strong> {errors.trends}
                        </div>
                    )}
                    <div className="mt-3 text-xs text-red-600">
                        💡 Ouvre la console (F12) pour voir les logs détaillés avec 🔍 ✅ ❌
                    </div>
                </div>
            )}

            {/* Tabs */}
            <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

            {/* Contenu */}
            {loading ? (
                <div className="flex items-center justify-center h-96">
                    <Loading message="Chargement des analytics..." />
                </div>
            ) : (
                <div className="space-y-6">
                    {/* 🆕 DEBUG : Afficher l'état des données */}
                    <Card>
                        <CardHeader>
                            <CardTitle>🔧 État des données (DEBUG)</CardTitle>
                        </CardHeader>
                        <CardBody>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                <div>
                                    <div className="font-medium">Comparison</div>
                                    <div className={comparisonData ? 'text-green-600' : 'text-red-600'}>
                                        {comparisonData ? '✓ Chargé' : '✗ Vide'}
                                    </div>
                                    {comparisonData && (
                                        <div className="text-xs text-gray-500 mt-1">
                                            {JSON.stringify(comparisonData).substring(0, 50)}...
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <div className="font-medium">Heatmap</div>
                                    <div className={heatmapData ? 'text-green-600' : 'text-red-600'}>
                                        {heatmapData ? `✓ ${Array.isArray(heatmapData) ? heatmapData.length : '?'} items` : '✗ Vide'}
                                    </div>
                                </div>
                                <div>
                                    <div className="font-medium">Top Clients</div>
                                    <div className={topClientsData ? 'text-green-600' : 'text-red-600'}>
                                        {topClientsData ? `✓ ${Array.isArray(topClientsData) ? topClientsData.length : '?'} items` : '✗ Vide'}
                                    </div>
                                </div>
                                <div>
                                    <div className="font-medium">Trends</div>
                                    <div className={trendsData ? 'text-green-600' : 'text-red-600'}>
                                        {trendsData ? `✓ ${Array.isArray(trendsData) ? trendsData.length : '?'} items` : '✗ Vide'}
                                    </div>
                                </div>
                            </div>
                        </CardBody>
                    </Card>

                    {/* Affichage normal selon l'onglet */}
                    {activeTab === 'overview' && (
                        <div className="text-center py-12">
                            <Activity className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-500">
                                {hasErrors ? 'Des erreurs sont survenues (voir ci-dessus)' : 'Aucune donnée disponible'}
                            </p>
                        </div>
                    )}

                    {activeTab === 'comparison' && comparisonData && (
                        <Card>
                            <CardHeader><CardTitle>Comparaison</CardTitle></CardHeader>
                            <CardBody>
                                <pre className="text-xs bg-gray-50 p-4 rounded overflow-auto max-h-96">
                                    {JSON.stringify(comparisonData, null, 2)}
                                </pre>
                            </CardBody>
                        </Card>
                    )}

                    {activeTab === 'heatmap' && heatmapData && (
                        <Card>
                            <CardHeader><CardTitle>Heatmap</CardTitle></CardHeader>
                            <CardBody>
                                <pre className="text-xs bg-gray-50 p-4 rounded overflow-auto max-h-96">
                                    {JSON.stringify(heatmapData, null, 2)}
                                </pre>
                            </CardBody>
                        </Card>
                    )}

                    {activeTab === 'clients' && topClientsData && (
                        <Card>
                            <CardHeader><CardTitle>Top Clients</CardTitle></CardHeader>
                            <CardBody>
                                <pre className="text-xs bg-gray-50 p-4 rounded overflow-auto max-h-96">
                                    {JSON.stringify(topClientsData, null, 2)}
                                </pre>
                            </CardBody>
                        </Card>
                    )}

                    {activeTab === 'trends' && trendsData && (
                        <Card>
                            <CardHeader><CardTitle>Trends</CardTitle></CardHeader>
                            <CardBody>
                                <pre className="text-xs bg-gray-50 p-4 rounded overflow-auto max-h-96">
                                    {JSON.stringify(trendsData, null, 2)}
                                </pre>
                            </CardBody>
                        </Card>
                    )}
                </div>
            )}
        </div>
    );
};

export default AnalyticsPage;