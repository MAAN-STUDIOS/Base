"use strict";
// Socket.io client implementation
import { io } from "socket.io-client";
import logger from "./logger.js";

const port = 3001;
const socket_backend = `http://localhost:${port}/`;
const socket = io(socket_backend, {
    autoConnect: true,
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000
});

socket.on("connect", () => {
    logger.info("Blututh dewaiz connected soccesfully: " + socket.id);
});

socket.on("disconnect", () => {
    logger.info("Blututh dewaiz broker disconnected");
});

const emitEvent = (eventName, data, callback) => {
    socket.emit(eventName, data, (response) => {
        if (callback) {
            callback(response);
        }
    });
}

const subscribeToEvent = (eventName, callback) => {
    socket.on(eventName, callback);
    // Return unsubscribe function
    return () => socket.off(eventName, callback);
};

const disconnectSocket = () => {
    socket.disconnect();
};

const connectSocket = () => {
    if (!socket.connected) {
        socket.connect();
    }
};

export {
    socket as default,
    emitEvent,
    subscribeToEvent,
    disconnectSocket,
    connectSocket
  };


  