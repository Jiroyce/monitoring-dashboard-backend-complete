# 🔧 Modifications Backend Requises

## ⚠️ Vérifications Importantes

Voici ce que ton backend DOIT retourner pour que le frontend fonctionne correctement.

## 1. 📊 `/api/metrics/overview`

### Requête
```
GET /api/metrics/overview?timeRange=1h
```

### Réponse Attendue
```json
{
  "totalMetrics": {
    "totalRequests": 45678,
    "requestsChange": 12.5,
    "successRate": 99.2,
    "successRateChange": -0.3,
    "errorRate": 0.8,
    "errorRateChange": 0.3,
    "avgLatency": 28.5,
    "latencyChange": -5.0,
    "p50Latency": 15,
    "p95Latency": 87,
    "p99Latency": 150
  },
  "connectorMetrics": [
    {
      "name": "pi-gateway",
      "status": "HEALTHY",
      "uptime": 99.95,
      "requestsPerMinute": 1234,
      "avgLatency": 23,
      "p95Latency": 65
    },
    {
      "name": "pi-connector",
      "status": "HEALTHY",
      "uptime": 98.73,
      "requestsPerMinute": 567,
      "avgLatency": 45,
      "p95Latency": 120
    }
  ],
  "timeline": [
    {
      "timestamp": "13:00",
      "pi-gateway": 1200,
      "pi-connector": 450
    },
    {
      "timestamp": "13:15",
      "pi-gateway": 1450,
      "pi-connector": 520
    }
  ],
  "statusDistribution": {
    "API_IN": 12000,
    "API_OUT": 8500,
    "PROCESSING": 2000,
    "AUTH": 3178
  }
}
```

### ✅ Si ça existe déjà
Ton `MetricsController.java` et `MetricsService.java` doivent déjà retourner ça.

---

## 2. 🔍 `/api/logs/search`

### Requête
```
GET /api/logs/search?connector=all&type=PROCESSING&service=payment-service&page=1&limit=50&sortBy=timestamp&sortOrder=desc
```

### Réponse Attendue
```json
{
  "logs": [
    {
      "timestamp": "2025-10-29T14:23:45.123Z",
      "type": "PROCESSING",
      "connector": "pi-gateway",
      "service": "payment-service",  // ← IMPORTANT pour PROCESSING
      "method": "POST",
      "path": "/process/payment",
      "statusCode": 200,
      "success": true,
      "responseTimeMs": 150,
      "messageId": "MSG123",
      "endToEndId": "E2E456",
      "message": "Payment processed successfully",
      "clientIp": null
    },
    {
      "timestamp": "2025-10-29T14:23:44.789Z",
      "type": "API_IN",
      "connector": "pi-gateway",
      "service": null,  // ← NULL pour les autres types
      "method": "GET",
      "path": "/ci/api/v1/check",
      "statusCode": 200,
      "success": true,
      "responseTimeMs": 5,
      "clientIp": "35.197.32.224",
      "messageId": null,
      "endToEndId": null,
      "message": null
    }
  ],
  "total": 1523,
  "page": 1,
  "totalPages": 31
}
```

### ✅ Vérification Backend

Dans `LogController.java`, assure-toi que le paramètre `service` est bien présent:

```java
@GetMapping("/search")
public ResponseEntity<LogSearchResponseDTO> searchLogs(
    ...
    @RequestParam(required = false) String service,  // ← Doit exister
    ...
) {
    LogSearchParams params = LogSearchParams.builder()
        ...
        .service(service)  // ← Doit être passé
        ...
        .build();
    ...
}
```

Dans `LogService.java`, le filtre `service` doit être appliqué aux logs PROCESSING uniquement.

---

## 3. 📈 `/api/metrics/connector/{connectorName}`

### Requête
```
GET /api/metrics/connector/pi-gateway?timeRange=24h
```

### Réponse Attendue
```json
{
  "metrics": {
    "uptime": 99.95,
    "requestsPerMinute": 1234,
    "avgLatency": 23.5,
    "errorRate": 0.5
  },
  "timeline": [
    {
      "timestamp": "00:00",
      "requests": 1200,
      "errors": 5
    }
  ],
  "statusBreakdown": {
    "200": 45000,
    "404": 250,
    "500": 50
  },
  "topEndpoints": [
    {
      "method": "GET",
      "path": "/ci/api/v1/check",
      "count": 12000,
      "avgLatency": 15,
      "errorRate": 0.2
    }
  ],
  "latencyPercentiles": {
    "p50": 15,
    "p90": 45,
    "p95": 65,
    "p99": 120
  }
}
```

---

## 4. 📊 `/api/analytics/trends`

### Requête
```
GET /api/analytics/trends?timeRange=7d&connector=all
```

### Réponse Attendue
```json
{
  "data": [
    {
      "date": "2025-10-23",
      "requests": 156000,
      "errors": 1200,
      "avgLatency": 32
    },
    {
      "date": "2025-10-24",
      "requests": 162000,
      "errors": 980,
      "avgLatency": 28
    }
  ],
  "summary": {
    "totalRequests": 1095000,
    "avgSuccessRate": 99.3,
    "medianLatency": 30,
    "growth": 7.6
  },
  "insights": [
    "Le taux d'erreur a diminué de 15% cette semaine",
    "La latence P95 est stable autour de 85ms",
    "Pic de trafic détecté les jours de semaine entre 9h-17h"
  ]
}
```

---

## 🔥 Modifications CRITIQUES à faire

### 1. Dans `LogService.java` - Support du filtre `service`

Assure-toi que cette logique existe:

```java
public LogSearchResponseDTO searchLogs(LogSearchParams params) {
    // ... code existant ...
    
    // Filtre par service (UNIQUEMENT pour les logs PROCESSING)
    if (params.getService() != null && !params.getService().isEmpty()) {
        // Le filtre service ne s'applique QUE si type == PROCESSING ou type == all
        if ("PROCESSING".equals(params.getType()) || "all".equals(params.getType())) {
            // Scanner BigTable avec le filtre service
            // Ajouter une condition dans le RowFilter
        }
    }
    
    // ... reste du code ...
}
```

### 2. Dans `LogSearchParams.java` - Ajouter le champ `service`

```java
@Data
@Builder
public class LogSearchParams {
    private String query;
    private String connector;
    private String type;
    private String status;
    private Boolean success;
    private Integer minLatency;
    private Integer maxLatency;
    private String clientIp;
    private String service;  // ← AJOUTER CE CHAMP
    private Instant startTime;
    private Instant endTime;
    private Integer page;
    private Integer limit;
    private String sortBy;
    private String sortOrder;
}
```

### 3. Dans `LogEntry.java` - Ajouter le champ `service`

```java
@Data
@Builder
public class LogEntry {
    private String timestamp;
    private String type;
    private String connector;
    private String service;  // ← AJOUTER CE CHAMP (peut être null pour API_IN, API_OUT, AUTH)
    private String method;
    private String path;
    private Integer statusCode;
    private Boolean success;
    private Integer responseTimeMs;
    private String clientIp;
    private String messageId;
    private String endToEndId;
    private String message;
}
```

---

## 🧪 Tests à faire

### Test 1: Logs PROCESSING avec service
```bash
curl "http://localhost:8080/api/logs/search?type=PROCESSING&service=payment-service&limit=10"
```

Résultat attendu: Seulement les logs PROCESSING du service "payment-service"

### Test 2: Logs sans filtre service
```bash
curl "http://localhost:8080/api/logs/search?type=API_IN&limit=10"
```

Résultat attendu: Tous les logs API_IN (le champ `service` doit être `null`)

### Test 3: Overview metrics
```bash
curl "http://localhost:8080/api/metrics/overview?timeRange=1h"
```

Résultat attendu: JSON avec totalMetrics, connectorMetrics, timeline, statusDistribution

---

## ✅ Checklist

- [ ] Le champ `service` existe dans `LogSearchParams`
- [ ] Le champ `service` existe dans `LogEntry`
- [ ] Le filtre `service` est implémenté dans `LogService`
- [ ] Le filtre `service` s'applique UNIQUEMENT aux logs PROCESSING
- [ ] Pour les logs API_IN, API_OUT, AUTH → `service` est `null`
- [ ] Pour les logs PROCESSING → `service` contient le nom du service
- [ ] Les endpoints retournent le bon format JSON
- [ ] Le CORS est activé (`@CrossOrigin(origins = "*")`)
- [ ] Le backend tourne sur port 8080

---

## 🚀 Si tout est OK

Si ton backend respecte déjà ces spécifications, alors **PAS DE CHANGEMENT NÉCESSAIRE** ! 

Le frontend va se connecter directement et tout devrait fonctionner.

---

## 📞 En cas de problème

Si le frontend ne charge pas les données:

1. Vérifie la console du navigateur (F12)
2. Vérifie les logs du backend Spring Boot
3. Teste les endpoints avec curl ou Postman
4. Vérifie que le CORS est bien activé
5. Vérifie que le backend tourne sur le bon port

---

**Note**: Le frontend est configuré pour se connecter à `http://localhost:8080` par défaut. Si ton backend tourne sur un autre port, modifie le fichier `.env` dans le frontend.
