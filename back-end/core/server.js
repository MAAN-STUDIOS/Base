import { createServer } from 'http';
import get_logger from "./utils/logger.js";
import app from "./app.js";


const logger = get_logger("SERVER");
const server = createServer(app);

logger.debug('Server created');
export default server;