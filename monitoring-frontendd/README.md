# 🚀 Monitoring Dashboard - Frontend

Dashboard en temps réel pour visualiser les logs et métriques de **Pi-Gateway** et **Pi-Connector**.

## ✨ Fonctionnalités

### 📊 Dashboard Principal
- Vue d'ensemble en temps réel
- Métriques clés (requêtes, succès, erreurs, latence)
- Graphiques interactifs avec Recharts
- Actualisation automatique configurable (5s, 10s, 30s, 1min)
- Cartes de statut pour chaque connecteur

### 🔍 Logs Explorer
- **Recherche avancée** avec filtres multiples
- **Filtrage par service** pour les logs PROCESSING ✅
- Filtres disponibles:
  - Query (path, IP, messageId)
  - Connector (pi-gateway, pi-connector)
  - Type (API_IN, API_OUT, PROCESSING, AUTH)
  - Status code
  - Success/Failure
  - Latence (min/max)
  - Client IP
  - **Service (uniquement pour PROCESSING)**
- Pagination
- Export JSON
- Actualisation automatique

### 📈 Pages Détaillées
- **Pi-Gateway Details**: Métriques spécifiques
- **Pi-Connector Details**: Métriques spécifiques
- **Analytics**: Tendances et insights

### ⚡ Temps Réel
- Actualisation automatique toutes les 5-60 secondes
- Indicateur "Live" avec animation
- Timestamp de dernière mise à jour
- Bouton refresh manuel

## 🛠️ Stack Technique

- **React 18** - UI Framework
- **Vite** - Build tool ultra-rapide
- **React Router** - Navigation
- **Axios** - HTTP client
- **Recharts** - Graphiques interactifs
- **Tailwind CSS** - Styling
- **Lucide React** - Icônes
- **date-fns** - Formatage de dates

## 📦 Installation

```bash
# Installer les dépendances
npm install

# Copier le fichier d'environnement
cp .env.example .env

# Modifier .env avec l'URL de ton backend
# VITE_API_URL=http://localhost:8080
```

## 🚀 Lancement

### Mode développement
```bash
npm run dev
```
Le dashboard sera accessible sur `http://localhost:3000`

### Build production
```bash
npm run build
npm run preview
```

## 🔧 Configuration

### Backend URL
Dans `.env`:
```env
VITE_API_URL=http://localhost:8080
```

### Proxy Vite
Le fichier `vite.config.js` configure automatiquement un proxy vers le backend sur `/api/*`.

## 📡 APIs Backend Requises

Le frontend s'attend à ces endpoints (déjà présents dans ton backend Spring Boot):

### Metrics
- `GET /api/metrics/overview?timeRange={1h|6h|24h|7d|30d}`
- `GET /api/metrics/connector/{connectorName}?timeRange={timeRange}`

### Logs
- `GET /api/logs/search?query=...&connector=...&type=...&service=...&...`
- `GET /api/logs/errors?connector={connector}&limit={limit}`
- `GET /api/logs/{logId}`

### Analytics
- `GET /api/analytics/trends?timeRange={timeRange}&connector={connector}`
- `GET /api/analytics/comparison?period1={period1}&period2={period2}`
- `GET /api/analytics/heatmap?days={days}`

## 🎨 Personnalisation

### Intervalles de rafraîchissement
Modifie dans `src/hooks/useAutoRefresh.js` ou dans les composants.

### Couleurs
Modifie `tailwind.config.js` pour personnaliser le thème.

### Graphiques
Les graphiques sont configurables dans chaque page (`src/pages/*.jsx`).

## 📂 Structure du Projet

```
monitoring-frontend/
├── src/
│   ├── components/       # Composants réutilisables
│   │   ├── Header.jsx
│   │   ├── Navigation.jsx
│   │   ├── MetricCard.jsx
│   │   ├── StatusBadge.jsx
│   │   └── LogEntry.jsx
│   ├── pages/           # Pages du dashboard
│   │   ├── Dashboard.jsx
│   │   ├── LogsExplorer.jsx
│   │   ├── ConnectorDetails.jsx
│   │   └── Analytics.jsx
│   ├── services/        # Services API
│   │   └── api.js
│   ├── hooks/           # Custom hooks
│   │   └── useAutoRefresh.js
│   ├── utils/           # Utilitaires
│   │   └── formatters.js
│   ├── App.jsx          # Composant principal
│   ├── main.jsx         # Point d'entrée
│   └── index.css        # Styles globaux
├── public/
├── index.html
├── vite.config.js
├── tailwind.config.js
├── package.json
└── README.md
```

## 🎯 Filtrage par Service (PROCESSING)

Le filtre "Service" apparaît automatiquement quand tu sélectionnes le type "PROCESSING" dans les filtres. Il permet de filtrer les logs PROCESSING par service (payment-service, notification-service, etc.).

### Exemple d'utilisation:
1. Ouvre "Logs Explorer"
2. Sélectionne Type = "PROCESSING"
3. Le champ "Service" apparaît avec une bordure verte
4. Entre le nom du service (ex: "payment-service")
5. Les logs sont filtrés en temps réel

## 🐛 Troubleshooting

### Le dashboard ne charge pas les données
1. Vérifie que le backend tourne sur `http://localhost:8080`
2. Vérifie la console du navigateur pour les erreurs CORS
3. Vérifie que ton backend a le CORS activé (`@CrossOrigin(origins = "*")`)

### Les graphiques ne s'affichent pas
1. Vérifie que les données du backend ont le bon format
2. Ouvre la console pour voir les erreurs
3. Vérifie que Recharts est bien installé

### L'auto-refresh ne fonctionne pas
1. Vérifie que la checkbox "Actualisation automatique" est cochée
2. Vérifie l'intervalle sélectionné
3. Ouvre la console pour voir les erreurs API

## 📝 Notes Importantes

- **Pas d'authentification**: Le frontend ne gère pas l'auth (comme demandé)
- **Pas de mock data**: Toutes les données viennent du backend réel
- **Temps réel**: Actualisation automatique configurable
- **Filtrage avancé**: Support complet des filtres backend
- **Service PROCESSING**: Filtre spécial qui n'apparaît que pour les logs PROCESSING

## 🚀 Déploiement

### Build
```bash
npm run build
```

Les fichiers de production sont dans `dist/`.

### Servir les fichiers
Tu peux servir le dossier `dist/` avec n'importe quel serveur web:
- Nginx
- Apache
- Cloud Run
- Vercel
- Netlify

Exemple avec serve:
```bash
npm install -g serve
serve -s dist -p 3000
```

## 📞 Support

En cas de problème:
1. Vérifie la console du navigateur
2. Vérifie les logs du backend
3. Vérifie que toutes les APIs backend retournent les bonnes données

---

**Version**: 1.0.0  
**Date**: Octobre 2025  
**Build avec** ⚡ Vite + ⚛️ React + 🎨 Tailwind
