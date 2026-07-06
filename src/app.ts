import fastify from 'fastify';
import cors from '@fastify/cors';
import { aiService } from './services/ai.service.js';
import { borrowerRoutes } from './routes/borrower.routes.js';
import { loanRoutes } from './routes/loan.routes.js';
import { saverRoutes } from './routes/saver.routes.js';
import { webhookRoutes } from './routes/webhook.routes.js';

export const app = fastify({
  logger: true,
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
