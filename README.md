# Test Design Tool

Piattaforma cloud per trasformare design Figma in progetti di motion design editabili
(con effetti stile jitter) ed esportabili come GIF o video.

## Obiettivo
Questo progetto ha l’obiettivo di costruire:
- una **piattaforma web** (simil Jitter) per modificare testo, font, layout ed effetti
- un **plugin Figma** che esporta frame come layer editabili (non rasterizzati)
- un **sistema di rendering** per GIF / MP4 mantenendo il formato originale del frame

Tutto il sistema è progettato per funzionare **100% cloud** e **a budget 0**.

## Stack (previsto)
- **GitHub** – repository e versioning
- **Vercel** – web app + API
- **Render** – worker di rendering
- **Supabase (free)** – database e storage
- **Remotion** – rendering video (con FFmpeg sotto)

## Stato attuale
🚧 Inizializzazione del progetto  
- Repository creato
- README definito
- Prossimo step: setup struttura cloud (web app)

## Note
Questo progetto è in fase di sviluppo incrementale.
Si procede **un passo alla volta**, verificando ogni fase prima di continuare.
