# ⚡ Uptime Monitor Frontend

A fast and modern frontend for the Uptime Monitoring platform — built with **React**, **Vite**, and **TailwindCSS**.  
Designed for speed, reliability, and a smooth developer experience.

---

## 🚀 Live Development

Install dependencies:

```bash
npm install
```
Run the Vite dev server:

npm run dev


The app will be available at:

http://localhost:3000

🏗️ Production Build

Build optimized production assets:
```bash
npm run build
```

Preview the production build locally:
```bash
npm run previe
```

📂 Folder Structure
```bash
src/
 ├─ assets/         → images, svgs, static assets
 ├─ components/     → shared UI components
 ├─ pages/          → route-based views
 ├─ services/       → axios/api helpers
 ├─ utils/          → helpers & constants
 ├─ App.jsx         → main app container + routing
 └─ index.jsx       → entry point
```

🧰 Tech Stack
Tool	Purpose
React 19	UI Framework
Vite 7	Super-fast dev server + bundler
TailwindCSS	Utility-first styling
React Router DOM	Client-side navigation
Axios	HTTP requests
🔧 Path Aliases

You can import from src using @:
```
import Dashboard from "@/pages/Dashboard";
import Logo from "@/assets/logo.svg";
```


Configured in vite.config.js.

📸 Add a Screenshot later
![Preview Screenshot](./screenshot.png)
