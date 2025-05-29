
import dotenv from 'dotenv';
import { get_logger} from "#utils";

const logger = get_logger("APP");
const envFile = `.env.${process.env.NODE_ENV || `develop`}`;

logger.debug(`Mounting ${envFile} as environment file.`)
dotenv.config({ path: envFile });

const port = process.env.PORT || 3000;
const apiUrl = process.env.apiURL || `http://localhost:${port}`;


import server from "./core/server.js";


server.listen(port, () => {
    logger.info(`Server listening on ${apiUrl} ...`);
});
