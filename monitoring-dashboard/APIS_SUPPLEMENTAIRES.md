# 🔌 APIs SUPPLÉMENTAIRES À AJOUTER (Optionnel)

Ce document liste les APIs que tu pourrais vouloir ajouter au backend pour améliorer le dashboard.

---

## ✅ APIs DÉJÀ IMPLÉMENTÉES (d'après ta doc)

Ces APIs sont déjà utilisées par le frontend :

### Metrics
- ✅ `GET /api/metrics/overview`
- ✅ `GET /api/metrics/connector/{connectorName}`

### Logs
- ✅ `GET /api/logs/search` (avec tous les filtres y compris `service`)
- ✅ `GET /api/logs/errors`
- ✅ `GET /api/logs/{logId}`

### Processing
- ✅ `GET /api/processing/trace/{messageId}`
- ✅ `GET /api/processing/trace?endToEndId={id}`

### Analytics
- ✅ `GET /api/analytics/comparison`
- ✅ `GET /api/analytics/heatmap`
- ✅ `GET /api/analytics/trends`
- ✅ `GET /api/analytics/top-clients`
- ✅ `GET /api/analytics/connector-breakdown`
- ✅ `GET /api/analytics/anomalies`
- ✅ `GET /api/analytics/top-endpoints`
- ✅ `GET /api/analytics/status-distribution`

---

## 🆕 APIs SUGGÉRÉES POUR AMÉLIORER LE DASHBOARD

### 1. WebSocket pour temps réel

Au lieu de faire du polling toutes les 30s, tu pourrais avoir un WebSocket :

```
ws://localhost:8080/ws/metrics

Message format:
{
  "type": "metrics_update",
  "data": {
    "pi_gateway": { ... },
    "pi_connector": { ... }
  }
}
```

**Bénéfice** : Vraiment temps réel, moins de charge sur le serveur

---

### 2. Alertes configurables

```java
// Récupérer les alertes actives
GET /api/alerts/active
Response:
{
  "alerts": [
    {
      "id": "alert_123",
      "severity": "critical",
      "message": "Error rate > 5%",
      "triggered_at": "2025-10-27T14:00:00Z"
    }
  ]
}

// Accuser réception d'une alerte
POST /api/alerts/{alertId}/acknowledge
Body:
{
  "acknowledged_by": "user@example.com",
  "comment": "On it"
}
```

---

### 3. Configuration des seuils

```java
// Récupérer les seuils configurés
GET /api/config/thresholds
Response:
{
  "error_rate_critical": 5.0,
  "error_rate_warning": 2.0,
  "latency_critical": 500,
  "latency_warning": 200
}

// Mettre à jour les seuils
PUT /api/config/thresholds
Body:
{
  "error_rate_critical": 10.0,
  "latency_warning": 300
}
```

---

### 4. Export amélioré

```java
// Export avec filtres
GET /api/export/logs?format=csv&connector=pi-gateway&startTime=...&endTime=...

// Export rapport complet
GET /api/export/report?format=pdf&timeRange=7d
```

---

### 5. Recherche de logs par Message ID

Actuellement, le frontend utilise `query` pour chercher, mais une API dédiée serait mieux :

```java
GET /api/logs/by-message/{messageId}
Response:
{
  "logs": [
    { "timestamp": "...", "type": "API_IN", ... },
    { "timestamp": "...", "type": "PROCESSING", ... },
    { "timestamp": "...", "type": "API_OUT", ... }
  ]
}
```

---

### 6. Statistiques en temps réel

```java
GET /api/metrics/realtime
Response:
{
  "current_rps": 1234,
  "current_latency": 28,
  "current_error_rate": 0.8,
  "active_connections": 456
}
```

---

### 7. Health Check détaillé

```java
GET /api/health/detailed
Response:
{
  "status": "healthy",
  "services": {
    "bigtable": { "status": "up", "latency_ms": 5 },
    "redis": { "status": "up", "latency_ms": 2 },
    "pubsub": { "status": "up", "latency_ms": 8 }
  },
  "uptime_seconds": 345600
}
```

---

### 8. Logs par lot (batch)

Pour optimiser les performances :

```java
POST /api/logs/batch
Body:
{
  "log_ids": ["log_1", "log_2", "log_3"]
}
Response:
{
  "logs": [...]
}
```

---

### 9. Favoris et recherches sauvegardées

```java
// Sauvegarder une recherche
POST /api/saved-searches
Body:
{
  "name": "Erreurs Pi-Gateway aujourd'hui",
  "filters": { "connector": "pi-gateway", "success": false, ... }
}

// Récupérer les recherches sauvegardées
GET /api/saved-searches
```

---

### 10. API de santé globale

```java
GET /api/system/health
Response:
{
  "overall_status": "healthy",
  "services": [
    {
      "name": "pi-gateway",
      "status": "healthy",
      "checks": {
        "database": "ok",
        "memory": "ok",
        "cpu": "ok"
      }
    }
  ]
}
```

---

## 🎯 Priorités recommandées

Si tu veux améliorer le dashboard, voici l'ordre suggéré :

### Phase 1 (Essentiel)
1. ✅ Toutes les APIs actuelles fonctionnent bien
2. 🔧 Ajouter `GET /api/alerts/active` pour les alertes

### Phase 2 (Amélioration)
3. 🚀 WebSocket pour temps réel
4. 📊 API de métriques en temps réel
5. 📥 Export CSV/JSON amélioré

### Phase 3 (Bonus)
6. ⚙️ Configuration des seuils
7. 💾 Recherches sauvegardées
8. 📈 Health check détaillé

---

## 💡 Note importante

**Le dashboard fonctionne DÉJÀ avec les APIs que tu as !**

Toutes ces suggestions sont des **améliorations optionnelles**. Le frontend utilise actuellement :
- Données mockées pour certains graphiques (facilement remplaçables)
- Polling toutes les 30s (remplaçable par WebSocket)
- Filtres qui envoient tous les paramètres à `/api/logs/search`

Tu n'as **rien besoin d'ajouter** pour que ça fonctionne. Ces suggestions sont juste si tu veux aller plus loin ! 🚀
