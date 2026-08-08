# ⚡ SignalForge AI — Autonomous AI Infrastructure Analyst

> **Submission for Hackathon**: Autonomous Content Production Engine powered by Breeth AI Persistent Memory Layer, Node.js, Express, MongoDB, and React.

SignalForge AI is an autonomous, self-steering AI analyst platform designed to discover live technology trends, evaluate editorial relevance, consult the persistent Breeth AI Memory Layer, and generate structured infrastructure insight posts without manual intervention.

---

## 🧠 Breeth AI Persistent Memory Layer Architecture

Breeth is integrated into SignalForge AI as the **Persistent, Intent-Aware Memory Layer** for the autonomous AI agent.

### Separation of Responsibilities:

* **MongoDB (Primary Application Database)**:
  * Application state & user configurations
  * Agent persona settings (`PersonaConfig`)
  * Published posts (`Post` collection)
  * Editorial decision audit logs (`EditorialDecision`)
  * Scheduler state

* **Breeth AI (Persistent Memory Layer)**:
  * Stores published episodes containing post content, editorial rationale, source, and ISO timestamps.
  * Stores rejected topic decisions and editorial justifications.
  * Enables intent-aware vector search (`/v1/memories/search`) before topic evaluation and post generation.
  * Enforces cross-cycle style guidelines and prevents duplicate content.

---

## 🏆 Hackathon Specification Verification Matrix

| # | Official Requirement | Status | Architecture Component & Verification Evidence |
|---|---|:---:|---|
| **1** | **Live Topic Discovery** | **`PASS`** | Real-time ingest from live RSS news feeds (`HackerNews`, `TechCrunch`, `TheHackerNews`) in `backend/services/breeth.service.js`. |
| **2** | **Breeth Memory Search** | **`PASS`** | `agent.service.js` executes `breethMemoryService.searchMemories()` to retrieve relevant memories before editorial topic evaluation and post generation. |
| **3** | **Editorial Decision Logging** | **`PASS`** | Discovered, accepted, and rejected topics are stored in MongoDB `Topic` collection and written to Breeth Memory via `breethMemoryService.writeRejectionMemory()`. |
| **4** | **No Duplicate Topics Published** | **`PASS`** | `memoryService.isTopicDuplicate(title)` and Breeth Memory search check normalized titles against previous posts and reject duplicates before selection. |
| **5** | **Gradual Post Generation Over Time** | **`PASS`** | Configurable scheduler (`PUBLISH_INTERVAL_MINUTES` / `cron.js`) selects **strictly ONE top-scoring topic** per cycle to publish posts over time. |
| **6** | **Scheduler Survives Server Restarts** | **`PASS`** | On boot, `server.js` checks MongoDB for active agent state (`PersonaConfig.findOne({ isActive: true })`) and automatically restores the `node-cron` scheduler. |
| **7** | **Exact Hackathon API Endpoints** | **`PASS`** | Implemented in `backend/controllers/agent.controller.js`. <br>`POST /api/agent/init` ➔ `{ "agentId": "<id>" }`<br>`GET /api/agent/feed?agentId=<id>` ➔ `{ "posts": [{ id, createdAt, text, rationale, sources }] }`. |
| **8** | **ISO 8601 UTC Timestamps** | **`PASS`** | Post timestamps are serialized via `.toISOString()` (e.g. `2026-08-08T11:46:31.589Z`). |
| **9** | **Feed Sorted Newest First** | **`PASS`** | Query executes `Post.find({ status: 'published' }).sort({ createdAt: -1 })`. |
| **10** | **Production Readiness & Resilience** | **`PASS`** | Implements MongoDB connection failover, exponential backoff retries for Breeth AI requests, and structured winston logging. |

---

## ⚡ Quick Start Guide

### Prerequisites
* Node.js v18+
* MongoDB URI (Local or MongoDB Atlas)
* Breeth AI API Key

### Local Installation

```bash
# 1. Clone the repository
git clone https://github.com/signalforge/signalforge-ai.git
cd signalforge-ai

# 2. Install dependencies across backend & frontend
npm run install:all

# 3. Configure backend environment variables
cp backend/.env.example backend/.env
```

### Environment Configuration (`backend/.env`)

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.brwqxgk.mongodb.net/signalforge_db
PUBLISH_INTERVAL_MINUTES=30
RELEVANCE_THRESHOLD=70
BREETH_API_KEY=ck_live_...
BREETH_BASE_URL=https://api.breeth.ai/v1
BREETH_MODEL=breeth-ai-analyst
```

### Launching the Application

```bash
# Run both backend server and frontend client concurrently:
npm run dev
```

* **Frontend Dashboard**: `http://localhost:5173`
* **Backend API**: `http://localhost:5000`

---

## 📁 Repository Documentation Index

* 📜 [`PROMPTS.md`](./PROMPTS.md) — Persona system prompts, editorial scoring prompts, and Breeth Memory integration prompts.
* 🏛️ [`PROJECT_ARCHITECTURE.md`](./PROJECT_ARCHITECTURE.md) — Comprehensive technical architecture diagram and service boundary documentation.
* 🚀 [`DEPLOYMENT.md`](./DEPLOYMENT.md) — Step-by-step production deployment guide for Render, Vercel, and MongoDB Atlas.
* 📡 [`API_DOCUMENTATION.md`](./API_DOCUMENTATION.md) — Complete REST API specification with payload examples.

---

## 📄 License
Licensed under the [MIT License](./LICENSE).
