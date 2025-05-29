import express from 'express';
import dotenv from 'dotenv';
import { get_logger } from "#utils";
import { router } from "#router";


const logger = get_logger("APP");
const envFile = `.env.${process.env.NODE_ENV || `dev`}`;
const app = express();

logger.debug(`Mounting ${envFile} as environment file.`)
dotenv.config({ path: envFile });


app.use(router.routes);
app.use(express.json());


export default app;