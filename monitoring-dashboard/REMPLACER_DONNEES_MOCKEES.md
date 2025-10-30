# 🔄 REMPLACER LES DONNÉES MOCKÉES PAR LES VRAIES

Ce guide explique comment remplacer les données de démonstration par les vraies données de ton backend.

---

## 📍 Où sont les données mockées ?

Les données mockées sont dans les composants de page pour permettre au dashboard de fonctionner même sans backend. Voici où les trouver :

### 1. **Overview.jsx** (page principale)
```javascript
// Lignes ~40-60
const requestsData = [
  { time: '13:00', piGateway: 1200, piConnector: 800 },
  // ...
];

const successRateData = [
  { time: '13:00', success: 99.5, error: 0.5 },
  // ...
];

const logDistribution = [
  { name: 'API_IN', value: 45, color: '#3b82f6' },
  // ...
];
```

### 2. **PiGatewayDetails.jsx** et **PiConnectorDetails.jsx**
```javascript
// Lignes ~30-50
const latencyData = [
  { time: '00:00', avg: 25, p95: 78, p99: 120 },
  // ...
];

const requestsData = [
  { time: '00:00', requests: 850, errors: 5 },
  // ...
];

const endpointsData = [
  { endpoint: '/ci/check', requests: 15234, avgLatency: 18, errors: 45 },
  // ...
];
```

### 3. **Analytics.jsx**
```javascript
// Lignes ~10-80
const trendsData = [...]
const topClientsData = [...]
const connectorBreakdownData = [...]
const statusDistributionData = [...]
const topEndpointsData = [...]
const heatmapData = [...]
```

---

## ✅ Ce qui utilise DÉJÀ les vraies données

Ces composants utilisent déjà l'API :

- ✅ **LogsExplorer.jsx** - Tout vient de l'API
- ✅ **ProcessingTracer.jsx** - Tout vient de l'API
- ✅ Les appels à `api.getOverview()`, `api.getErrors()`, etc.

---

## 🔧 Comment remplacer les données mockées

### Méthode 1 : Utiliser les données de l'API (RECOMMANDÉ)

Remplace les données mockées par les données qui viennent de l'API.

#### Exemple pour Overview.jsx :

**AVANT (avec mock) :**
```javascript
const Overview = () => {
  const [data, setData] = useState(null);
  
  // Données mockées
  const requestsData = [
    { time: '13:00', piGateway: 1200, piConnector: 800 },
    // ...
  ];
  
  return (
    <AreaChart data={requestsData}>
      {/* ... */}
    </AreaChart>
  );
};
```

**APRÈS (avec API) :**
```javascript
const Overview = () => {
  const [data, setData] = useState(null);
  const [requestsData, setRequestsData] = useState([]);
  
  useEffect(() => {
    const fetchData = async () => {
      const result = await api.getOverview(timeRange);
      setData(result);
      
      // Transformer les données de l'API en format pour le graphique
      if (result.timeline) {
        const transformed = result.timeline.map(item => ({
          time: item.timestamp,
          piGateway: item.pi_gateway_requests,
          piConnector: item.pi_connector_requests
        }));
        setRequestsData(transformed);
      }
    };
    fetchData();
  }, [timeRange]);
  
  return (
    <AreaChart data={requestsData}>
      {/* ... */}
    </AreaChart>
  );
};
```

---

### Méthode 2 : Ajouter des endpoints à l'API

Si ton backend ne retourne pas encore toutes les données nécessaires pour les graphiques, ajoute ces endpoints :

#### 1. Timeline des requêtes
```java
GET /api/metrics/timeline?timeRange=1h&interval=15m

Response:
{
  "timeline": [
    {
      "timestamp": "2025-10-27T13:00:00Z",
      "pi_gateway_requests": 1200,
      "pi_connector_requests": 800,
      "total_requests": 2000,
      "success_rate": 99.5,
      "error_rate": 0.5
    },
    // ...
  ]
}
```

#### 2. Données de latence
```java
GET /api/metrics/latency-timeline?timeRange=24h&connector=pi-gateway

Response:
{
  "latency": [
    {
      "timestamp": "2025-10-27T00:00:00Z",
      "avg": 25,
      "p95": 78,
      "p99": 120
    },
    // ...
  ]
}
```

#### 3. Top endpoints
```java
GET /api/analytics/top-endpoints?limit=5&sortBy=requests&connector=pi-gateway

Response:
{
  "endpoints": [
    {
      "path": "/ci/check",
      "requests": 15234,
      "avg_latency_ms": 18,
      "errors": 45,
      "error_rate": 0.29
    },
    // ...
  ]
}
```

---

## 📝 Checklist de remplacement

Pour chaque page, voici ce qu'il faut faire :

### Overview.jsx
- [ ] Remplacer `requestsData` par données de `/api/metrics/timeline`
- [ ] Remplacer `successRateData` par données de `/api/metrics/timeline`
- [ ] Remplacer `logDistribution` par données de `/api/analytics/log-distribution`
- [ ] Les erreurs viennent déjà de l'API ✅

### PiGatewayDetails.jsx
- [ ] Remplacer `latencyData` par données de `/api/metrics/latency-timeline`
- [ ] Remplacer `requestsData` par données de `/api/metrics/timeline`
- [ ] Remplacer `endpointsData` par données de `/api/analytics/top-endpoints`

### PiConnectorDetails.jsx
- [ ] Même chose que PiGatewayDetails mais avec `connector=pi-connector`

### Analytics.jsx
- [ ] Remplacer `trendsData` par données de `/api/analytics/trends`
- [ ] Remplacer `topClientsData` par données de `/api/analytics/top-clients` ✅
- [ ] Remplacer `connectorBreakdownData` par données de `/api/analytics/connector-breakdown` ✅
- [ ] Remplacer `statusDistributionData` par données de `/api/analytics/status-distribution` ✅
- [ ] Remplacer `topEndpointsData` par données de `/api/analytics/top-endpoints` ✅
- [ ] Remplacer `heatmapData` par données de `/api/analytics/heatmap` ✅

---

## 🎯 Stratégie recommandée

### Phase 1 - Utiliser ce qui existe déjà (5 min)
1. Les pages **Logs** et **Processing** utilisent déjà les vraies données
2. Teste le dashboard avec ces pages d'abord
3. Vérifie que les appels API fonctionnent

### Phase 2 - Ajouter les endpoints manquants (2-3h)
1. Ajoute `/api/metrics/timeline` au backend
2. Ajoute `/api/metrics/latency-timeline` au backend
3. Ajoute `/api/analytics/log-distribution` au backend

### Phase 3 - Connecter le frontend (1h)
1. Remplace les données mockées une par une
2. Teste chaque graphique après modification
3. Gère les cas d'erreur (backend down, pas de données)

---

## 💡 Conseil Pro

**Ne remplace pas tout d'un coup !**

Garde les données mockées comme fallback :

```javascript
const fetchData = async () => {
  try {
    const result = await api.getTimeline(timeRange);
    setRequestsData(result.timeline);
  } catch (error) {
    console.error('Error fetching data:', error);
    // Garde les données mockées si l'API échoue
    setRequestsData(MOCK_DATA);
  }
};
```

Comme ça, le dashboard reste fonctionnel même si le backend a des problèmes ! 🚀

---

## 🎨 Exemple complet de transformation

Voici un exemple complet pour Overview.jsx :

```javascript
// AVANT
const Overview = () => {
  const requestsData = [
    { time: '13:00', piGateway: 1200, piConnector: 800 },
    // ...
  ];
  
  return <AreaChart data={requestsData} />;
};

// APRÈS
const Overview = () => {
  const [requestsData, setRequestsData] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const result = await api.getTimeline(timeRange);
        
        // Transformer les données de l'API
        const transformed = result.timeline.map(item => ({
          time: new Date(item.timestamp).toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit' 
          }),
          piGateway: item.pi_gateway_requests,
          piConnector: item.pi_connector_requests
        }));
        
        setRequestsData(transformed);
      } catch (error) {
        console.error('Error:', error);
        // Fallback vers données mockées
        setRequestsData(MOCK_REQUESTS_DATA);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [timeRange]);
  
  if (loading) return <LoadingSpinner />;
  
  return <AreaChart data={requestsData} />;
};
```

---

**Bon courage ! Le dashboard fonctionne déjà, maintenant tu peux l'améliorer progressivement ! 🚀**
