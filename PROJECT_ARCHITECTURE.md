# 🏛️ SignalForge AI — Technical Architecture & Service Boundaries

This document details the system design, data flow, and architectural boundaries of **SignalForge AI**.

---

## 🏗️ System Architecture Diagram

```mermaid
graph TD
    A[Live Technology RSS Feeds] -->|1. Live Topic Stream| B(Breeth Service - discoverTopics)
    B -->|2. Discovered Topics| C(Editorial Intelligence Engine)
    C -->|3. Score Breakdown & Filter| D{Relevance Score >= 70?}
    D -->|No| E[Log Rejected Topic in Memory & EditorialDecision]
    D -->|Yes| F(Memory Engine Deduplication Check)
    F -->|Duplicate| E
    F -->|Accepted Single Topic| G(Breeth Service - generatePost)
    H[MongoDB Memory Engine] -->|Context & Writing Style| G
    G -->|4-Section Analyst Brief| I(Breeth Service - generateRationale)
    I -->|5. Save Post| J[(MongoDB Database)]
    J -->|Query Posts| K[Agent Feed API /api/agent/feed]
    K -->|30s Auto Refresh| L[React + Tailwind Frontend Dashboard]
```

---

## 📂 Directory Structure

```text
backend/
├── config/             # Centralized environment variable loader (env.js)
├── controllers/        # Express HTTP Route Controllers (agent.controller.js)
├── database/           # MongoDB Connection & Auto-Reconnect Strategy (db.js)
├── middleware/         # CORS, JSON, Error Handler Middlewares
├── models/             # Mongoose Schemas (Post, Topic, PersonaConfig, Memory, EditorialDecision)
├── routes/             # Express API Endpoint Routes
├── scheduler/          # node-cron Autonomous Agent Scheduler (cron.js)
├── services/           # Business Logic Layer (breeth.service.js, agent.service.js, memory.service.js)
├── utils/              # Structured Winston Logging Utility (logger.js)
├── app.js              # Express Application Setup
└── server.js           # Server Entry Point & Restart Recovery

client/
├── public/             # Static Assets
└── src/
    ├── api/            # Axios API Client (client.ts)
    ├── components/     # Reusable UI Components (Navbar, Cards, Badges)
    ├── pages/          # 6 Pages (Home, Dashboard, LiveFeed, Persona, Settings, About)
    ├── App.tsx         # Main Application Layout & React Router
    ├── main.tsx        # React DOM Root
    └── index.css       # TailwindCSS Imports & Glassmorphic Utilities
```
