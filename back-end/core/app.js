import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import mongoose from 'mongoose';
import { get_logger } from "#utils";

// Import routes
import userRoutes from './router/userRoutes.js';
import sessionRoutes from './router/sessionRoutes.js';
import floodRoutes from './router/floodRoutes.js';
import gameMapRoutes from './router/gameMapRoutes.js';
import itemRoutes from './router/itemRoutes.js';
import logRoutes from './router/logRoutes.js';
import rankingRoutes from './router/rankingRoutes.js';
import eventRoutes from './router/eventRoutes.js';

const logger = get_logger("APP");
const envFile = `.env.${process.env.NODE_ENV || `dev`}`;
const app = express();

logger.debug(`Mounting ${envFile} as environment file.`)
dotenv.config({ path: envFile });

// Middleware
app.use(cors());
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
    windowMs: process.env.RATE_LIMIT_WINDOW_MS || 60000,
    max: process.env.RATE_LIMIT_MAX_REQUESTS || 100
});
app.use(limiter);

// Database connection
mongoose.connect(process.env.MONGODB_URI)
    .then(() => logger.info('Connected to MongoDB'))
    .catch(err => logger.error('MongoDB connection error:', err));

// Routes
app.use('/api/user', userRoutes);
app.use('/api/session', sessionRoutes);
app.use('/api/flood', floodRoutes);
app.use('/api/map', gameMapRoutes);
app.use('/api/items', itemRoutes);
app.use('/api/logs', logRoutes);
app.use('/api/ranking', rankingRoutes);
app.use('/api/event', eventRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
    logger.error(err.stack);
    res.status(err.status || 500).json({
        error: err.name || 'Internal Server Error',
        message: err.message || 'An unexpected error occurred'
    });
});

export default app;