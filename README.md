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

* [/contracts](file:///home/adeyemi/Documents/Work/IZUMI/contracts): The smart contract layer containing the Yield Vaults and Credit Bond Solidity code, built with Foundry.
* [/src](file:///home/adeyemi/Documents/Work/IZUMI/src): The TypeScript backend server built with Fastify, Viem, and Prisma.

---

## 🚀 Deployment & Operations

* Refer to the [Developer Handbook](file:///home/adeyemi/Documents/Work/IZUMI/DEVELOPER_HANDBOOK.md) for endpoint documentation, schema diagrams, and sequence flows.
* Refer to the [Deployment Guide](file:///home/adeyemi/Documents/Work/IZUMI/DEPLOYMENT.md) to initialize the database and host the containerized server on Railway or Render.
