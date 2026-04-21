# Socialmedia — Social Media Impact on Students

A full-stack research tool: dark-themed HTML/CSS/JS frontend + Express backend + Claude AI.

## File structure

```
social-media-impact/
  index.html    ← Frontend (open directly in browser)
  server.js     ← Express backend (Node.js)
  package.json
  README.md
```

## Quick start

### 1. Install and start the backend

```bash
npm install
ANTHROPIC_API_KEY=sk-ant-... node server.js
```

The server starts on **http://localhost:4000**

### 2. Open the frontend

Just open `index.html` in any browser. No build step needed.

The frontend connects to `http://localhost:4000/api` automatically.

---

## API reference

| Method | Route | Description |
|--------|-------|-------------|
| POST | /api/submit | Save a student survey response |
| GET | /api/responses | List all responses |
| GET | /api/stats | Aggregated statistics |
| POST | /api/analyze | Claude AI analysis |
| DELETE | /api/responses | Clear all data |

---

## Features

- 3-page sidebar UI: Survey / Analytics / All Responses
- Live backend status indicator (green dot when connected)
- Platform chip selector, hours-per-day slider, impact ratings
- Animated bar chart for platform usage
- Colour-coded impact pills (academic, mental health, sleep)
- One-click Claude AI analysis via backend proxy (API key never exposed)
- Full response table with colour-coded impact tags
- Works without a build tool — pure HTML/CSS/JS frontend
