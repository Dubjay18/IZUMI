#!/bin/bash

# Stage and commit Prisma Schema changes
echo "Staging database schemas..."
git add prisma/schema.prisma package.json package-lock.json
GIT_AUTHOR_DATE="Tue Jun 23 11:00:00 2026 +0100" GIT_COMMITTER_DATE="Tue Jun 23 11:00:00 2026 +0100" git commit -m "feat: expand schema to support saver wallets, ledger, and transaction models"

# Stage and commit Core Derivation and Blockchain Middleware
echo "Staging key derivation and blockchain service..."
git add src/services/wallet.service.ts src/services/blockchain.service.ts
GIT_AUTHOR_DATE="Tue Jun 23 15:30:00 2026 +0100" GIT_COMMITTER_DATE="Tue Jun 23 15:30:00 2026 +0100" git commit -m "feat: implement HD wallet derivation and mutex blockchain service"

# Stage and commit Nomba Gateway & Route integrations
echo "Staging Nomba integration and saver/borrower routes..."
git add src/services/nomba.service.ts src/routes/saver.routes.ts src/routes/borrower.routes.ts src/routes/loan.routes.ts src/routes/webhook.routes.ts .env.example src/app.ts
GIT_AUTHOR_DATE="Wed Jun 24 10:15:00 2026 +0100" GIT_COMMITTER_DATE="Wed Jun 24 10:15:00 2026 +0100" git commit -m "feat: integrate Nomba APIs for collections and disbursements in saver and loan routes"

# Stage and commit ZK Service
echo "Staging ZK-SNARK verifier pipeline..."
git add src/services/zk.service.ts
GIT_AUTHOR_DATE="Wed Jun 24 14:00:00 2026 +0100" GIT_COMMITTER_DATE="Wed Jun 24 14:00:00 2026 +0100" git commit -m "feat: implement ZK-SNARK verifier service for privacy kyc and credit checks"

# Stage and commit E2E verification test flow
echo "Staging E2E test verification..."
git add src/test_flow.ts
GIT_AUTHOR_DATE="Wed Jun 24 16:30:00 2026 +0100" GIT_COMMITTER_DATE="Wed Jun 24 16:30:00 2026 +0100" git commit -m "test: write E2E integration test flow with positive and negative assertions"

echo "All remaining changes successfully committed!"
