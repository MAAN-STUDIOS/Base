// Load environment variables FIRST - before any other imports
import dotenv from 'dotenv';

const envFile = `.env.${process.env.NODE_ENV || 'develop'}`;
console.log(`Loading environment file: ${envFile}`);
dotenv.config({ path: envFile });

// Now import everything else AFTER env vars are loaded
import { get_logger } from "#utils";

const logger = get_logger("APP");
logger.debug(`Mounted ${envFile} as environment file.`);

const port = process.env.PORT || 3000;
const apiUrl = process.env.apiURL || `http://localhost:${port}`;

// Import server AFTER environment variables are loaded
import server from "./core/server.js";

server.listen(port, () => {
    logger.info(`Server listening on ${apiUrl} ...`);
});

