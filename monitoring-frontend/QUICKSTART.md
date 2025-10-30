# 🚀 GUIDE DE DÉMARRAGE RAPIDE

## ⚡ Installation en 3 minutes

### 1️⃣ Extraction et Installation

```bash
# Décompresser le ZIP
unzip monitoring-frontend.zip
cd monitoring-frontend

# Installer les dépendances (prend 1-2 minutes)
npm install
```

### 2️⃣ Configuration Backend

Crée un fichier `.env` :

```bash
cp .env.example .env
```

Modifie `.env` si ton backend n'est pas sur localhost:8080 :
```env
VITE_API_URL=http://localhost:8080
```

### 3️⃣ Lancement

```bash
npm run dev
```

✅ Le dashboard est accessible sur **http://localhost:3000**

---

## 🎯 Fonctionnalités Principales

### 📊 Dashboard (Page d'accueil)
- Vue d'ensemble temps réel
- Métriques clés : Requêtes, Succès, Erreurs, Latence
- Graphiques interactifs
- Actualisation auto toutes les 5-60 secondes

### 🔍 Logs Explorer
**LA PAGE LA PLUS IMPORTANTE !**

1. Clique sur "Logs Explorer" dans la nav
2. Utilise les filtres :
   - **Connector** : pi-gateway, pi-connector, all
   - **Type** : API_IN, API_OUT, **PROCESSING**, AUTH
   - **Service** : Apparaît UNIQUEMENT si Type = PROCESSING ✅
   - Status, Latence, IP, etc.

3. Active l'auto-refresh en temps réel
4. Exporte les logs en JSON si besoin

### 🔧 Filtrage par Service (PROCESSING)

**IMPORTANT** : Le filtre "Service" n'apparaît que pour les logs PROCESSING

**Comment l'utiliser** :
```
1. Ouvre "Logs Explorer"
2. Dans "Type", sélectionne "PROCESSING"
3. Le champ "🔧 Service (PROCESSING)" apparaît (bordure verte)
4. Entre le nom du service : payment-service, notification-service, etc.
5. Les logs sont filtrés EN TEMPS RÉEL
```

### 📈 Autres Pages
- **Pi-Gateway** : Détails du gateway
- **Pi-Connector** : Détails du connector
- **Analytics** : Tendances sur 7j/30j

---

## ⚙️ Configuration Avancée

### Changer l'intervalle d'auto-refresh

Dans chaque page, tu peux choisir :
- 5 secondes (très réactif)
- 10 secondes (recommandé) ✅
- 30 secondes
- 1 minute

### Désactiver l'auto-refresh

Décoche la case "Actualisation automatique" dans Logs Explorer ou Analytics.

---

## 🐛 Résolution de Problèmes

### Le dashboard ne charge rien

**Problème** : Pas de données, graphiques vides

**Solutions** :
1. Vérifie que ton backend tourne :
   ```bash
   curl http://localhost:8080/api/metrics/overview?timeRange=1h
   ```

2. Vérifie le CORS dans ton backend Spring Boot :
   ```java
   @CrossOrigin(origins = "*")  // Doit être présent sur les controllers
   ```

3. Ouvre la console du navigateur (F12) pour voir les erreurs

### Le filtre "Service" n'apparaît pas

**Problème** : Le champ Service n'est pas visible

**Solution** : 
- Le filtre Service apparaît UNIQUEMENT quand Type = "PROCESSING"
- Vérifie que tu as bien sélectionné "PROCESSING" dans le dropdown Type

### Les logs PROCESSING n'ont pas de service

**Problème** : Les logs PROCESSING affichent `service: null`

**Solution** :
1. Vérifie que ton backend retourne bien le champ `service` dans les logs PROCESSING
2. Consulte `BACKEND_REQUIREMENTS.md` section "Modifications CRITIQUES"
3. Le champ `service` doit être dans `LogEntry.java` :
   ```java
   private String service;  // Pour les logs PROCESSING
   ```

---

## 📊 Structure des Données

### Log PROCESSING attendu par le frontend

```json
{
  "timestamp": "2025-10-29T14:23:45.123Z",
  "type": "PROCESSING",
  "connector": "pi-gateway",
  "service": "payment-service",  // ← REQUIS
  "method": "POST",
  "path": "/process/payment",
  "statusCode": 200,
  "success": true,
  "responseTimeMs": 150,
  "messageId": "MSG123",
  "endToEndId": "E2E456",
  "message": "Payment processed successfully"
}
```

### Log API_IN/API_OUT/AUTH

```json
{
  "timestamp": "2025-10-29T14:23:45.123Z",
  "type": "API_IN",
  "connector": "pi-gateway",
  "service": null,  // ← NULL pour les autres types
  "method": "GET",
  "path": "/ci/api/v1/check",
  "statusCode": 200,
  "success": true,
  "responseTimeMs": 5,
  "clientIp": "35.197.32.224"
}
```

---

## 🔥 Points Clés

✅ **Temps réel** : Tout s'actualise automatiquement
✅ **Filtrage avancé** : Service uniquement pour PROCESSING
✅ **Aucune authentification** : Accès direct (comme demandé)
✅ **Pas de mock data** : Données réelles du backend
✅ **Export** : JSON download disponible
✅ **Responsive** : Fonctionne sur mobile/tablet/desktop

---

## 🚀 Déploiement Production

### Build
```bash
npm run build
```

Les fichiers sont dans `dist/`

### Servir avec Nginx

```nginx
server {
    listen 80;
    server_name monitoring.example.com;
    root /path/to/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

---

## 📞 Support

Besoin d'aide ? Vérifie :
1. Console du navigateur (F12 > Console)
2. Logs du backend Spring Boot
3. `BACKEND_REQUIREMENTS.md` pour les specs backend
4. `README.md` pour la doc complète

---

## ⏱️ Temps de Réalisation

✅ **Frontend complet** : Livré en moins de 2h (comme demandé !)

**Inclus** :
- Dashboard temps réel avec graphiques
- Logs Explorer avec filtres avancés
- Support complet du filtre Service (PROCESSING)
- 5 pages complètes
- Auto-refresh configurable
- Export JSON
- Documentation complète

**Technos** : React + Vite + Tailwind + Recharts + Axios

---

**Prêt à démarrer ! 🎉**

Lance `npm install` puis `npm run dev` et c'est parti !
