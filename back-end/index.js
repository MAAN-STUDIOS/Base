import dotenv from 'dotenv';
import get_logger from "./core/utils/logger.js";
import db from "./config/db.js";
import server from "./core/server.js";


const logger = get_logger("APP");

async function initEnvironment() {
    const envFile = `.env.${process.env.NODE_ENV || `dev`}`;
    dotenv.config({ path: envFile });
    logger.debug(`Mounting ${envFile} as environment file.`);

    await db.connect();
}

await initEnvironment();

const port = process.env.PORT || 3000;
const apiUrl = process.env.apiURL || `http://localhost:${port}`;

server.listen(port, () => {
    logger.info(`Server listening on ${apiUrl} ...`);
});

