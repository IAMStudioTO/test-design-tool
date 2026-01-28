# Test Design Tool (Jitter-like)

Piattaforma cloud che trasforma design Figma in progetti di motion design editabili (stile Jitter) ed esportabili come GIF o video.
L’obiettivo è mantenere i layer **editabili** (testi, vettori, forme) e non “appiattire” tutto in immagini.

## Cosa stiamo costruendo

### 1) Web App (simil Jitter)
Una web app dove:
- importi un Frame da Figma come “scene”
- vedi una preview fedele
- modifichi testi, font e proprietà dei layer
- applichi effetti (jitter / blur / fade / ecc.)
- lanci un render (GIF/MP4)

### 2) Plugin Figma
Un plugin che:
- crea un projectId sulla piattaforma
- legge il Frame selezionato
- esporta una `scene` con layer editabili (TEXT, shapes, poi vector SVG, poi immagini)
- invia la scene alla web app

### 3) Renderer (cloud)
Un worker che riceve una scene + timeline + effetti e produce:
- MP4 / GIF / (in futuro WebM, Lottie, ecc.)
Soluzione prevista “professionale”: **Remotion** (che usa FFmpeg sotto).

---

## Vincoli
- **Budget 0**
- “Cloud-first”: deploy su Vercel/Render, storage gratuito (Supabase free)
- Sviluppo incrementale: un passo alla volta, testando ogni step prima di procedere

---

## Stack (target)
- **GitHub**: repository e versioning
- **Vercel**: web app + API
- **Render**: worker di rendering (job queue)
- **Supabase (free)**: database + storage (scene, assets, font, output render)
- **Remotion + FFmpeg**: pipeline video professionale

---

## Stato attuale (reale)

### ✅ Repository e deploy
- Repo: `IAMStudioTO/test-design-tool`
- Web deploy su Vercel: `https://test-design-tool.vercel.app`

### ✅ Web App (Next.js)
- Home page funzionante
- API:
  - `GET /api/health` → ok
  - `POST /api/projects/create` → genera `{ projectId, editorUrl }`
  - `POST /api/projects/upload` → riceve `{ projectId, scene }` e salva in memoria (MVP)
  - `GET /api/projects/get?projectId=...` → restituisce la scene (MVP)
- Pagina progetto:
  - `/p/[projectId]` mostra JSON scene + **preview visiva**
  - Preview:
    - background frame
    - TEXT con stile più fedele (fontSize, weight approx, italic approx, colore, align, lineHeight/letterSpacing)
  - Nota: storage attuale è **in-memory** (si perde al restart)

### ✅ Plugin Figma (Development)
- Plugin importato da manifest in locale
- “Create project” funziona e apre il link (openExternal)
- “Send selected Frame as scene” funziona
- CORS risolto su API (necessario perché origin = `null` nei plugin Figma)

### ✅ Flusso end-to-end già funzionante
Figma Frame selezionato → Plugin → API Vercel → scene salvata (memory) → pagina `/p/[projectId]` con preview + JSON.

---

## Come testare velocemente (attuale)

### Web
- Health:
  - `https://test-design-tool.vercel.app/api/health`
- Create project:
  - da console browser:
    ```js
    fetch("/api/projects/create", { method: "POST" }).then(r=>r.json()).then(console.log)
    ```

### Plugin (Figma)
- Import plugin da `apps/plugin/manifest.json` (in locale)
- Nel plugin:
  1) Create project
  2) Seleziona un Frame in Figma
  3) Send scene
- Si apre la pagina progetto `/p/[projectId]` con preview e JSON.

---

## Cosa manca (ed è normale)

La preview **non è ancora identica a Figma** perché al momento:
- non esportiamo/renderizziamo ancora shapes (RECT/ELLIPSE) e vector SVG
- non gestiamo font “web-matching” (Montserrat/Google Fonts o upload font)
- non gestiamo immagini/asset
- non c’è database/storage persistente (solo memoria)
- non c’è timeline, keyframe, effetti e renderer video

---

## Roadmap / Prossimi step (ordine consigliato)

### STEP 13 — Forme base in preview (RECT / ELLIPSE)
- Plugin: esportare layer `RECTANGLE` e `ELLIPSE` (fill solido, radius)
- Web: renderizzare `RECT` e `ELLIPSE` nella preview (div assoluti)
Obiettivo: composizione più fedele (forme + testo).

### STEP 14 — Vettori (SVG) in preview
- Plugin: per `VECTOR` / `BOOLEAN_OPERATION` / icone:
  - `exportAsync({ format: "SVG" })`
- Web: render SVG inline o come `data:image/svg+xml`
Obiettivo: avvicinarsi molto a Figma senza raster.

### STEP 15 — Immagini e asset
- Plugin: export PNG/JPG per image fills e node export
- Storage: spostare asset su storage (Supabase bucket)
- Web: render immagini in preview

### STEP 16 — Persistenza reale (Supabase)
- DB: `projects`, `project_scenes`, `render_jobs`
- Storage: `scenes/`, `assets/`, `renders/`, `fonts/`
- API: salvare e caricare scene da Supabase (non più in-memory)

### STEP 17 — Editor “Jitter-like”
- UI layers panel + inspector
- editing testo (content/font/size/color)
- transform (x/y/scale/rotate)
- timeline base (durata, start/end)

### STEP 18 — Effetti (MVP)
- fade in/out, slide, scale, blur, jitter
- parametri per layer + timeline

### STEP 19 — Rendering cloud (professionale)
- Render worker su Render:
  - riceve job
  - usa Remotion per comporre video
  - output MP4 / GIF (FFmpeg)
- Web: UI “Render” + progress + download

### STEP 20 — Fonts (professionale)
- supporto Google Fonts (Montserrat incluso)
- upload font custom (utente)
- embedding/serving fonts in render pipeline

---

## Nota su “budget 0”
- Vercel free: ok per web/API
- Supabase free: ok per DB + storage (limiti)
- Render free: ok per worker base (limiti/sleep)
- Remotion: open source (costo 0), ma compute dipende dal free tier

---

## Come riprendere questa conversazione
Se questa chat viene cancellata, per ripartire:
1) apri questo README
2) dimmi a che step siamo arrivati
3) ripartiamo dal prossimo step della Roadmap

Stato attuale: **STEP 12 completato** (testo quasi fedele).
Prossimo step: **STEP 13 (RECT / ELLIPSE)**.
