# ⚡ GUIDE DE DÉMARRAGE RAPIDE

## 🎯 Pour démarrer le dashboard en 3 minutes

### 1️⃣ Installation
```bash
cd monitoring-dashboard
npm install
```

### 2️⃣ Démarrage
```bash
npm run dev
```

Le dashboard sera accessible sur **http://localhost:3000** 🚀

### 3️⃣ C'est tout !
Le frontend va essayer de se connecter à ton backend sur `http://localhost:8080/api`

---

## 🔧 Si ton backend n'est pas sur localhost:8080

Édite le fichier `src/services/api.js` et change la ligne :

```javascript
const API_BASE_URL = 'http://localhost:8080/api';
```

par :

```javascript
const API_BASE_URL = 'http://TON_BACKEND_URL:PORT/api';
```

---

## 📋 Checklist Backend

Assure-toi que ton backend expose ces endpoints minimum :

- ✅ `GET /api/metrics/overview`
- ✅ `GET /api/logs/search`
- ✅ `GET /api/logs/errors`
- ✅ `GET /api/processing/trace/{messageId}`
- ✅ CORS activé (`@CrossOrigin(origins = "*")`)

---

## 🎨 Ce que tu obtiens

### 6 Pages complètes :
1. **Overview** - Dashboard principal avec métriques en temps réel
2. **Pi-Gateway Details** - Métriques détaillées du gateway
3. **Pi-Connector Details** - Métriques détaillées du connector
4. **Logs Explorer** - Recherche avancée avec filtres (AVEC TRI PAR SERVICE ✨)
5. **Processing Tracer** - Traçage complet des transactions
6. **Analytics** - Graphiques et insights avancés

### Fonctionnalités clés :
- ✅ **Temps réel** - Auto-refresh toutes les 30s
- ✅ **Filtres avancés** - Plus de 10 filtres pour les logs
- ✅ **Tri par service** - Pour les logs PROCESSING (comme demandé !)
- ✅ **Export CSV** - Exporte tes logs
- ✅ **Graphiques interactifs** - Avec Recharts
- ✅ **Responsive** - Fonctionne sur tous les écrans
- ✅ **Design moderne** - Avec Tailwind CSS

---

## 🐛 Si ça ne marche pas

### Le dashboard ne charge pas ?
1. Vérifie que Node.js est installé : `node --version`
2. Vérifie que npm est installé : `npm --version`
3. Supprime `node_modules` et refais `npm install`

### Pas de données ?
1. Vérifie que le backend est démarré
2. Ouvre F12 dans le navigateur pour voir les erreurs
3. Vérifie l'URL du backend dans `src/services/api.js`

### Erreur CORS ?
Ajoute ça sur ton backend :
```java
@CrossOrigin(origins = "*")
```

---

## 💡 Tips

- Pour changer les couleurs : `tailwind.config.js`
- Pour ajouter des pages : crée un fichier dans `src/pages/`
- Pour modifier l'API : édite `src/services/api.js`
- Les données mockées sont dans chaque page pour la démo

---

## 📦 Build pour production

```bash
npm run build
```

Les fichiers seront dans `dist/` - prêts à déployer !

---

**Bon courage ! 🚀**
