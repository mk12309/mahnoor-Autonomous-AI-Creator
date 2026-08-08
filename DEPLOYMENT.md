# 🚀 SignalForge AI — Production Deployment Guide

This guide provides step-by-step instructions for deploying **SignalForge AI** to production using **MongoDB Atlas**, **Render** (for the backend Node.js API), and **Vercel** (for the React frontend).

---

## 1. MongoDB Atlas Setup

1. Create a cluster on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Create a Database User (e.g. `signalforge_user`).
3. Add `0.0.0.0/0` under Network Access (IP Access List).
4. Copy your Connection String URI:
   ```text
   mongodb+srv://<username>:<password>@cluster0.brwqxgk.mongodb.net/signalforge_db?retryWrites=true&w=majority
   ```

---

## 2. Backend Deployment on Render

1. Log into [Render Dashboard](https://dashboard.render.com/) and click **New +** ➔ **Blueprint**.
2. Connect your GitHub repository containing `render.yaml`.
3. Fill in the required Environment Variables under Service Settings:
   * `MONGODB_URI`: `mongodb+srv://<username>:<password>@cluster0.brwqxgk.mongodb.net/signalforge_db`
   * `BREETH_API_KEY`: `your_actual_breeth_api_key`
   * `PUBLISH_INTERVAL_MINUTES`: `30`
   * `RELEVANCE_THRESHOLD`: `70`
4. Click **Deploy**. Your API will be live at `https://signalforge-ai-backend.onrender.com`.

---

## 3. Frontend Deployment on Vercel

1. Log into [Vercel](https://vercel.com/) and click **Add New Project**.
2. Select your `signalforge-ai` GitHub repository.
3. Set **Framework Preset** to **Vite**.
4. Set **Root Directory** to `client`.
5. Click **Deploy**. Vercel will automatically build the site using `vercel.json` rewrites.
