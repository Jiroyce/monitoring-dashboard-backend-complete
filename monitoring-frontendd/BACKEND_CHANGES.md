# 🔧 MODIFICATIONS EXACTES À FAIRE DANS TON BACKEND

## ⚠️ SI tu as déjà le champ `service` dans tes logs PROCESSING

Alors **AUCUNE MODIFICATION NÉCESSAIRE** ! Le frontend va fonctionner directement.

## 🔥 SI tu n'as PAS encore le champ `service`

Voici les **3 modifications exactes** à faire :

---

## 1️⃣ Modifier `LogSearchParams.java`

**Fichier** : `monitoring/dto/LogSearchParams.java`

**Ajouter** cette ligne dans la classe :

```java
package com.gutouch.monitoring.dto;

import lombok.Builder;
import lombok.Data;
import java.time.Instant;

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
    private String service;  // ← AJOUTER CETTE LIGNE
    private Instant startTime;
    private Instant endTime;
    private Integer page;
    private Integer limit;
    private String sortBy;
    private String sortOrder;
}
```

---

## 2️⃣ Modifier `LogEntry.java`

**Fichier** : `monitoring/dto/LogEntry.java`

**Ajouter** cette ligne dans la classe :

```java
package com.gutouch.monitoring.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class LogEntry {
    private String timestamp;
    private String type;
    private String connector;
    private String service;  // ← AJOUTER CETTE LIGNE
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

## 3️⃣ Modifier `LogService.java`

**Fichier** : `monitoring/service/LogService.java`

Dans la méthode `searchLogs()`, **ajouter** le support du filtre `service` :

### Option A : Si tu lis depuis BigTable `processing_log`

Ajoute ce code dans la logique de recherche :

```java
public LogSearchResponseDTO searchLogs(LogSearchParams params) {
    // ... ton code existant ...
    
    // ▼ AJOUTER CE BLOC ▼
    // Filtre par service (uniquement pour logs PROCESSING)
    if (params.getService() != null && !params.getService().isEmpty()) {
        // Le service ne s'applique QUE aux logs PROCESSING
        if ("PROCESSING".equals(params.getType()) || "all".equals(params.getType())) {
            // Ajouter le filtre service dans ton scan BigTable
            // Exemple avec RowFilter :
            filters.add(
                new FilterList(FilterList.Operator.MUST_PASS_ALL,
                    new SingleColumnValueFilter(
                        Bytes.toBytes("log"),
                        Bytes.toBytes("service"),
                        CompareOperator.EQUAL,
                        Bytes.toBytes(params.getService())
                    )
                )
            );
        }
    }
    // ▲ FIN DU BLOC À AJOUTER ▲
    
    // ... reste de ton code ...
}
```

### Option B : Si tu construis des LogEntry manuellement

Quand tu crées un `LogEntry` depuis BigTable, **ajoute** le champ service :

```java
LogEntry entry = LogEntry.builder()
    .timestamp(timestamp)
    .type(type)
    .connector(connector)
    .service(service)  // ← AJOUTER CETTE LIGNE (peut être null)
    .method(method)
    .path(path)
    .statusCode(statusCode)
    .success(success)
    .responseTimeMs(responseTimeMs)
    .clientIp(clientIp)
    .messageId(messageId)
    .endToEndId(endToEndId)
    .message(message)
    .build();
```

**IMPORTANT** : 
- Pour les logs PROCESSING → `service` = nom du service (ex: "payment-service")
- Pour API_IN, API_OUT, AUTH → `service` = null

---

## 4️⃣ Le Controller est déjà OK

Ton `LogController.java` a déjà le paramètre `service` à la ligne 55 :

```java
@Parameter(description = "Filtrer par service (uniquement pour logs PROCESSING)")
@RequestParam(required = false) String service,
```

Et il le passe à `LogSearchParams` :

```java
LogSearchParams params = LogSearchParams.builder()
    ...
    .service(service)  // ← Déjà présent
    ...
    .build();
```

✅ **Donc pas de modification nécessaire dans le controller !**

---

## ✅ RÉCAPITULATIF DES MODIFICATIONS

**3 fichiers à modifier** :

1. ✏️ `LogSearchParams.java` : Ajouter `private String service;`
2. ✏️ `LogEntry.java` : Ajouter `private String service;`
3. ✏️ `LogService.java` : Implémenter le filtre service

---

## 🧪 TESTER LES MODIFICATIONS

### Test 1 : Recherche avec service

```bash
curl "http://localhost:8080/api/logs/search?type=PROCESSING&service=payment-service&limit=5"
```

**Résultat attendu** : Seulement les logs PROCESSING avec service = "payment-service"

### Test 2 : Recherche sans service

```bash
curl "http://localhost:8080/api/logs/search?type=API_IN&limit=5"
```

**Résultat attendu** : Logs API_IN avec service = null

### Test 3 : Vérifier le JSON d'un log PROCESSING

```json
{
  "timestamp": "2025-10-29T14:23:45.123Z",
  "type": "PROCESSING",
  "connector": "pi-gateway",
  "service": "payment-service",  // ← DOIT ÊTRE PRÉSENT
  "method": "POST",
  "path": "/process/payment",
  "statusCode": 200,
  "success": true,
  "responseTimeMs": 150,
  "messageId": "MSG123",
  "endToEndId": "E2E456",
  "message": "Payment processed"
}
```

---

## 📝 NOTES IMPORTANTES

### Où est stocké le champ `service` dans BigTable ?

Dans ta table `processing_log` :
- **Column Family** : `log`
- **Column** : `service`
- **Value** : "payment-service", "notification-service", etc.

Exemple de rowkey : `payment-service#MSG123#E2E456#1733068825789`

Le nom du service est aussi **dans la clé de ligne** (1er élément avant le `#`).

### Comment extraire le service ?

```java
// Option 1 : Depuis la colonne
String service = row.getColumnLatestCell("log", "service").getValue();

// Option 2 : Depuis la rowkey
String rowKey = row.getRowKey();
String service = rowKey.split("#")[0];  // Premier élément
```

---

## 🚨 ERREURS COURANTES

### Erreur 1 : `service` toujours null

**Cause** : Le champ n'est pas extrait depuis BigTable

**Solution** : Vérifie que tu extrais bien la colonne "service" dans LogService

### Erreur 2 : Tous les logs ont un service

**Cause** : Le service est mis même pour API_IN, API_OUT, AUTH

**Solution** : Le service doit être null pour ces types, seul PROCESSING doit l'avoir

### Erreur 3 : Filtre service ne fonctionne pas

**Cause** : Le filtre n'est pas appliqué dans le scan BigTable

**Solution** : Ajoute le filtre RowFilter ou ColumnFilter dans LogService

---

## ✅ APRÈS LES MODIFICATIONS

1. Recompile ton backend :
   ```bash
   mvn clean package
   ```

2. Redémarre le backend :
   ```bash
   java -jar target/monitoring-dashboard.jar
   ```

3. Teste avec curl :
   ```bash
   curl "http://localhost:8080/api/logs/search?type=PROCESSING&service=payment-service&limit=5"
   ```

4. Lance le frontend :
   ```bash
   cd monitoring-frontend
   npm install
   npm run dev
   ```

5. Ouvre http://localhost:3000

6. Va dans "Logs Explorer"

7. Sélectionne Type = "PROCESSING"

8. Le champ Service apparaît → Entre "payment-service"

9. Les logs sont filtrés ! 🎉

---

## 🎯 SI TU AS DES PROBLÈMES

### Le filtre service ne marche pas

1. Vérifie que le backend retourne bien `"service": "payment-service"` dans le JSON
2. Ouvre la console du navigateur (F12) → Network → Regarde la réponse de l'API
3. Vérifie que le paramètre `service` est bien envoyé dans l'URL

### Le frontend ne se connecte pas au backend

1. Vérifie que le backend tourne sur port 8080
2. Vérifie le CORS : `@CrossOrigin(origins = "*")` sur les controllers
3. Vérifie le fichier `.env` du frontend : `VITE_API_URL=http://localhost:8080`

---

## 📞 AIDE

Si ça ne marche toujours pas :

1. Lis le fichier `BACKEND_REQUIREMENTS.md` (section détaillée)
2. Teste les APIs avec Postman ou curl
3. Vérifie les logs du backend Spring Boot
4. Vérifie la console du navigateur pour les erreurs JavaScript

---

**Bon courage ! Si les 3 modifications sont faites correctement, tout va fonctionner ! 🚀**
