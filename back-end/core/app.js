import express from 'express';
import dotenv from 'dotenv';
import { get_logger } from "#utils";
import cors from 'cors';
import { router } from "#router";


const logger = get_logger("APP");
const envFile = `.env.${process.env.NODE_ENV || `dev`}`;
const app = express();

logger.debug(`Mounting ${envFile} as environment file.`)
dotenv.config({ path: envFile });


app.use(cors())
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(router);


export default app;