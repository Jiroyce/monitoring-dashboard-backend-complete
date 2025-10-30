# 🧪 EXEMPLES DE REQUÊTES API POUR TESTER

Ce fichier contient des exemples de requêtes curl pour tester ton backend.

---

## 🎯 BASE URL
```bash
export API_URL="http://localhost:8080/api"
```

---

## 📊 METRICS

### 1. Overview
```bash
# Overview avec timeRange 1h
curl -X GET "$API_URL/metrics/overview?timeRange=1h"

# Overview avec timeRange 24h
curl -X GET "$API_URL/metrics/overview?timeRange=24h"

# Overview avec timeRange 7d
curl -X GET "$API_URL/metrics/overview?timeRange=7d"
```

### 2. Connector Metrics
```bash
# Métriques Pi-Gateway
curl -X GET "$API_URL/metrics/connector/pi-gateway?timeRange=24h"

# Métriques Pi-Connector
curl -X GET "$API_URL/metrics/connector/pi-connector?timeRange=24h"
```

---

## 📋 LOGS

### 3. Search Logs
```bash
# Recherche simple
curl -X GET "$API_URL/logs/search?query=payment&limit=10"

# Recherche avec filtres avancés
curl -X GET "$API_URL/logs/search?connector=pi-gateway&type=API_IN&success=false&limit=20"

# Recherche logs PROCESSING par service
curl -X GET "$API_URL/logs/search?type=PROCESSING&service=payment-service&limit=50"

# Recherche avec latence
curl -X GET "$API_URL/logs/search?minLatency=100&maxLatency=1000&sortBy=latency&sortOrder=desc"

# Recherche par client IP
curl -X GET "$API_URL/logs/search?clientIP=192.168.1.100&limit=50"

# Recherche par date
curl -X GET "$API_URL/logs/search?startTime=2025-10-27T00:00:00Z&endTime=2025-10-27T23:59:59Z"

# Recherche par status code
curl -X GET "$API_URL/logs/search?status=500&limit=100"

# Combinaison de plusieurs filtres
curl -X GET "$API_URL/logs/search?connector=pi-gateway&type=PROCESSING&service=payment-service&success=false&minLatency=50&maxLatency=500&page=1&limit=50&sortBy=timestamp&sortOrder=desc"
```

### 4. Errors
```bash
# Toutes les erreurs
curl -X GET "$API_URL/logs/errors?limit=50"

# Erreurs Pi-Gateway seulement
curl -X GET "$API_URL/logs/errors?connector=pi-gateway&limit=100"

# Erreurs Pi-Connector seulement
curl -X GET "$API_URL/logs/errors?connector=pi-connector&limit=100"
```

### 5. Log by ID
```bash
# Récupérer un log spécifique
curl -X GET "$API_URL/logs/log_12345"
```

---

## 🔬 PROCESSING

### 6. Trace by Message ID
```bash
# Tracer une transaction par Message ID
curl -X GET "$API_URL/processing/trace/msg_abc123"

# Autre exemple
curl -X GET "$API_URL/processing/trace/MSG_2025102714234567"
```

### 7. Trace by End-to-End ID
```bash
# Tracer par End-to-End ID
curl -X GET "$API_URL/processing/trace?endToEndId=e2e_xyz789"

# Autre exemple
curl -X GET "$API_URL/processing/trace?endToEndId=E2E_2025102714234567890"
```

---

## 📈 ANALYTICS

### 8. Comparison
```bash
# Comparer cette semaine vs semaine dernière
curl -X GET "$API_URL/analytics/comparison?period1=current&period2=previous"

# Comparer avec connector spécifique
curl -X GET "$API_URL/analytics/comparison?period1=current&period2=previous&connector=pi-gateway"
```

### 9. Heatmap
```bash
# Heatmap 7 jours
curl -X GET "$API_URL/analytics/heatmap?days=7"

# Heatmap 14 jours
curl -X GET "$API_URL/analytics/heatmap?days=14"

# Heatmap 30 jours
curl -X GET "$API_URL/analytics/heatmap?days=30"

# Heatmap pour un connector
curl -X GET "$API_URL/analytics/heatmap?days=7&connector=pi-gateway"
```

### 10. Trends
```bash
# Tendances des requêtes
curl -X GET "$API_URL/analytics/trends?metric=requests&days=7"

# Tendances de latence
curl -X GET "$API_URL/analytics/trends?metric=latency&days=30"

# Tendances du taux d'erreur
curl -X GET "$API_URL/analytics/trends?metric=errorRate&days=14"

# Tendances pour un connector
curl -X GET "$API_URL/analytics/trends?metric=latency&days=7&connector=pi-connector"
```

### 11. Top Clients
```bash
# Top 10 clients
curl -X GET "$API_URL/analytics/top-clients?limit=10&timeRange=7d"

# Top 20 clients sur 30 jours
curl -X GET "$API_URL/analytics/top-clients?limit=20&timeRange=30d"

# Top clients pour un connector
curl -X GET "$API_URL/analytics/top-clients?limit=10&timeRange=7d&connector=pi-gateway"
```

### 12. Connector Breakdown
```bash
# Répartition sur 24h
curl -X GET "$API_URL/analytics/connector-breakdown?timeRange=24h"

# Répartition sur 7 jours
curl -X GET "$API_URL/analytics/connector-breakdown?timeRange=7d"

# Répartition sur 30 jours
curl -X GET "$API_URL/analytics/connector-breakdown?timeRange=30d"
```

### 13. Anomalies
```bash
# Détecter les anomalies sur 7 jours
curl -X GET "$API_URL/analytics/anomalies?days=7"

# Anomalies sur 30 jours
curl -X GET "$API_URL/analytics/anomalies?days=30"

# Anomalies pour un connector
curl -X GET "$API_URL/analytics/anomalies?days=7&connector=pi-gateway"
```

### 14. Top Endpoints
```bash
# Endpoints les plus lents
curl -X GET "$API_URL/analytics/top-endpoints?type=slowest&limit=10&timeRange=24h"

# Endpoints avec le plus d'erreurs
curl -X GET "$API_URL/analytics/top-endpoints?type=errors&limit=10&timeRange=24h"

# Top endpoints pour un connector
curl -X GET "$API_URL/analytics/top-endpoints?type=slowest&limit=5&timeRange=7d&connector=pi-gateway"
```

### 15. Status Distribution
```bash
# Distribution sur 24h
curl -X GET "$API_URL/analytics/status-distribution?timeRange=24h"

# Distribution sur 7 jours
curl -X GET "$API_URL/analytics/status-distribution?timeRange=7d"

# Distribution pour un connector
curl -X GET "$API_URL/analytics/status-distribution?timeRange=24h&connector=pi-connector"
```

---

## 🧪 TESTS AVEC jq (pour formater le JSON)

Si tu as `jq` installé :

```bash
# Overview formaté
curl -s "$API_URL/metrics/overview?timeRange=1h" | jq

# Compter les logs retournés
curl -s "$API_URL/logs/search?limit=100" | jq '.logs | length'

# Extraire uniquement les paths des erreurs
curl -s "$API_URL/logs/errors?limit=10" | jq '.[] | .path'

# Voir les services distincts dans les logs PROCESSING
curl -s "$API_URL/logs/search?type=PROCESSING&limit=100" | jq '.logs[] | .service' | sort -u
```

---

## 🔍 TESTS DE FILTRES POUR LOGS EXPLORER

### Scénario 1 : Erreurs Pi-Gateway aujourd'hui
```bash
curl -X GET "$API_URL/logs/search?connector=pi-gateway&success=false&startTime=2025-10-27T00:00:00Z&endTime=2025-10-27T23:59:59Z"
```

### Scénario 2 : Logs lents (> 500ms) de payment-service
```bash
curl -X GET "$API_URL/logs/search?type=PROCESSING&service=payment-service&minLatency=500&sortBy=latency&sortOrder=desc"
```

### Scénario 3 : Tous les logs d'un client spécifique
```bash
curl -X GET "$API_URL/logs/search?clientIP=192.168.1.100&sortBy=timestamp&sortOrder=desc&limit=100"
```

### Scénario 4 : Logs PROCESSING triés par service
```bash
curl -X GET "$API_URL/logs/search?type=PROCESSING&sortBy=timestamp&sortOrder=desc&limit=50"
```

### Scénario 5 : 5xx errors uniquement
```bash
curl -X GET "$API_URL/logs/search?status=5&success=false&limit=100"
```

---

## 🎯 TESTS DE PERFORMANCE

### Test 1 : Pagination
```bash
# Page 1
curl -X GET "$API_URL/logs/search?page=1&limit=50"

# Page 2
curl -X GET "$API_URL/logs/search?page=2&limit=50"

# Page 3
curl -X GET "$API_URL/logs/search?page=3&limit=50"
```

### Test 2 : Différents time ranges
```bash
curl -X GET "$API_URL/metrics/overview?timeRange=1h"
curl -X GET "$API_URL/metrics/overview?timeRange=6h"
curl -X GET "$API_URL/metrics/overview?timeRange=24h"
curl -X GET "$API_URL/metrics/overview?timeRange=7d"
curl -X GET "$API_URL/metrics/overview?timeRange=30d"
```

---

## 🚀 SCRIPT DE TEST COMPLET

Crée un fichier `test_api.sh` :

```bash
#!/bin/bash

API_URL="http://localhost:8080/api"

echo "🧪 Testing Monitoring Dashboard API..."
echo ""

echo "1️⃣ Testing Overview..."
curl -s "$API_URL/metrics/overview?timeRange=1h" | jq -r '.key_metrics.total_requests' && echo "✅ Overview OK"

echo ""
echo "2️⃣ Testing Logs Search..."
curl -s "$API_URL/logs/search?limit=5" | jq -r '.logs | length' && echo "✅ Logs Search OK"

echo ""
echo "3️⃣ Testing Errors..."
curl -s "$API_URL/logs/errors?limit=5" | jq -r 'length' && echo "✅ Errors OK"

echo ""
echo "4️⃣ Testing Connector Metrics..."
curl -s "$API_URL/metrics/connector/pi-gateway?timeRange=24h" | jq -r '.uptime_pct' && echo "✅ Connector Metrics OK"

echo ""
echo "5️⃣ Testing Analytics..."
curl -s "$API_URL/analytics/connector-breakdown?timeRange=24h" | jq -r '.pi_gateway_pct' && echo "✅ Analytics OK"

echo ""
echo "✅ All tests completed!"
```

Rends-le exécutable et lance-le :
```bash
chmod +x test_api.sh
./test_api.sh
```

---

## 📝 NOTES

### Format des dates
Les dates doivent être en **ISO 8601** :
```
2025-10-27T14:23:45.123Z
```

### Encodage des paramètres
Si tu utilises des caractères spéciaux dans `query`, encode-les :
```bash
# Mauvais
curl "$API_URL/logs/search?query=payment & transfer"

# Bon
curl "$API_URL/logs/search?query=payment%20%26%20transfer"
```

### Test CORS
Pour tester CORS depuis le navigateur :
```javascript
fetch('http://localhost:8080/api/metrics/overview?timeRange=1h')
  .then(r => r.json())
  .then(console.log)
  .catch(console.error)
```

---

**Bon testing ! 🚀**
