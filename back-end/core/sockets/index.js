import { Server } from 'socket.io';
import get_logger from "../utils/logger.js";
import players from "./players.js";

const logger = get_logger("SOCKET");
let io = null;

export default function initSockets(server) {
    if (io) {
        logger.warn("Sockets were tried to be initialize more than once; returning instances");
        return io;
    }

    if (!server) {
        logger.error("Invalid server instance provided to socket initialization");
        return null;
    }

    io = new Server(server, {
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

function joinRoom(socket_id, id) {
    try {
        const socket = io.sockets.sockets.get(socket_id);
        if (!socket) {
            return {
                success: false,
                reason: "Socket not found"
            };
        }
        socket.join(id);
        return {
            success: true
        };
    } catch (err) {
        return {
            success: false,
            reason: err.message ?? "Failed to join room"
        };
    }
}

const sockets = {
    joinRoom,
};

export { io, sockets };