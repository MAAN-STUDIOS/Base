import get_logger from "../utils/logger.js";
import { io } from "./index.js";


const logger = get_logger('SOCKET-PLAYER', {
    debug: {
        trucate: 1,
        cooldown: 10000
    }
});

const PLAYER_MOVE = "PlayerMove";
const PLAYER_JOIN = "PlayerJoin";
const PLAYER_LEAVE = "PlayerLeave";
const NPC_MOVE = "PlayerMove";
const ATTACK = "Attack";
const ENEMY_MOVES = "EnemyMoves";
const ENEMY_JOIN = "EnemyJoin";
const ENEMY_LEAVES = "EnemyLeaves";

const connectedPlayers = new Map();
const enemies = new Map();
export default (io, socket) => {
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
        socket.broadcast.emit(PLAYER_MOVE, data);
        // io.to(3).emit(PLAYER_MOVE, data);
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


    socket.on(PLAYER_MOVE, handleMove);
    socket.on(NPC_MOVE, handleMove);
    socket.on(ATTACK, handleAttack);


    function handlePlayerJoin(playerData) {
        connectedPlayers.set(playerData.id, playerData);

        socket.broadcast.emit(PLAYER_JOIN, playerData);

        connectedPlayers.forEach((data, id) => {
            if (id !== socket.id) {
                socket.emit(PLAYER_JOIN, {
                    id: id,
                    ...data
                });
            }
        });

        logger.debug(`Player joined: ${playerData.id}`);
    }


    function handlePlayerLeave() {
        connectedPlayers.delete(socket.id);

        socket.broadcast.emit(PLAYER_LEAVE, {
            id: socket.id
        });

        logger.debug(`Player left: ${socket.id}`);
    }

    socket.on(PLAYER_JOIN, handlePlayerJoin);
    socket.on("disconnect", handlePlayerLeave);

    function handleEnemyJoin(data) {
        enemies.set(data.id, data);

        socket.broadcast.emit(ENEMY_JOIN, data);

        enemies.forEach((data, id) => {
            if (id.split("-")[0] !== socket.id) {
                socket.emit(ENEMY_JOIN, {
                    id: id,
                    ...data
                });
            }
        });

        logger.debug(`Enemy joined: ${data.id}`);
    }

    function handleEnemyMoves(data) {
        socket.broadcast.emit(ENEMY_MOVES, data);
    }

    function handleEnemyLeaves() {
        const enemyIdsToRemove = [];

        enemies.forEach((value, key) => {
            if (key.startsWith(`${socket.id}-`)) {
                enemyIdsToRemove.push(key);
            }
        });

        enemyIdsToRemove.forEach(enemyId => {
            enemies.delete(enemyId);

            socket.broadcast.emit(ENEMY_LEAVES, {
                id: enemyId
            });

            logger.debug(`Enemy left: ${enemyId}`);
        });
    }

    socket.on(ENEMY_JOIN, handleEnemyJoin);
    socket.on(ENEMY_MOVES, handleEnemyMoves);
    socket.on("disconnect", handleEnemyLeaves);
}
