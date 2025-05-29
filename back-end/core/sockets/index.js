import { Server } from 'socket.io';
import server from "#/core/server.js";
import { get_logger } from "#utils";

import players from "./players";


const logger = get_logger("SOCKET");
const io = new Server(server, {
    cors: {
        origin: process.env.FRONTEND_URL
    }
});


io.on("connect", (socket) => {
    logger.info(`Socket Connected, socket id : ${socket.id}`);

    players(io, socket);

    socket.on("disconnect", () => {
        logger.info(`Socket Disconnected, socket id ${socket.id}`);
    })
});

export default io;