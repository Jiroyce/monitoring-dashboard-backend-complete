# 🚀 Dashboard Monitoring PI-Gateway & PI-Connector

## 📊 Vue d'ensemble

Dashboard de monitoring **TEMPS RÉEL** pour visualiser les métriques et logs des connecteurs :
- **PI-Gateway** : Logs API_IN (requêtes entrantes)
- **PI-Connector** : Logs API_OUT (requêtes sortantes)
- **Logs PROCESSING** : Traitement métier avec service, messageId, endToEndId

## ✨ Fonctionnalités

### 🎯 Dashboard Principal (/)
- **Mise à jour automatique toutes les 3 secondes**
- Métriques globales en temps réel
- **Séparation claire des 2 connecteurs** :
  - PI-Gateway (API_IN) - bleu
  - PI-Connector (API_OUT) - vert
- Statistiques par connecteur :
  - Nombre de requêtes
  - Success rate
  - Latence moyenne
  - Uptime
- Graphiques temps réel :
  - Distribution des requêtes (pie chart)
  - Timeline requêtes/erreurs (area chart)
  - Latence P50/P95/P99 (line chart)
- Sélecteur de plage temporelle (1h, 6h, 24h, 7d, 30d)

### 📋 Page Logs (/logs)
- **Mise à jour automatique toutes les 5 secondes**
- **Info box** expliquant les types de logs
- Filtres avancés :
  - 🔍 Recherche (messageId, path, IP)
  - 📁 Type (API_IN, API_OUT, AUTH, PROCESSING)
  - 🖥️ Connecteur (pi-gateway, pi-connector)
  - 🎯 **Service (UNIQUEMENT pour PROCESSING)** - avec highlight visuel
  - 📊 Status code
  - ✅ Résultat (succès/erreurs)
  - ⏱️ Plage de latence
  - 🌐 IP client
- **Colonnes dynamiques** :
  - Colonnes standard : timestamp, type, connector, method, path, status, latence, success
  - **API_IN** : Client IP
  - **PROCESSING** : Service, MessageId, EndToEndId
- Badges colorés par type et connecteur
- Export CSV avec colonnes adaptées
- Pagination
- Pause/Reprise auto-refresh

## 🎨 Séparation des Connecteurs

### PI-Gateway (Bleu #3b82f6)
- Type principal : **API_IN**
- Logs des requêtes **entrantes**
- Affiche Client IP

### PI-Connector (Vert #10b981)
- Type principal : **API_OUT**
- Logs des requêtes **sortantes**

### PROCESSING (Rose #ec4899)
- Peut venir des deux connecteurs
- Contient : service, messageId, endToEndId
- Filtre service disponible uniquement pour ce type

## 🛠️ Installation

### Prérequis
- Node.js 16+
- Backend Spring Boot sur `http://localhost:8080`

### Étapes

```bash
# 1. Décompresser
unzip monitoring-dashboard-frontend.zip
cd monitoring-dashboard-frontend

# 2. Installer
npm install

# 3. Lancer
npm start
```

✅ Dashboard accessible sur `http://localhost:3000`

## 🔧 Configuration

### Changer l'URL du Backend

Modifie dans :
- `src/pages/Dashboard.js` ligne 9
- `src/pages/LogsPage.js` ligne 7

```javascript
const API_BASE_URL = 'http://YOUR_BACKEND:8080/api';
```

### Ajuster les Intervalles

**Dashboard** (défaut 3s) :
```javascript
// src/pages/Dashboard.js ligne 10
const REFRESH_INTERVAL = 3000;
```

**Logs** (défaut 5s) :
```javascript
// src/pages/LogsPage.js ligne 8
const REFRESH_INTERVAL = 5000;
```

## 📊 APIs Backend

### 1. GET /api/metrics/overview
**Paramètres** : `timeRange` (1h, 6h, 24h, 7d, 30d)

**Retour** : 
```json
{
  "timestamp": "2025-10-29T16:00:00Z",
  "timeRange": "1h",
  "services": [
    {
      "connector": "pi-gateway",
      "status": "UP",
      "totalRequests": 1234,
      "successRate": 99.5,
      "avgLatency": 25.3,
      "uptime": 99.9
    },
    {
      "connector": "pi-connector",
      "status": "UP",
      "totalRequests": 5678,
      "successRate": 99.8,
      "avgLatency": 32.1,
      "uptime": 99.95
    }
  ],
  "totals": {
    "totalRequests": 6912,
    "successfulRequests": 6890,
    "failedRequests": 22,
    "avgResponseTime": 28.7
  },
  "timeline": [
    {
      "timestamp": "2025-10-29T15:50:00Z",
      "requests": 150,
      "errors": 3,
      "avgLatency": 30,
      "p95Latency": 45,
      "p99Latency": 80
    }
  ]
}
```

### 2. GET /api/logs/search
**Paramètres** :
- `query`, `connector`, `type`, `status`, `success`
- `minLatency`, `maxLatency`, `clientIP`
- `service` (pour PROCESSING)
- `page`, `limit`, `sortBy`, `sortOrder`

**Retour** :
```json
{
  "total": 1000,
  "page": 1,
  "pages": 20,
  "limit": 50,
  "logs": [
    {
      "id": "1730217825123#API_IN#pi-gateway#abc123",
      "timestamp": "2025-10-29T15:50:25.123Z",
      "type": "API_IN",
      "connector": "pi-gateway",
      "method": "GET",
      "path": "/ci/api/v1/check",
      "statusCode": 200,
      "success": true,
      "responseTimeMs": 5.2,
      "clientIp": "35.197.32.224"
    },
    {
      "id": "1730217825456#PROCESSING#pi-gateway#def456",
      "timestamp": "2025-10-29T15:50:25.456Z",
      "type": "PROCESSING",
      "connector": "pi-gateway",
      "service": "payment-service",
      "method": "POST",
      "path": "/process/payment",
      "statusCode": 200,
      "success": true,
      "responseTimeMs": 150.5,
      "messageId": "MSG123",
      "endToEndId": "E2E456"
    }
  ]
}
```

## 🎯 Structure du Projet

```
monitoring-dashboard-frontend/
├── public/
│   └── index.html
├── src/
│   ├── pages/
│   │   ├── Dashboard.js          # Dashboard avec séparation connecteurs
│   │   ├── Dashboard.css
│   │   ├── LogsPage.js            # Logs avec filtres intelligents
│   │   └── LogsPage.css
│   ├── App.js                     # Router
│   ├── App.css                    # Styles globaux
│   ├── index.js
│   └── index.css
├── package.json
├── README.md
└── .gitignore
```

## 🚨 Points Importants

### Séparation des Connecteurs
✅ **PI-Gateway = API_IN** (bleu)  
✅ **PI-Connector = API_OUT** (vert)  
✅ **PROCESSING** = Les deux (rose, avec service)

### Colonnes Dynamiques
- **API_IN** : Affiche Client IP
- **API_OUT** : Pas de Client IP
- **PROCESSING** : Affiche Service, MessageId, EndToEndId
- **Type "Tous"** : Affiche toutes les colonnes possibles

### Filtre Service
- Apparaît **UNIQUEMENT** quand Type = PROCESSING
- Highlight visuel (fond rose)
- Recherche dans le champ service des logs PROCESSING

## 🐛 Dépannage

### Dashboard ne charge pas
1. Vérifie que le backend est lancé
2. Vérifie CORS dans le backend : `@CrossOrigin(origins = "*")`
3. Ouvre F12 → Console pour voir les erreurs

### Pas de graphiques
- Le backend doit retourner un tableau `timeline` dans OverviewMetricsDTO

### Colonnes manquantes
- C'est normal ! Les colonnes s'adaptent au type de log filtré

## 📦 Build Production

```bash
npm run build
```

Les fichiers optimisés sont dans `/build`

## 🎨 Couleurs et Thème

- **PI-Gateway** : Bleu (#3b82f6)
- **PI-Connector** : Vert (#10b981)
- **PROCESSING** : Rose (#ec4899)
- **Theme** : Dark mode professionnel
- **Accents** : Gradients subtils

## 📝 Logs Types Explained

| Type | Connecteur | Description | Colonnes spéciales |
|------|-----------|-------------|-------------------|
| API_IN | pi-gateway | Requêtes entrantes | Client IP |
| API_OUT | pi-connector | Requêtes sortantes | - |
| AUTH | Les deux | Authentification | - |
| PROCESSING | Les deux | Traitement métier | Service, MessageId, EndToEndId |

## ⚡ Temps Réel

- **Dashboard** : Refresh auto 3s
- **Logs** : Refresh auto 5s (pause possible)
- **Indicateur LIVE** : Animation verte
- **Timestamp** : Dernière mise à jour affichée

## 🎯 Usage Rapide

1. **Lance le backend** : `java -jar monitoring.jar`
2. **Lance le frontend** : `npm start`
3. **Dashboard** : Vois les 2 connecteurs séparés
4. **Logs** : Filtre par type pour voir les colonnes appropriées
5. **PROCESSING** : Sélectionne ce type pour voir le filtre service

---

**Fait avec ❤️ pour le monitoring temps réel PI-Gateway & PI-Connector**
