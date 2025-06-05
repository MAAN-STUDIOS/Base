import dotenv from 'dotenv';
import get_logger from "./core/utils/logger.js";
import db from "./config/db.js";
import server from "./core/server.js";
import initSockets from "./core/sockets/index.js";
import { gameHandler } from "./core/handlers/gameHandler.js";


const logger = get_logger("APP");

async function initEnvironment() {
    const envFile = `.env.${process.env.NODE_ENV || `dev`}`;
    dotenv.config({ path: envFile });
    logger.debug(`Mounting ${envFile} as environment file.`);

    await db.connect();
    initSockets(server);
    gameHandler.init();
}

await initEnvironment();

const port = process.env.PORT || 3000;
const apiUrl = process.env.API_URL || `http://localhost:${port}`;

server.listen(port,`0.0.0.0` ,() => {
    logger.info(`Server listening on ${apiUrl} ...`);
});

