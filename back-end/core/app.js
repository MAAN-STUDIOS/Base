import express from 'express';
import cors from 'cors';
import { router } from './router/index.js'
import get_logger from './utils/logger.js';

const logger = get_logger('APP');
const app = express();

// Middleware
app.use(cors())
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Root route
app.get('/', (req, res) => {
  res.json({ message: 'API is running' });
});

// Mount all routes
app.use(router);

logger.debug('Express app configured');
export default app;