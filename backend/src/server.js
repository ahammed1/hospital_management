
import 'dotenv/config';
import dns from 'node:dns';
import app from './app.js';
import { connectDB } from './config/db.js';

// Work around Windows Node.js SRV DNS resolution failures.
dns.setServers(['8.8.8.8', '1.1.1.1']);

const port = Number(process.env.PORT || 5000);

try {
  await connectDB();

  app.listen(port, () => {
    console.log(`MediCore API running at http://localhost:${port}`);
  });
} catch (error) {
  console.error(`Startup failed: ${error.message}`);
  process.exit(1);
}
