# 📸 APERÇU DU DASHBOARD

## 🎨 Interface Utilisateur

### Page 1 : Dashboard Principal (/)

```
┌─────────────────────────────────────────────────────────────────────┐
│  🔵 Monitoring Dashboard - Pi Gateway & Pi Connector      [LIVE 🟢] │
│  Dernière MAJ: 17:26:45 (il y a 3s)              [🔄 Actualiser]   │
├─────────────────────────────────────────────────────────────────────┤
│  [🏠 Dashboard] [Logs Explorer] [Pi-Gateway] [Pi-Connector] [...]  │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  Vue d'ensemble                            [ 1h ][ 6h ][24h ][ 7d ] │
│                                                                      │
│  Actualisation auto: [5s][10s✓][30s][1min]                         │
│                                                                      │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────────┐   │
│  │ 🔵 45,678  │  │ ✅ 99.2%   │  │ ❌ 0.8%    │  │ ⏱️  28ms   │   │
│  │ Requêtes   │  │ Succès     │  │ Erreurs    │  │ Latence    │   │
│  │ ▲ +12%     │  │ ▼ -0.3%    │  │ ▲ +0.3%    │  │ ▼ -5ms     │   │
│  └────────────┘  └────────────┘  └────────────┘  └────────────┘   │
│                                                                      │
│  ┌────────────────────┐          ┌────────────────────┐            │
│  │ 🟢 PI-GATEWAY      │          │ 🟢 PI-CONNECTOR    │            │
│  │ Uptime: 99.95%     │          │ Uptime: 98.73%     │            │
│  │ Req/min: 1,234     │          │ Req/min: 567       │            │
│  │ Latence: 23ms      │          │ Latence: 45ms      │            │
│  │ P95: 65ms          │          │ P95: 120ms         │            │
│  └────────────────────┘          └────────────────────┘            │
│                                                                      │
│  ┌─── 📊 Timeline des Requêtes ──────────────────────────────┐    │
│  │                                                             │    │
│  │  2000│              ▄▄▄                                    │    │
│  │      │         ▄▄▄█   █▄▄                                  │    │
│  │  1500│       ▄█          █▄                                │    │
│  │      │     ▄█              █▄                              │    │
│  │  1000│   ▄█                  █▄                            │    │
│  │      │ ▄█                      █▄                          │    │
│  │   500│█                          █                         │    │
│  │      └─────────────────────────────────────               │    │
│  │      13:00   13:30   14:00   14:30   15:00               │    │
│  │      ─ Pi-Gateway    ─ Pi-Connector                       │    │
│  └─────────────────────────────────────────────────────────────┘    │
│                                                                      │
│  ┌─────────────────────┐    ┌─────────────────────┐               │
│  │ 📈 Distribution     │    │ ⚡ Percentiles       │               │
│  │                     │    │                      │               │
│  │     ╱─────╲         │    │ P50:  15ms ████████ │               │
│  │   ╱         ╲       │    │ P95:  87ms █████████│               │
│  │  │  API_IN   │      │    │ P99: 150ms ██████████              │
│  │  │  45%      │      │    │                      │               │
│  │   ╲         ╱       │    └─────────────────────┘               │
│  │     ╲─────╱         │                                            │
│  └─────────────────────┘                                            │
└─────────────────────────────────────────────────────────────────────┘
```

---

### Page 2 : Logs Explorer (/logs) ⭐ **LA PLUS IMPORTANTE**

```
┌─────────────────────────────────────────────────────────────────────┐
│  🔵 Monitoring Dashboard - Pi Gateway & Pi Connector      [LIVE 🟢] │
├─────────────────────────────────────────────────────────────────────┤
│  [Dashboard] [📋 Logs Explorer✓] [Pi-Gateway] [Pi-Connector] [...] │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  🔍 Explorateur de Logs                    [📥 Exporter] [🔧 Filtres]│
│  1,523 logs trouvés                                                 │
│                                                                      │
│  ☑️ Actualisation automatique  │  Intervalle: [5s][10s✓][30s][1min]│
│                                                                      │
│  ┌─── 🔧 Filtres de Recherche ──────────────────────────── [✕ Effacer]┐
│  │                                                                    │
│  │  [Recherche___________] [Connecteur_▼] [Type_▼____] [Status_____]│
│  │  [Succès______________] [Latence min_] [Latence max] [IP Client_]│
│  │                                                                    │
│  │  🟢 Type = PROCESSING sélectionné !                              │
│  │  ┌────────────────────────────────────────────────────────────┐ │
│  │  │ 🔧 Service (PROCESSING)                                    │ │
│  │  │ [payment-service___________________________________]       │ │
│  │  │                                                             │ │
│  │  │ ✅ Ce filtre n'apparaît QUE pour les logs PROCESSING      │ │
│  │  └────────────────────────────────────────────────────────────┘ │
│  │                                                                    │
│  │  Trier: [Timestamp▼]  Ordre: [Plus récent▼]  Par page: [50▼]   │
│  └────────────────────────────────────────────────────────────────────┘
│                                                                      │
│  ┌─── Log #1 ─────────────────────────────────────────────────┐   │
│  │ 🟢 PROCESSING  ⏰ 14:23:45  pi-gateway  🔧 payment-service  │   │
│  │ POST /process/payment                              ✅ 200   │   │
│  │ Latence: 150ms                                              │   │
│  │ MSG: MSG123  |  E2E: E2E456                                 │   │
│  │ "Payment processed successfully for customer X"            │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  ┌─── Log #2 ─────────────────────────────────────────────────┐   │
│  │ 🔵 API_IN  ⏰ 14:23:44  pi-gateway                  ✅ 200  │   │
│  │ GET /ci/api/v1/check                                        │   │
│  │ Latence: 5ms  |  IP: 35.197.32.224                          │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  ┌─── Log #3 ─────────────────────────────────────────────────┐   │
│  │ 🟣 API_OUT  ⏰ 14:23:43  pi-connector              ✅ 202   │   │
│  │ POST https://dev-aip.gutouch.net/transferts                │   │
│  │ Latence: 332ms                                              │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  [◄ Précédent]  [ 1 ][ 2 ][ 3 ][ 4 ][ 5 ]  [Suivant ►]           │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

### Page 3 : Pi-Gateway Details (/gateway)

```
┌─────────────────────────────────────────────────────────────────────┐
│  🖥️ Pi-Gateway Monitoring                             [LIVE 🟢]    │
├─────────────────────────────────────────────────────────────────────┤
│  [Dashboard] [Logs] [📊 Pi-Gateway✓] [Pi-Connector] [Analytics]   │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  🖥️ pi-gateway                              [ 1h ][ 6h ][24h✓][7d ]│
│  Métriques détaillées                                               │
│                                                                      │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────────┐   │
│  │ ✅ 99.95%  │  │ 🔵 1,234   │  │ ⏱️  23ms   │  │ ❌ 0.5%    │   │
│  │ Uptime     │  │ Req/min    │  │ Latence    │  │ Erreurs    │   │
│  └────────────┘  └────────────┘  └────────────┘  └────────────┘   │
│                                                                      │
│  ┌─── 📊 Activité sur 24h ────────────────────────────────────┐   │
│  │                                                              │   │
│  │  [Graphique en courbe des requêtes et erreurs]             │   │
│  │                                                              │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  ┌──────────────────┐    ┌──────────────────┐                      │
│  │ Répartition      │    │ Percentiles      │                      │
│  │ Status Codes     │    │ P50:  15ms       │                      │
│  │                  │    │ P90:  45ms       │                      │
│  │ [Bar Chart]      │    │ P95:  65ms       │                      │
│  │                  │    │ P99: 120ms       │                      │
│  └──────────────────┘    └──────────────────┘                      │
│                                                                      │
│  ┌─── 🔝 Top Endpoints ───────────────────────────────────────┐   │
│  │ 1. GET /ci/api/v1/check      12,000 req  |  15ms  |  0.2%  │   │
│  │ 2. POST /api/payment          5,234 req  |  45ms  |  1.1%  │   │
│  │ 3. GET /api/status            3,456 req  |  12ms  |  0.1%  │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 🎨 Palette de Couleurs

- **Background** : Slate-900 (#0f172a)
- **Cards** : Slate-800 (#1e293b)
- **Borders** : Slate-700 (#334155)
- **Text** : White / Slate-400
- **Success** : Green-400 (#4ade80)
- **Error** : Red-400 (#f87171)
- **Warning** : Yellow-400 (#facc15)
- **Info** : Blue-400 (#60a5fa)
- **Processing** : Emerald-400 (#34d399)

---

## 🎯 Animations

1. **Live Indicator** : Pulse vert 🟢 (animation continue)
2. **Nouveaux logs** : Slide-in depuis la gauche
3. **Auto-refresh** : Spinner sur le bouton refresh
4. **Hover cards** : Border color change
5. **Graphiques** : Smooth transitions sur les données

---

## 📱 Responsive

### Desktop (>1024px)
- Layout 4 colonnes pour les metric cards
- Graphiques full width
- Sidebar navigation

### Tablet (768px - 1024px)
- Layout 2 colonnes
- Graphiques adaptés

### Mobile (<768px)
- Layout 1 colonne
- Navigation en burger menu (si ajouté)
- Cards empilées verticalement

---

## 🔥 Fonctionnalités Visuelles Clés

### 1. Badges de Status
- ✅ 200 Success (vert)
- ❌ 500 Error (rouge)
- ⚠️ 404 Warning (jaune)
- 🔄 300 Redirect (bleu)

### 2. Type de Log avec Icônes
- 🔵 API_IN (Activity icon, bleu)
- 🟣 API_OUT (Activity icon, violet)
- 🟢 PROCESSING (Code icon, vert)
- 🟡 AUTH (User icon, jaune)

### 3. Indicateurs Temps Réel
- 🟢 LIVE (avec pulse)
- ⏰ Timestamp relatif ("il y a 3s")
- 🔄 Auto-refresh actif

### 4. Filtre Service Special
- 🔧 Icône service
- Bordure verte (emerald-500)
- N'apparaît QUE pour PROCESSING
- Placeholder descriptif

---

## 💡 Points d'Attention Visuels

### Dashboard Principal
- **Focus** : Vue d'ensemble rapide
- **Highlight** : Cartes de métriques avec trends
- **Graphique principal** : Timeline en Area Chart

### Logs Explorer
- **Focus** : Filtrage et recherche
- **Highlight** : Filtre Service pour PROCESSING
- **Vue principale** : Liste de logs cards

### Connector Details
- **Focus** : Drill-down détaillé
- **Highlight** : Percentiles et Top Endpoints
- **Graphiques** : Multiple charts (Area, Bar)

---

## 🎬 Expérience Utilisateur

1. **Page load** : < 1s avec spinner
2. **Auto-refresh** : Smooth update sans reload
3. **Filtres** : Update instantané
4. **Pagination** : Navigation fluide
5. **Export** : Download direct en JSON

---

**L'interface est moderne, dark theme, avec des animations subtiles et une excellente UX ! 🎨✨**
