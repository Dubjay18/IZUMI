# 🌊 IZUMI: Decoupled Web2.5 Yield & Credit Bridge

IZUMI is a Web2.5 financial protocol designed to provide small-and-medium enterprises (SMEs) and retail savers in Nigeria with access to dollar-denominated DeFi yields and low-interest credit lines. 

By abstracting blockchain barriers (such as gas sponsorships, key management, and transaction serialization) behind traditional banking interfaces, IZUMI connects real-world local commerce with global digital liquidity.

---

## 💳 Nomba API Integration & Lifecycle Control

IZUMI integrates the Nomba API suite not as a peripheral payment option, but as the core lifecycle controller of the application state. The platform orchestrates the following three core integrations:

### 1. Terminal Webhooks for Automated Debt Amortization (Repayments)
* **Mechanism**: When a merchant processes a card sale on a physical Nomba POS terminal, Nomba broadcasts a signature-verified webhook. 
* **State Logic**: The backend intercepts this webhook, parses the transaction payload, calculates a custom debt-service split (e.g., 10%), and dynamically reduces the borrower's outstanding credit bond balance. This event-driven loop enables real-time, cashflow-based loan amortization directly from daily sales activity.

### 2. Dedicated Virtual Accounts for Fiat Ingress (Savings)
* **Mechanism**: Upon saver onboarding, the backend provisions a dedicated virtual bank account number (DVA) mapped to the user via Nomba's collections infrastructure.
* **State Logic**: A deposit to the DVA fires a webhook to IZUMI. The server converts the NGN amount into its USD value, programmatically executes a swap, and deposits the corresponding stablecoin into the yield vault.

### 3. Automated Disbursements via Transfer API (Credit Issuance)
* **Mechanism**: When an SME accepts an AI-approved credit facility, the backend initiates a payout payload.
* **State Logic**: IZUMI programmatically transfers stablecoin capital through our liquidity routing, converts the credit allocation back to local currency, and initiates a local transfer to the borrower's bank account via the Nomba Transfer API, achieving end-to-end settlement in seconds.

---

## 🏗️ Technical Architecture & System Design

IZUMI decouples transaction execution, risk assessment, and identity verification into dedicated modules:

* **AI Risk Underwriting (Gemini AI)**: SME creditworthiness is assessed programmatically. The engine ingests POS logs to analyze transaction velocities, average ticket sizes, and sector margins, generating structured risk ratings and maximum credit limits.
* **ZK-KYC Privacy Pipeline (zk-SNARKs)**: Complies with NDPR data privacy standards. Users verify sensitive identity parameters (BVN/NIN) client-side and submit cryptographic proofs. The backend validates the commitments without storing or reading raw government credentials.
* **HD Wallet Derivation**: Secures user assets by programmatically deriving isolated EVM wallets on a BIP-44 path (`m/44'/60'/0'/0/index`) from a single master seed phrase. Private keys are loaded temporarily in-memory to sign transactions, preserving non-custodial integrity.

---

## 🛠️ Monorepo Structure

* [/frontend](file:///home/jay/Documents/experiment/IZUMI/frontend): A premium, high-fidelity React + TypeScript + Vite dashboard web application styled with Material Design 3 and responsive layouts.
* [/contracts](file:///home/jay/Documents/experiment/IZUMI/contracts): The smart contract layer containing the Yield Vaults and Credit Bond Solidity code, built with Foundry.
* [/src](file:///home/jay/Documents/experiment/IZUMI/src): The TypeScript backend server built with Fastify, Viem, and Prisma.

---

## 💻 Frontend Dashboard Web Application (`/frontend`)

The frontend is a Material-3 design-inspired React dashboard application facilitating interactive savers and borrower workflows:

### Key Features & Workflows
* **Unified Onboarding Selection**: Interactive gateway splitting user onboarding between Saver and Borrower workflows.
* **ZK-KYC Saver Ingress**: Onboarding backed by BVN verification and client-side ZK-KYC cryptographic proofs.
* **Saver Yield Dashboard**: Real-time USDC yield tracking, interactive deposit & withdrawal widgets, strategy asset mixes, and community job-support calculations.
* **Borrower Credit Lifecycle**:
  * SME profile registration (CAC Registry, Sector selection).
  * Automated Credit Score analysis & limits generation.
  * Symmetrical Grid Dashboard presenting outstanding debt (₦), active loan details, and future installment schedule lists.
* **Daily Split Amortization Control**: Features a dynamic sweep adjustment dial allowing merchants to commit repayment speed configurations (split intensity) directly to the Postgres database.
* **Izumi AI Financial Advisor**: Direct conversational advisor interface linked to the backend Gemini LLM API, showing live credit-capacity predictions and personalized inventory stocking strategies.

### Local Development Setup
1. **Install dependencies**:
   ```bash
   cd frontend
   pnpm install
   ```
2. **Environment Configuration**:
   Create a `.env` file in the `frontend` folder containing:
   ```env
   VITE_API_BASE_URL=http://localhost:5000
   ```
3. **Start Dev Server**:
   ```bash
   pnpm run dev
   ```
4. **Compile Production Build**:
   ```bash
   pnpm run build
   ```

---

## 👥 Seeded Test Accounts

For ease of testing and evaluation, the database can be seeded with two active test accounts representing the key user profiles:

### 1. 🐖 The Saver (Lionel Messi)
* **Email**: `jejeniyi7+23@gmail.com`
* **Role**: `SAVER`
* **Pre-seeded Activity**: Multiple NGN deposits (totaling $500 equivalent), yield interest payments ($14.55 total yield), and a withdrawal record ($50). Final balance is **$464.55 USD** (fully funded on-chain in the `QuestToken` DeFi vault if Anvil is running).
* **Use Case**: Log in to view savings portfolios, yield forecasts, community impact metrics (SME jobs funded), and simulate deposits/withdrawals.

### 2. 🏪 The Borrower SME (Gojo Satoru)
* **Email**: `jejeniyi7+34@gmail.com`
* **Role**: `BORROWER` (Company: `Gojo Jujutsu Corp`)
* **Credit Score / Grade**: `820` / `A`
* **Approved Credit Limit**: `₦5,000,000 NGN`
* **Pre-seeded Activity**: An active/disbursed loan of `₦600,000 NGN` (₦200,000 NGN partially repaid via daily POS terminal sweeps, backed by an active Quest Bond on-chain), one fully repaid historical loan, one pending request, one rejected request, and terminal logs.
* **Use Case**: Log in to view credit limits, outstanding balances, repayment schedules, split intensity controls, and to query the **Izumi AI Financial Advisor** (Gemini integration).

To seed these accounts in your database:
```bash
npm run seed:accounts
```

---

## 🚀 Deployment & Operations

* Refer to the [Stitch AI User Interface Mockups](https://stitch.withgoogle.com/u/1/projects/6024950968604456215?pli=1) to view our frontend dashboard designs.
* Refer to the [Developer Handbook](file:///home/jay/Documents/experiment/IZUMI/DEVELOPER_HANDBOOK.md) for endpoint documentation, schema diagrams, and sequence flows.
* Refer to the [Deployment Guide](file:///home/jay/Documents/experiment/IZUMI/DEPLOYMENT.md) to initialize the database and host the containerized server on Railway or Render.
