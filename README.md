# 📰 ANR NEWS — The New York Times Style Publishing Platform

A modern digital journalism platform featuring an authentic **The New York Times** editorial frontend and the newsroom-grade **Scoop & Oak** content management system (CMS).

---

## 🌟 Quick Start

You have two easy ways to run ANR NEWS:

### Option 1: Run with Node.js (Recommended)
Open PowerShell or your terminal in `D:\Anigravity\ANR NEWS`:
```powershell
npm start
```
Or directly:
```powershell
node server.js
```
Then open your browser:
* **Public Reader Portal**: [http://localhost:3000/](http://localhost:3000/)
* **Newsroom Editorial CMS**: [http://localhost:3000/admin](http://localhost:3000/admin)

### Option 2: Direct File Browsing (Zero Setup)
Simply double-click or open:
* `index.html` — Public Reader Portal
* `admin.html` — Newsroom Editorial CMS

*(Both HTTP server mode and direct file browsing support full localStorage synchronization!)*

---

## 🏛️ System Features

### 1. Frontend Reader Experience (`index.html`)
- **Iconic Masthead**: Gothic blackletter branding for **The ANR Chronicle**, historic edition numbers, and the motto *"All the News That's Fit to Print"*.
- **Classic 3-Column Newsprint Grid**:
  - **Column 1 (Lead Anchor / A-Hed)**: Dominant lead story with high-resolution photo, italic editorial caption, audio narration player, and drop-cap narrative.
  - **Column 2 (Secondary Stories & Analysis)**: Secondary news cards with thumbnails and reading times.
  - **Column 3 (Opinion & Columnists)**: Circular author headshots, opinion essays, and daily morning newsletter signup.
- **Dynamic Live Updates Banner**: Blinking red beacon with real-time developments ticker.
- **Triple Theme Switching**: Day (Editorial Warm White), Paper (Warm Vintage Sepia), and Night (OLED Slate).
- **Distraction-Free Reading Modal**: Dynamic font scaling (A- / A+) and gift article token sharing.

### 2. Backend Newsroom CMS (`admin.html`)
- **Modeled after The New York Times' internal Scoop & Oak systems**:
  - **Story Desk Queue**: Tabbed pipeline (`All Stories`, `My Drafts`, `Copy Desk`, `Ready to Publish`, `Live Front`).
  - **Oak Collaborative Canvas**: WYSIWYG rich text editor with headline character counter (`Optimal Fit: 68/80 chars`) validating fit for web and print grids.
  - **Scoop Homepage Slot Curator**: Assign stories to *Lead Anchor*, *Secondary 1*, *Secondary 2*, or *Opinion Rail* with an instant visual layout preview.
  - **Copy Desk Standards Checklist**: Verification for AP/NYT style guide, primary sources, photo rights, and legal defamation screening.
  - **Breaking Push Alert Dispatcher**: Dispatches instant alerts that update the public reader banner.

---

## 📁 Directory Structure

```
D:\Anigravity\ANR NEWS/
├── index.html                  # Public Reader Portal (The New York Times style)
├── admin.html                  # Newsroom Editorial CMS (Scoop & Oak style)
├── server.js                   # Zero-dependency local Node.js server
├── package.json                # Project manifest
├── README.md                   # Project documentation
├── assets/
│   ├── css/
│   │   └── nyt-editorial.css   # Custom typography, double rules, drop caps, print styles
│   └── js/
│       ├── store.js            # Shared data layer & mock database (dual HTTP/localStorage)
│       ├── frontend.js         # Reader portal interactions (audio, themes, reading modal)
│       └── cms.js              # Newsroom CMS controller (canvas, slot curator, checklist)
├── data/
│   └── news_data.json          # Persistent articles and breaking news alerts database
└── docs/
    └── architecture.md         # Full UX/UI editorial workflow specification
```

---

## 🖋️ Editing & Publishing Workflow
1. Open the **Newsroom CMS** at [http://localhost:3000/admin](http://localhost:3000/admin).
2. Select an article or edit the headline and body text in the **Oak Canvas**.
3. Use the **Slot Curator** in the right column to designate its homepage position (e.g. *★ Lead Anchor Story*).
4. Click **"🚀 Publish to Front Page"**.
5. The public reader portal at [http://localhost:3000/](http://localhost:3000/) will update immediately!
