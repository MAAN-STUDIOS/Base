import { Server } from 'socket.io';
import get_logger from "../utils/logger.js";

const logger = get_logger("SOCKET");
let io = null;


/**
 *
 * @type {{entities: [
 *     {
 *         id, x, y, type, kind
 *     }
 * ]}
 * }
 */
const game = {
    entities: [],
    players: [],
};

const games = new Map();

function createGame(id) {
    if (games.has(id)) return;

    games.set(id, {
        entities: [],
        players: []
    });
}

function joinGame(socket_id, id) {
    try {
        const socket = io.sockets.sockets.get(socket_id);
        // games.get(game_id).players.push({id: player_id, socket: socket_id});
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

function players(io, socket) {
    socket.on("join", (data) => {
        if (!data) return;

        socket.emit("gameEntities", game.entities.filter(entity => entity.id !== data.id));

        if (data.kind !== "projectile") {
            game.entities.push({
                id: data.id,
                eid: data.eid,
                cid: data.cid,
                x: data.x,
                y: data.y,
                kind: data.kind,
                type: data.type
            });
        }

        socket.broadcast.emit("join", data);
    });

    socket.on("update", (data) => {
        socket.broadcast.emit("update", data);
    });

    socket.on("damage", (data) => {
        socket.broadcast.emit("damage", data);
    });

    socket.on("death", (data) => {
        socket.broadcast.emit("death", data);
    });
}

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

const sockets = {
    joinGame,
    initSockets
};

export { io, sockets };