import fastify from 'fastify';
import cors from '@fastify/cors';
import { aiService } from './services/ai.service.js';
import { borrowerRoutes } from './routes/borrower.routes.js';
import { loanRoutes } from './routes/loan.routes.js';
import { saverRoutes } from './routes/saver.routes.js';
import { webhookRoutes } from './routes/webhook.routes.js';
import { seedDatabase } from './seed.js';

export const app = fastify({
  logger: true,
});

app.post('/dev/seed', async (request, reply) => {
  try {
    await seedDatabase();
    return { success: true, message: 'Database seeded successfully with master demo account (demo@izumi.finance)' };
  } catch (error) {
    app.log.error(error);
    return reply.code(500).send({ error: `Failed to seed database: ${(error as Error).message}` });
  }
});



// Register CORS
await app.register(cors, {
  origin: '*',
});

// Health check
app.get('/health', async () => {
  return { status: 'OK', timestamp: new Date().toISOString() };
});

// Register routes
await app.register(borrowerRoutes);
await app.register(loanRoutes);
await app.register(saverRoutes);
await app.register(webhookRoutes);

// Vault / Community Stats
app.get('/vault/stats', async (request, reply) => {
  try {
    const { db } = await import('./services/db.service.js');

    const [totalUsers, allEntries] = await Promise.all([
      db.user.count({ where: { role: 'SAVER' } }),
      db.ledger.findMany({
        where: { status: 'COMPLETED' },
        select: { type: true, amount: true },
      }),
    ]);

    let totalDepositedUSD = 0;
    let totalYieldUSD = 0;
    let totalWithdrawnUSD = 0;

    for (const entry of allEntries) {
      const val = Number(entry.amount) / 1_000_000;
      if (entry.type === 'DEPOSIT') totalDepositedUSD += val;
      else if (entry.type === 'YIELD') totalYieldUSD += val;
      else if (entry.type === 'WITHDRAWAL') totalWithdrawnUSD += val;
    }

    const tvl = totalDepositedUSD + totalYieldUSD - totalWithdrawnUSD;

    return {
      totalSavers: totalUsers,
      totalValueLockedUSD: Math.round(tvl * 100) / 100,
      totalYieldDistributedUSD: Math.round(totalYieldUSD * 100) / 100,
      totalDepositedUSD: Math.round(totalDepositedUSD * 100) / 100,
      totalWithdrawnUSD: Math.round(totalWithdrawnUSD * 100) / 100,
      activePositions: totalUsers,
    };
  } catch (error) {
    app.log.error(error);
    return reply.code(500).send({ error: `Failed to fetch vault stats: ${(error as Error).message}` });
  }
});

// Test Credit Scoring Endpoint
app.post('/test-ai', async (request, reply) => {
  try {
    const body = request.body as any;

    if (!body || typeof body !== 'object') {
      return reply.code(400).send({ error: 'Invalid request body' });
    }

    const { monthlyRevenue, revenueVolatility, transactionCount, averageTicketSize, operatingCosts, sector } = body;

    if (monthlyRevenue === undefined || !sector) {
      return reply.code(400).send({ error: 'monthlyRevenue and sector are required fields' });
    }

    const assessment = await aiService.scoreSmeCredit({
      monthlyRevenue: Number(monthlyRevenue),
      revenueVolatility: Number(revenueVolatility ?? 0.15),
      transactionCount: Number(transactionCount ?? 100),
      averageTicketSize: Number(averageTicketSize ?? 1000),
      operatingCosts: Number(operatingCosts ?? 0),
      sector: String(sector)
    });

    return assessment;
  } catch (error) {
    app.log.error(error);
    return reply.code(500).send({ error: (error as Error).message });
  }
});
