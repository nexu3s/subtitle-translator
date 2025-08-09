// ===== INITIALIZATION & STARTUP =====
import { server } from './app';
import { logger } from './utils/logger';
import 'dotenv/config';

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  logger.info(`Server running on http://localhost:${PORT}`);
});