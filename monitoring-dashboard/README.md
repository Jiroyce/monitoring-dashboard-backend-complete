# 🚀 Monitoring Dashboard - Frontend

Dashboard React moderne pour visualiser les métriques et logs de **Pi-Gateway** et **Pi-Connector** en temps réel.

## ✨ Fonctionnalités

### 📊 Overview Dashboard
- Vue globale des services en temps réel
- Métriques clés : Requests, Success Rate, Latency, Error Rate
- Graphiques de timeline interactifs
- Auto-refresh toutes les 30 secondes
- Distribution des logs par type
- Alertes actives

### 🔍 Pages Détaillées
- **Pi-Gateway Details** : Métriques détaillées du gateway
- **Pi-Connector Details** : Métriques détaillées du connector
- Graphiques de latence (avg, P95, P99)
- Top endpoints avec statistiques
- Analyse des erreurs

### 📋 Logs Explorer
- **Filtres avancés** :
  - Par connector (pi-gateway, pi-connector)
  - Par type (API_IN, API_OUT, AUTH, PROCESSING)
  - **Par service** (NOUVEAU - pour logs PROCESSING)
  - Par status code
  - Par latence min/max
  - Par Client IP
  - Par date de début/fin
- Recherche par keywords
- Tri par timestamp ou latency
- Pagination
- Export CSV

### 🔬 Processing Tracer
- Trace complète des transactions
- Recherche par Message ID ou End-to-End ID
- Visualisation du flow étape par étape
- Détection des bottlenecks
- Timeline interactive

### 📈 Analytics
- Tendances sur 7/14/30 jours
- Top clients par volume
- Répartition Pi-Gateway vs Pi-Connector
- Distribution des status codes
- Endpoints les plus lents
- Heatmap du trafic (jour × heure)

## 🛠️ Technologies

- **React 18** - Framework UI
- **React Router** - Navigation
- **Recharts** - Graphiques interactifs
- **Tailwind CSS** - Styling moderne
- **Lucide React** - Icônes
- **Vite** - Build tool ultra-rapide

## 🚀 Installation

### Prérequis
- Node.js 16+ et npm

### 1. Installer les dépendances
```bash
npm install
```

### 2. Démarrer le serveur de développement
```bash
npm run dev
```

Le dashboard sera accessible sur **http://localhost:3000**

### 3. Configuration de l'API Backend

Par défaut, le frontend se connecte à `http://localhost:8080/api`.

Pour changer l'URL du backend, modifie `src/services/api.js` :

```javascript
const API_BASE_URL = 'http://ton-backend:8080/api';
```

## 📦 Build pour production

```bash
npm run build
```

Les fichiers de production seront dans le dossier `dist/`

## 🔌 APIs nécessaires

Le backend doit exposer les endpoints suivants :

### Metrics
- `GET /api/metrics/overview?timeRange={1h|6h|24h|7d|30d}`
- `GET /api/metrics/connector/{pi-gateway|pi-connector}?timeRange={timeRange}`

### Logs
- `GET /api/logs/search?query=...&connector=...&type=...&service=...&status=...&success=...&minLatency=...&maxLatency=...&clientIP=...&startTime=...&endTime=...&page=...&limit=...&sortBy=...&sortOrder=...`
- `GET /api/logs/errors?connector={all|pi-gateway|pi-connector}&limit={number}`
- `GET /api/logs/{logId}`

### Processing
- `GET /api/processing/trace/{messageId}`
- `GET /api/processing/trace?endToEndId={endToEndId}`

### Analytics
- `GET /api/analytics/comparison?period1=...&period2=...&connector=...`
- `GET /api/analytics/heatmap?days={7|14|30}&connector=...`
- `GET /api/analytics/trends?metric={requests|latency|errorRate}&days=...&connector=...`
- `GET /api/analytics/top-clients?limit=...&timeRange=...&connector=...`
- `GET /api/analytics/connector-breakdown?timeRange=...`
- `GET /api/analytics/anomalies?days=...&connector=...`
- `GET /api/analytics/top-endpoints?type={slowest|errors}&limit=...&timeRange=...&connector=...`
- `GET /api/analytics/status-distribution?timeRange=...&connector=...`

## 📂 Structure du projet

```
monitoring-dashboard/
├── src/
│   ├── components/          # Composants réutilisables
│   │   ├── Sidebar.jsx
│   │   ├── StatCard.jsx
│   │   ├── ServiceStatus.jsx
│   │   └── LoadingSpinner.jsx
│   ├── pages/              # Pages principales
│   │   ├── Overview.jsx
│   │   ├── PiGatewayDetails.jsx
│   │   ├── PiConnectorDetails.jsx
│   │   ├── LogsExplorer.jsx
│   │   ├── ProcessingTracer.jsx
│   │   └── Analytics.jsx
│   ├── services/           # Services API
│   │   └── api.js
│   ├── App.jsx            # Composant principal
│   ├── main.jsx           # Point d'entrée
│   └── index.css          # Styles globaux
├── package.json
├── vite.config.js
├── tailwind.config.js
└── README.md
```

## 🎨 Personnalisation

### Changer les couleurs
Modifie `tailwind.config.js` :

```javascript
theme: {
  extend: {
    colors: {
      primary: {
        500: '#0ea5e9',  // Couleur principale
        // ...
      }
    }
  }
}
```

### Modifier l'intervalle de refresh
Dans chaque page, change le `setInterval` :

```javascript
const interval = setInterval(fetchData, 30000); // 30 secondes
```

## 🔧 APIs à ajouter (si nécessaire)

Si tu as besoin d'endpoints supplémentaires pour le backend, voici des suggestions :

### 1. WebSocket pour temps réel
```javascript
// Optionnel pour les updates en temps réel
ws://localhost:8080/ws/metrics
```

### 2. Alertes configurables
```javascript
GET /api/alerts/active
POST /api/alerts/{alertId}/acknowledge
```

### 3. Export de rapports
```javascript
GET /api/export/logs?format=csv&...filters
GET /api/export/metrics?format=json&...
```

## 🐛 Troubleshooting

### Le dashboard ne charge pas les données
1. Vérifie que le backend est bien démarré sur `http://localhost:8080`
2. Ouvre la console du navigateur (F12) pour voir les erreurs
3. Vérifie que CORS est activé sur le backend (`@CrossOrigin`)

### Erreurs CORS
Le backend doit avoir :
```java
@CrossOrigin(origins = "*")
```

### Les graphiques ne s'affichent pas
Vérifie que les données retournées par l'API ont le bon format JSON.

## 📝 Notes

- Le dashboard utilise des **données mockées** pour les graphiques si l'API ne retourne pas de données
- Les **filtres par service** dans Logs Explorer sont spécifiquement pour les logs de type `PROCESSING`
- Le **refresh automatique** est actif sur toutes les pages (30s par défaut)
- L'**export CSV** est disponible sur la page Logs Explorer

## 🚀 Prochaines améliorations possibles

- [ ] WebSocket pour updates en temps réel
- [ ] Système d'alertes configurables
- [ ] Dashboards personnalisables
- [ ] Mode sombre
- [ ] Export PDF des rapports
- [ ] Comparaison de périodes
- [ ] Favoris et recherches sauvegardées

## 📞 Support

Pour toute question ou bug, contacte l'équipe DevOps ! 🚀
