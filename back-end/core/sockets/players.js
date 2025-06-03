import get_logger from "../utils/logger.js";


const logger = get_logger('SOCKET-PLAYER', {
    debug: {
        trucate: 1,
        cooldown: 10000
    }
});

export default (io, socket) => {
    // Feature: preparing for multi game handling
    //
    // socket.on("JoinGame", (gameID) => {
    //     socket.join(gameID);
    //     logger.debug(`${socket.id} joined game ${gameID}`);
    // });
    //
    // socket.on("MovePlayer", ({ gameID, data }) => {
    //     logger.debug({ socket: socket.id, data });
    //     io.to(gameID).emit("MovePlayer", {
    //         data
    //     });
    //     socket.broadcast.emit("MovePlayer", data);
    // });

    /**
     * Handler for MovePlayer/MoveNPC events.
     * Broadcasts movement data to all other connected clients (Preliminar simplify handler).
     *
     * @param {{
     *      id: number,        // Entity identifier
     *      type: string,      // Entity type (player, enemy, etc.)
     *      health: number,    // Current health points
     *      vector: {Vector}, // Position vector
     *      speed: {Vector}   // Velocity vector
     * }||any} data - Movement payload to broadcast to other clients.
     *
     * @returns {void}
     */
    function handleMove(data) {
        logger.debug({ socket: socket.id, data });
        socket.broadcast.emit("MovePlayer", data);
    }

    /**
     * Handler of Attack event.
     *
     * @param {{
     *      id: {number},           // ID of the attacking entity
     *      direction: {Vector},    // Direction vector of the attack
     *      entityType: {string},   // Type of entity that created the attack
     *      level: {number},        // Level of the attack
     *      damage: {number}        // Amount of damage this attack can deal
     * }||any} attack - Payload to resend to other clients.
     *
     * @returns {void}
     */
    function handleAttack(attack) {
        logger.debug({ socket: socket.id, attack });
        socket.broadcast.emit("Attack", attack);
    }


    socket.on("MovePlayer", handleMove);
    socket.on("MoveNPC", handleMove);
    socket.on("Attack", handleAttack);
}

