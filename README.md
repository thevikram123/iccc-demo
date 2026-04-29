# Integrated Command and Control Centre (ICCC) Interface

This project is a React-based web application acting as an Integrated Command and Control Centre (ICCC). It is designed to simulate massive CCTV and network monitoring, featuring AI analytics, Facial Recognition System (FRS) search capabilities, system alerts, and an AI Copilot interface.

## File Structure

Below is an overview of the key directories and files in this project:

```text
/
├── public/                 # Static assets served at the root path of the application
│   └── images/             # Local image assets (e.g., CCTV feeds: pov 1.jpeg to pov 6.jpeg)
├── src/                    # Main source code directory
│   ├── components/         # Reusable structural UI components
│   │   └── Layout.tsx      # Main application wrapper handling the sidebar navigation
│   ├── context/            # React Contexts for global state management
│   │   └── AuditLogContext.tsx # Provides and manages the system-wide audit logs
│   ├── pages/              # React components representing individual routes/screens
│   │   ├── Anomalies.tsx   # Anomaly detection logs and alerts view
│   │   ├── AreaDiagnostics.tsx # Deep-dive into specific area metrics
│   │   ├── Alerts.tsx      # Central hub for all system-wide alerts
│   │   ├── CctvFeeds.tsx   # Simulates live CCTV camera feeds monitoring
│   │   ├── Copilot.tsx     # AI assistant interface for complex querying
│   │   ├── Dashboard.tsx   # Main landing dashboard providing an overview of metrics
│   │   ├── FrsSearch.tsx   # Interface for the Facial Recognition System (with active heatmaps)
│   │   ├── GisMap.tsx      # Main geographical map view
│   │   ├── Infrastructure.tsx # Monitoring statuses for hardware/nodes
│   │   ├── Login.tsx       # Initial authentication screen (admin123/eypwd123)
│   │   ├── SurveyTracking.tsx # Dashboard tracking site survey velocity, districts, and mapping
│   │   └── Topology.tsx    # Node/network topological visualization
│   ├── App.tsx             # Root component that manages authentication state and react-router setup
│   ├── main.tsx            # Main React mounting point that renders <App /> into the DOM
│   └── index.css           # Global stylesheet containing the Tailwind CSS directives
├── .env.example            # Template detailing the required environment variables
├── .gitignore              # Files/directories that Git should not track
├── index.html              # The foundational HTML file Vite serves
├── metadata.json           # AI Studio app metadata (name, description, permissions)
├── package.json            # Manifest file for npm standard dependencies and scripts
├── tsconfig.json           # TypeScript configuration for the project
└── vite.config.ts          # Build tool instructions for Vite dev server and bundler
```

## Core Technologies
- React 18+
- TypeScript
- Vite
- Tailwind CSS
- React Router DOM
- Recharts (for Dashboard data visualization)
- React Leaflet (for Interactive Maps & Heatmaps)

## Offline Demo Zip

This repo also includes a side build for laptop demos in low-connectivity environments. It leaves the main Cloudflare Worker/Gemini deployment unchanged.

```bash
npm run package:offline
```

The command builds `dist-offline/` with local-file friendly routes and relative assets, then writes `offline-build/iccc-demo-offline.zip`. Extract the zip and open `index.html` in a Chromium-based browser. The first AI Copilot run needs internet to cache Transformers.js and `google/gemma-3-270m-it`; subsequent runs use the browser cache and do not call the Cloudflare Worker.

More detail is in `docs/offline-demo.md`.
