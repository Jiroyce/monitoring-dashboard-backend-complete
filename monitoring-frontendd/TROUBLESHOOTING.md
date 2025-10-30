# 🚨 TROUBLESHOOTING - Métriques Vides

## Problème : Le dashboard affiche des tirets "-" au lieu des métriques

### Diagnostic

Le backend répond (logs Spring Boot OK) mais retourne des données vides/nulles.

---

## 🔍 ÉTAPE 1 : Vérifier la réponse du backend

### Méthode A : Via curl

```bash
curl http://localhost:8080/api/metrics/overview?timeRange=1h
```

**Réponse attendue** :
```json
{
  "totalMetrics": {
    "totalRequests": 45678,
    "successRate": 99.2,
    "errorRate": 0.8,
    "avgLatency": 28.5,
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
    }
  ],
  "timeline": [
    {"timestamp": "13:00", "pi-gateway": 1200, "pi-connector": 450}
  ],
  "statusDistribution": {
    "API_IN": 12000,
    "API_OUT": 8500,
    "PROCESSING": 2000,
    "AUTH": 3178
  }
}
```

**Si tu obtiens** :
```json
{
  "totalMetrics": null,
  "connectorMetrics": null,
  "timeline": null,
  "statusDistribution": null
}
```

→ Le problème est dans `MetricsService.java`

### Méthode B : Via le navigateur

1. Ouvre le dashboard (localhost:3000)
2. Appuie sur F12
3. Onglet **Network**
4. Rafraîchis la page
5. Clique sur la requête `/api/metrics/overview?timeRange=1h`
6. Regarde la **Response**

---

## 🔧 SOLUTION 1 : MetricsService ne calcule pas les métriques

### Cause probable

Ton `MetricsService.java` retourne un objet vide ou ne lit pas correctement BigTable.

### Vérifications dans MetricsService.java

```java
public OverviewMetricsDTO getOverviewMetrics(String timeRange) {
    // ✅ DOIT créer et remplir les objets, pas retourner null
    
    TotalMetrics totalMetrics = TotalMetrics.builder()
        .totalRequests(calculateTotalRequests())  // ← Ces méthodes doivent retourner des valeurs
        .successRate(calculateSuccessRate())
        .errorRate(calculateErrorRate())
        .avgLatency(calculateAvgLatency())
        .p50Latency(calculateP50())
        .p95Latency(calculateP95())
        .p99Latency(calculateP99())
        .build();
    
    // ✅ DOIT lire depuis BigTable table5 (métriques agrégées)
    List<ConnectorMetricsDTO> connectorMetrics = getConnectorMetrics();
    
    // ✅ DOIT construire la timeline
    List<TimelinePoint> timeline = buildTimeline(timeRange);
    
    // ✅ DOIT retourner un objet complet
    return OverviewMetricsDTO.builder()
        .totalMetrics(totalMetrics)
        .connectorMetrics(connectorMetrics)
        .timeline(timeline)
        .statusDistribution(statusDistribution)
        .build();
}
```

### Si MetricsService retourne null

**Option A : Ajouter des valeurs par défaut**

```java
public OverviewMetricsDTO getOverviewMetrics(String timeRange) {
    try {
        // Ton code existant
        ...
    } catch (Exception e) {
        log.error("Error calculating metrics", e);
        
        // Retourner des valeurs par défaut au lieu de null
        return OverviewMetricsDTO.builder()
            .totalMetrics(TotalMetrics.builder()
                .totalRequests(0)
                .successRate(0.0)
                .errorRate(0.0)
                .avgLatency(0.0)
                .build())
            .connectorMetrics(List.of())
            .timeline(List.of())
            .statusDistribution(Map.of())
            .build();
    }
}
```

---

## 🔧 SOLUTION 2 : BigTable table5 est vide

### Vérifier si table5 contient des données

```bash
cbt read om_ci_sink_log_table5 count=10
```

**Si vide** :
- Les métriques agrégées ne sont pas encore écrites
- Le pipeline Dataflow n'a pas encore tourné assez longtemps (60s minimum)
- Vérifie que le job Dataflow tourne

**Solution temporaire** : Utiliser table7 (logs bruts) en attendant

Dans `MetricsService.java`, lire depuis `table7` au lieu de `table5` :

```java
// Au lieu de scanner table5
String tableName = "om_ci_sink_log_table7";  // ← Changer ici

// Scanner les logs bruts et calculer les métriques à la volée
// (Plus lent mais fonctionne immédiatement)
```

---

## 🔧 SOLUTION 3 : Problème de timeRange

### Vérifier le parsing du timeRange

Dans `MetricsService.java` :

```java
private Instant calculateStartTime(String timeRange) {
    Instant now = Instant.now();
    switch (timeRange) {
        case "1h":
            return now.minus(1, ChronoUnit.HOURS);
        case "6h":
            return now.minus(6, ChronoUnit.HOURS);
        case "24h":
            return now.minus(24, ChronoUnit.HOURS);
        case "7d":
            return now.minus(7, ChronoUnit.DAYS);
        case "30d":
            return now.minus(30, ChronoUnit.DAYS);
        default:
            return now.minus(1, ChronoUnit.HOURS);
    }
}
```

Si cette méthode retourne une date trop ancienne, aucune donnée ne sera trouvée.

---

## 🔧 SOLUTION 4 : Ajouter des logs de debug

Dans `MetricsService.java`, ajoute des logs :

```java
public OverviewMetricsDTO getOverviewMetrics(String timeRange) {
    log.info("Calculating overview metrics for timeRange: {}", timeRange);
    
    Instant start = calculateStartTime(timeRange);
    Instant end = Instant.now();
    
    log.info("Time range: {} to {}", start, end);
    
    // Scanner BigTable
    List<Result> results = scanBigTable(tableName, start, end);
    
    log.info("Found {} results from BigTable", results.size());
    
    if (results.isEmpty()) {
        log.warn("No data found in BigTable for timeRange: {}", timeRange);
        // Retourner des valeurs par défaut
    }
    
    // ... calcul des métriques
    
    log.info("Calculated metrics: totalRequests={}, successRate={}", 
        totalRequests, successRate);
    
    return overview;
}
```

Ensuite regarde les logs Spring Boot pour voir où ça coince.

---

## 🔧 SOLUTION 5 : Frontend - Afficher des valeurs de test

En attendant que le backend soit corrigé, modifie temporairement `Dashboard.jsx` :

```javascript
const metrics = overview?.totalMetrics || {
  totalRequests: overview ? 0 : 12345,  // ← Valeur de test si overview existe mais est vide
  successRate: overview ? 0 : 99.2,
  errorRate: overview ? 0 : 0.8,
  avgLatency: overview ? 0 : 28.5,
  p50Latency: overview ? 0 : 15,
  p95Latency: overview ? 0 : 87,
  p99Latency: overview ? 0 : 150
};
```

Ça te permettra de voir si le problème vient du backend ou du frontend.

---

## 🧪 TESTS À FAIRE

### Test 1 : Backend retourne-t-il quelque chose ?

```bash
curl -v http://localhost:8080/api/metrics/overview?timeRange=1h
```

Regarde le status code (doit être 200) et le JSON retourné.

### Test 2 : BigTable contient-il des données ?

```bash
# Table des métriques agrégées
cbt read om_ci_sink_log_table5 count=10

# Table des logs bruts
cbt read om_ci_sink_log_table7 count=10
```

Si les deux sont vides → Problème avec le pipeline Dataflow.

### Test 3 : Le pipeline Dataflow tourne-t-il ?

```bash
gcloud dataflow jobs list --status=active --project=gu1-top20-iacc
```

Si aucun job actif → Le pipeline n'envoie pas de données à BigTable.

---

## 📋 CHECKLIST DE RÉSOLUTION

1. [ ] Vérifie la réponse JSON de `/api/metrics/overview` (curl ou browser F12)
2. [ ] Si null → Ajoute des logs dans `MetricsService.java`
3. [ ] Vérifie que table5 contient des données (`cbt read`)
4. [ ] Si table5 vide → Vérifie que le pipeline Dataflow tourne
5. [ ] Si table7 a des données mais pas table5 → Attends 60s ou lis depuis table7
6. [ ] Ajoute des valeurs par défaut dans MetricsService en cas d'erreur
7. [ ] Teste avec curl après chaque modification
8. [ ] Rafraîchis le frontend (F5) pour voir les changements

---

## 🚀 SOLUTION RAPIDE (pour tester maintenant)

Si tu veux juste tester que le frontend fonctionne, crée une API mock dans le backend :

```java
@GetMapping("/overview")
public ResponseEntity<OverviewMetricsDTO> getOverviewMetrics(
        @RequestParam(defaultValue = "1h") String timeRange) {
    
    // ⚠️ VALEURS DE TEST - À REMPLACER PAR LES VRAIES DONNÉES
    TotalMetrics totalMetrics = TotalMetrics.builder()
        .totalRequests(45678)
        .successRate(99.2)
        .errorRate(0.8)
        .avgLatency(28.5)
        .p50Latency(15.0)
        .p95Latency(87.0)
        .p99Latency(150.0)
        .build();
    
    List<ConnectorMetricsDTO> connectors = List.of(
        ConnectorMetricsDTO.builder()
            .name("pi-gateway")
            .status("HEALTHY")
            .uptime(99.95)
            .requestsPerMinute(1234)
            .avgLatency(23.0)
            .p95Latency(65.0)
            .build(),
        ConnectorMetricsDTO.builder()
            .name("pi-connector")
            .status("HEALTHY")
            .uptime(98.73)
            .requestsPerMinute(567)
            .avgLatency(45.0)
            .p95Latency(120.0)
            .build()
    );
    
    List<TimelinePoint> timeline = List.of(
        new TimelinePoint("13:00", 1200, 450),
        new TimelinePoint("13:15", 1450, 520),
        new TimelinePoint("13:30", 1300, 480)
    );
    
    Map<String, Integer> statusDist = Map.of(
        "API_IN", 12000,
        "API_OUT", 8500,
        "PROCESSING", 2000,
        "AUTH", 3178
    );
    
    OverviewMetricsDTO overview = OverviewMetricsDTO.builder()
        .totalMetrics(totalMetrics)
        .connectorMetrics(connectors)
        .timeline(timeline)
        .statusDistribution(statusDist)
        .build();
    
    return ResponseEntity.ok(overview);
}
```

Avec ça, le frontend devrait afficher des données immédiatement !

---

## 📞 BESOIN D'AIDE ?

Envoie-moi :
1. Le résultat de `curl http://localhost:8080/api/metrics/overview?timeRange=1h`
2. Les logs Spring Boot quand tu appelles cette API
3. Le résultat de `cbt read om_ci_sink_log_table5 count=5`

Et je pourrai t'aider plus précisément !
