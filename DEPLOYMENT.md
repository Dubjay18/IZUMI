# 🚀 Izumi Backend: Production Deployment Guide

This guide outlines how to deploy the Izumi backend to a live hosting environment (e.g. Render or Railway) and link it with the Nomba Developer Portal.

---

## 1. 🗄️ Database Setup (PostgreSQL)

Izumi requires a hosted PostgreSQL database in production. You can spin up a free instance using:
* **Neon** (https://neon.tech)
* **Supabase** (https://supabase.com)
* **Railway** (built-in Postgres database addon)

Once created, retrieve your connection string. It should look like:
```env
DATABASE_URL="postgresql://username:password@hostname:5432/dbname?sslmode=require"
```

---

## 2. ☁️ Cloud Hosting Deployment (e.g., Render or Railway)

### Option A: Railway (Fastest)
1. Sign up on **Railway** (https://railway.app).
2. Click **New Project** → **Deploy from GitHub repo** → select the `IZUMI` repository.
3. Railway will automatically detect the `Dockerfile` we created and start the build.
4. Go to the project settings, select **Variables**, and add the required environment variables (see Section 3).
5. Click **Generate Domain** in the settings tab to retrieve your public URL (e.g., `https://izumi-production.up.railway.app`).

### Option B: Render
1. Sign up on **Render** (https://render.com).
2. Click **New** → **Web Service** → Connect your GitHub repository.
3. Configure the settings:
   * **Runtime**: `Docker` (Render will build the project using our `Dockerfile`)
   * **Instance Type**: `Free` (or a paid tier)
4. Add the required environment variables in the **Environment** settings.
5. Deploy. Render will provide a public URL (e.g., `https://izumi-backend.onrender.com`).

---

## 3. ⚙️ Environment Variables Checklist

Ensure these variables are configured in your production hosting panel:

| Variable Name | Description | Example / Recommendation |
|---|---|---|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://...` |
| `PORT` | Port for the server to listen on | `5000` (Render/Railway sets this automatically) |
| `NODE_ENV` | Environment identifier | `production` |
| `RPC_URL` | Base Sepolia / Mainnet RPC Endpoint | Alchemy or Infura Base URL |
| `HOT_WALLET_PRIVATE_KEY` | Private key of the Gas sponsoring Hot Wallet | `0x...` |
| `MASTER_MNEMONIC` | Master seed phrase for user wallet derivation | 12-word recovery phrase |
| `NOMBA_CLIENT_ID` | Nomba sandbox/live CLIENT ID | Obtain from Nomba Dev Dashboard |
| `NOMBA_CLIENT_SECRET` | Nomba sandbox/live CLIENT SECRET | Obtain from Nomba Dev Dashboard |
| `NOMBA_SIGNING_KEY` | Nomba webhook payload signing key | Used for signature verification checks |
| `EXCHANGE_RATE` | USD/NGN exchange rate override | `1500` |
| `USDC_ADDRESS` | Address of USDC contract on the target L2 | `0x5fbdb2315678afecb367f032d93f642f64180aa3` (Anvil fallback default) |
| `QUEST_TOKEN_ADDRESS` | QuestToken Proxy address | Deployed address |
| `BOND_MANAGER_ADDRESS`| BondManager Proxy address | Deployed address |
| `REWARD_POOL_ADDRESS` | RewardPool Proxy address | Deployed address |
| `DEX_ROUTER_ADDRESS`  | DEX Router address | Deployed address |

---

## 4. 💳 Nomba Webhook Integration

Once the server is deployed and you have your public URL:

1. Log into your **Nomba Developer Dashboard** (https://developer.nomba.com).
2. Go to **Developer** → **Webhooks**.
3. Set your webhook URL to:
   ```
   https://YOUR-LIVE-DOMAIN.com/webhooks/nomba
   ```
4. Copy the Nomba **Signing Key** from the dashboard and set it as `NOMBA_SIGNING_KEY` in your backend environment configuration.
5. In sandbox/production mode, trigger a payment settlement or transfer. The webhook will fire, and your live Izumi backend will process the sweep/repayment instantly.
