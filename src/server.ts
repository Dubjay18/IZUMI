import 'dotenv/config';
import { app } from './app.js';

const start = async () => {
  const port = Number(process.env.PORT || 5000);
  const host = '0.0.0.0'; // Bind to all interfaces for flexibility

  try {
    await app.listen({ port, host });
    app.log.info(`Server successfully listening on http://${host}:${port}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();
