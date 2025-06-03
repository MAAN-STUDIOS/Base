import { Server } from 'socket.io';
import get_logger from "../utils/logger.js";
import players from "./players.js";

const logger = get_logger("SOCKET");

export default function initSockets(server) {
    if (!server) {
        logger.error("Invalid server instance provided to socket initialization");
        return null;
    }

    const io = new Server(server, {
        cors: {
            origin: [
                process.env.FRONTEND_URL,
                "http://localhost:5173",
                "http://localhost:5174"
            ]
        }
    });

    io.engine.on('connection_error', (err) => {
        logger.error(`Socket connection error: ${err.message}`);
    });

    if (!io || typeof io.on !== 'function') {
        logger.error("Socket.io server failed to initialize");
        return null;
    }

    logger.info("Sockets correctly initialized");

    io.on("connect", (socket) => {
        logger.info(`Socket Connected, socket id: ${socket.id}`);

        // TODO: I think there's a built in ping pong events, double check later
        socket.on("ping", (callback) => {
            if (typeof callback === 'function') {
                callback({ status: "ok", time: Date.now() });
            }
        });

        players(io, socket);

        socket.on("disconnect", () => {
            logger.info(`Socket Disconnected, socket id ${socket.id}`);
        });
    });

    return io;
}
