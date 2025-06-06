"use strict";
import logger from "./logger.js";

const api_url = "http://localhost:8000";

async function get_map_chunk(coordinates_x, coordinates_y, mockup) {
    const token = localStorage.getItem("authToken");
    const game_id = localStorage.getItem("gameId");
    if (!game_id || !token) {
        logger.error("Game ID or auth token not found in local storage");
        return null;
    }

    if (mockup) {
        return generateTempMapChunk(coordinates_x, coordinates_y);
    }

    const response = await fetch(`${api_url}/games/${game_id}/chunks/${coordinates_x}/${coordinates_y}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Authorization": token,
        },
    });
    if (response.status === 404 || response.status === 204) {
        return new Array(272).fill(0); // Return empty chunk if not found
    }

    if (!response.ok) {
        logger.error("Error fetching map chunk");
        return null;
    }
    const data = await response.json();
    console.log("coords: ", coordinates_x, coordinates_y);
    console.log("Map chunk data received:", data);
    console.log("Map chunk data:", data.chunk_data);
    return data.chunk_data || null;
}
function generateTempMapChunk(x, y) {
    if (x < -1 || x > 1 || y < -1 || y > 1) {
        return new Array(272).fill(0);
    }

    const arrayX = x + 1;
    const arrayY = y + 1;

    const chunkId = arrayY * 3 + arrayX;

    switch (chunkId) {
        case 0: // Centro de Comando - Puente Principal
            return [
                1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
                1, 1, 1, 1, 1, 5, 5, 5, 5, 5, 5, 1, 1, 1, 1, 2,
                1, 1, 2, 2, 1, 3, 4, 4, 4, 4, 4, 4, 4, 4, 1, 2,
                1, 1, 2, 2, 1, 5, 5, 5, 5, 5, 5, 1, 5, 5, 1, 2,
                1, 1, 1, 1, 1, 5, 5, 1, 1, 5, 5, 1, 1, 1, 1, 2,
                1, 5, 5, 5, 5, 5, 5, 1, 1, 5, 5, 5, 5, 5, 5, 2,
                1, 5, 5, 5, 5, 5, 5, 1, 1, 5, 5, 5, 5, 5, 5, 2,
                1, 5, 5, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 5, 5, 2,
                1, 5, 5, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 5, 5, 2,
                1, 5, 5, 5, 5, 5, 5, 1, 1, 5, 5, 5, 5, 5, 5, 2,
                1, 5, 5, 5, 5, 5, 5, 1, 1, 5, 5, 5, 5, 5, 5, 2,
                1, 1, 1, 1, 1, 5, 5, 1, 1, 5, 5, 1, 1, 1, 1, 2,
                1, 1, 2, 2, 1, 5, 5, 5, 5, 5, 5, 1, 5, 5, 1, 2,
                1, 1, 2, 2, 1, 5, 5, 5, 5, 5, 5, 1, 5, 5, 1, 2,
                1, 1, 1, 1, 1, 5, 5, 5, 5, 5, 5, 1, 1, 1, 1, 5,
                1, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5,
            ];

        case 1: // Corredor Principal con Intersección
            return [
                1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
                5, 5, 5, 5, 5, 5, 5, 1, 1, 5, 5, 5, 5, 5, 5, 5,
                5, 5, 5, 5, 5, 5, 5, 1, 1, 5, 5, 5, 5, 5, 5, 5,
                5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5,
                5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5,
                5, 5, 5, 5, 5, 5, 5, 1, 1, 5, 5, 5, 5, 5, 5, 5,
                5, 5, 5, 5, 5, 5, 5, 1, 1, 5, 5, 5, 5, 5, 5, 5,
                1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
                1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
                5, 5, 5, 5, 5, 5, 5, 1, 1, 5, 5, 5, 5, 5, 5, 5,
                5, 5, 5, 5, 5, 5, 5, 1, 1, 5, 5, 5, 5, 5, 5, 5,
                5, 5, 5, 5, 5, 5, 5, 1, 1, 5, 5, 5, 5, 5, 5, 5,
                5, 5, 5, 5, 5, 5, 5, 1, 1, 5, 5, 5, 5, 5, 5, 5,
                5, 5, 5, 5, 5, 5, 5, 1, 1, 5, 5, 5, 5, 5, 5, 5,
                5, 5, 5, 5, 5, 5, 5, 1, 1, 5, 5, 5, 5, 5, 5, 5,
                5, 5, 5, 5, 5, 5, 5, 1, 1, 5, 5, 5, 5, 5, 5, 5,
                5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5
            ];

        case 2: // Área Residencial/Habitaciones
            return [
                1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
                1, 5, 5, 5, 1, 5, 5, 1, 5, 5, 5, 1, 5, 5, 5, 1,
                1, 5, 2, 5, 1, 5, 2, 1, 2, 5, 2, 1, 5, 2, 5, 1,
                1, 5, 2, 5, 5, 5, 5, 1, 5, 5, 5, 5, 5, 2, 5, 1,
                2, 5, 2, 2, 2, 2, 5, 1, 5, 2, 2, 2, 2, 2, 5, 1,
                2, 5, 5, 5, 5, 5, 5, 1, 5, 5, 5, 5, 5, 5, 5, 1,
                1, 1, 1, 5, 1, 1, 1, 1, 1, 1, 1, 5, 1, 1, 1, 1,
                1, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 1,
                1, 5, 2, 2, 2, 2, 2, 5, 2, 2, 2, 2, 2, 2, 5, 1,
                2, 5, 5, 5, 5, 5, 2, 5, 2, 5, 5, 5, 5, 5, 5, 1,
                1, 1, 1, 5, 1, 5, 2, 5, 2, 5, 1, 5, 1, 1, 1, 1,
                2, 5, 5, 5, 1, 5, 5, 5, 5, 5, 1, 5, 5, 5, 5, 1,
                1, 5, 2, 2, 2, 2, 2, 5, 2, 2, 2, 2, 2, 2, 5, 1,
                1, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 1,
                1, 5, 2, 5, 2, 5, 2, 5, 2, 5, 2, 5, 2, 5, 2, 1,
                1, 1, 1, 1, 1, 5, 1, 5, 1, 1, 1, 1, 1, 1, 1, 1,
                5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5
            ];

        case 3: // Corredor de Mantenimiento
            return [
                3, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5,
                3, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5,
                3, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5,
                3, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5,
                3, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5,
                3, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5,
                3, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5,
                3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3,
                3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3,
                3, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5,
                3, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5,
                3, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5,
                3, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5,
                3, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5,
                3, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5,
                3, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5,
                3, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5
            ];

        case 4: // Laboratorio/Ingeniería
            return [
                5, 5, 5, 2, 2, 2, 2, 2, 2, 2, 2, 5, 5, 5, 5, 5,
                5, 5, 5, 2, 5, 5, 5, 5, 5, 5, 2, 5, 5, 5, 5, 5,
                5, 5, 5, 2, 5, 3, 3, 5, 3, 5, 2, 5, 5, 5, 5, 5,
                5, 5, 5, 2, 5, 3, 5, 5, 3, 5, 2, 2, 2, 5, 5, 5,
                5, 4, 4, 2, 5, 3, 5, 3, 3, 5, 5, 5, 2, 5, 5, 5,
                5, 4, 5, 5, 5, 3, 5, 5, 5, 5, 3, 5, 2, 5, 5, 5,
                5, 4, 5, 2, 2, 2, 2, 2, 2, 2, 2, 5, 2, 5, 5, 5,
                5, 4, 5, 2, 5, 5, 5, 5, 5, 5, 5, 5, 2, 5, 5, 5,
                5, 4, 5, 2, 5, 3, 3, 3, 3, 3, 3, 3, 2, 5, 5, 5,
                5, 4, 5, 5, 5, 3, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5,
                5, 4, 4, 2, 5, 3, 5, 2, 2, 2, 2, 2, 2, 2, 5, 5,
                5, 5, 5, 2, 5, 3, 5, 2, 5, 5, 5, 5, 5, 2, 5, 5,
                5, 4, 5, 2, 5, 5, 5, 2, 5, 3, 3, 3, 5, 2, 5, 5,
                5, 4, 5, 2, 2, 2, 5, 2, 5, 3, 5, 3, 5, 2, 5, 5,
                5, 4, 5, 5, 5, 2, 5, 5, 5, 3, 5, 5, 5, 2, 5, 5,
                5, 4, 4, 4, 4, 2, 2, 2, 2, 2, 2, 2, 2, 2, 5, 5,
                5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5
            ];

        case 5: // Área de Ventilación/Sistemas
            return [
                5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 3,
                5, 4, 5, 5, 4, 5, 5, 4, 5, 5, 4, 5, 5, 4, 5, 3,
                5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 3,
                5, 5, 4, 5, 5, 4, 5, 5, 4, 5, 5, 4, 5, 5, 4, 3,
                5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 3,
                5, 4, 5, 5, 4, 5, 5, 4, 5, 5, 4, 5, 5, 4, 5, 3,
                5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 3,
                3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 5, 3,
                3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 5, 3,
                5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 3,
                5, 4, 5, 5, 4, 5, 5, 4, 5, 5, 4, 5, 5, 4, 5, 3,
                5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 3,
                5, 5, 4, 5, 5, 4, 5, 5, 4, 5, 5, 4, 5, 5, 4, 3,
                5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 3,
                5, 4, 5, 5, 4, 5, 5, 4, 5, 5, 4, 5, 5, 4, 5, 3,
                5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 3
            ];

        case 6: // Observatorio/Centro de Control
            return [
                1, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5,
                1, 1, 1, 1, 5, 5, 5, 5, 5, 5, 5, 1, 1, 1, 1, 5,
                1, 5, 5, 1, 5, 5, 5, 5, 5, 5, 5, 1, 5, 5, 5, 5,
                1, 5, 5, 1, 5, 5, 5, 5, 5, 5, 5, 1, 5, 5, 5, 5,
                1, 5, 5, 1, 5, 5, 5, 5, 5, 5, 5, 1, 5, 5, 5, 5,
                1, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5,
                1, 5, 5, 5, 5, 2, 2, 2, 2, 2, 5, 5, 5, 5, 5, 5,
                1, 5, 5, 5, 5, 2, 4, 4, 4, 2, 5, 5, 5, 5, 5, 5,
                1, 5, 5, 5, 5, 2, 4, 4, 4, 2, 5, 5, 5, 5, 5, 5,
                1, 5, 5, 5, 5, 2, 2, 2, 2, 2, 5, 5, 5, 5, 5, 5,
                1, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5,
                1, 5, 5, 1, 5, 5, 5, 5, 5, 5, 5, 1, 5, 5, 5, 5,
                1, 5, 5, 1, 5, 5, 5, 5, 5, 5, 5, 1, 5, 5, 5, 5,
                1, 5, 5, 1, 5, 5, 5, 5, 5, 5, 5, 1, 5, 5, 5, 5,
                1, 1, 1, 1, 5, 5, 5, 5, 5, 5, 5, 1, 1, 1, 1, 5,
                1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1
            ];

        case 7: // Corredor de Emergencia
            return [
                5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5,
                5, 5, 5, 5, 5, 5, 5, 4, 4, 5, 5, 5, 5, 5, 5, 5,
                5, 5, 5, 5, 5, 5, 5, 4, 4, 5, 5, 5, 5, 5, 5, 5,
                5, 5, 5, 5, 5, 5, 5, 4, 4, 5, 5, 5, 5, 5, 5, 5,
                5, 5, 5, 5, 5, 5, 5, 4, 4, 5, 5, 5, 5, 5, 5, 5,
                5, 5, 5, 5, 5, 5, 5, 4, 4, 5, 5, 5, 5, 5, 5, 5,
                5, 5, 5, 5, 5, 5, 5, 4, 4, 5, 5, 5, 5, 5, 5, 5,
                4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4,
                4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4,
                5, 5, 5, 5, 5, 5, 5, 4, 4, 5, 5, 5, 5, 5, 5, 5,
                5, 5, 5, 5, 5, 5, 5, 4, 4, 5, 5, 5, 5, 5, 5, 5,
                5, 5, 5, 5, 5, 5, 5, 4, 4, 5, 5, 5, 5, 5, 5, 5,
                5, 5, 5, 5, 5, 5, 5, 4, 4, 5, 5, 5, 5, 5, 5, 5,
                5, 5, 5, 5, 5, 5, 5, 4, 4, 5, 5, 5, 5, 5, 5, 5,
                5, 5, 5, 5, 5, 5, 5, 4, 4, 5, 5, 5, 5, 5, 5, 5,
                4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4
            ];

        case 8: // Sala del Reactor/Núcleo
            return [
                1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
                1, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 1,
                1, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 1,
                1, 5, 5, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 5, 5, 1,
                2, 5, 5, 2, 5, 5, 5, 5, 5, 5, 5, 5, 2, 5, 5, 1,
                1, 5, 5, 2, 5, 5, 5, 5, 5, 5, 5, 5, 2, 5, 5, 1,
                1, 5, 5, 2, 5, 5, 3, 3, 3, 3, 5, 5, 2, 5, 5, 1,
                1, 5, 5, 2, 5, 5, 3, 4, 4, 3, 5, 5, 2, 5, 5, 1,
                1, 5, 5, 2, 5, 5, 3, 4, 4, 3, 5, 5, 2, 5, 5, 1,
                1, 5, 5, 2, 5, 5, 3, 3, 3, 3, 5, 5, 2, 5, 5, 1,
                1, 5, 5, 2, 5, 5, 5, 5, 5, 5, 5, 5, 2, 5, 5, 1,
                1, 5, 5, 2, 5, 5, 5, 5, 5, 5, 5, 5, 2, 5, 5, 1,
                2, 5, 5, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 5, 5, 1,
                1, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 1,
                1, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 1,
                1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
            ];

        default:
            return new Array(272).fill(0);
    }
}

async function userinfo(session_id) {
    const response = await fetch(`${api_url}/user/${session_id}`);
    if (!response.ok) {
        logger.error("Error fetching user info");
        return null;
    }
    const data = await response.json();
    return data;

}

// This will be added later just to have the placeholder for it
async function authenticate(email, password) {
    const response = await fetch(`${api_url}/auth/login`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
    });
    if (!response.ok) {
        logger.error("Authentication failed");
        return null;
    }
    const data = await response.json();
    return data;
}

async function verifyToken(token) {
    const response = await fetch(`${api_url}/auth/verify`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "authorization": `Bearer ${token}`
        }
    });

    return response.ok;
}

async function register(username, email, password) {
    const response = await fetch(`${api_url}/player/register`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: username, email, password }),
    });

    if (response.status === 409) {
        logger.error("User already exists");
        throw new Error("An account with this email already exists");
    }

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        logger.error("Registration failed", errorData);
        throw new Error(errorData.error || "Failed to create account. Please try again.");
    }

    const data = await response.json();
    return data;
}

async function delete_user(session_id) {
    const response = await fetch(`${api_url}/user/${session_id}`, {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json",
        },
    });
    if (!response.ok) {
        logger.error("Error deleting user");
        return null;
    }
    const data = await response.json();
    return data;
}

async function get_seed() {
    const response = await fetch(`${api_url}/seed`);
    if (!response.ok) {
        logger.error("Error fetching seed");
        return null;
    }
    const data = await response.json();
    return data;
}

async function get_ranking() {
    const response = await fetch(`${api_url}/ranking`);
    if (!response.ok) {
        logger.error("Error fetching ranking");
        return null;
    }
    const data = await response.json();
    return data;
}
async function create_game(name, description, seed, max_players, jwt) {
    const response = await fetch(`${api_url}/games`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `${jwt}`
        },
        body: JSON.stringify({ name, description, seed, max_players }),
    });
    if (response.status === 401) {
        logger.error("Unauthorized: JWT is required to create a game");
        return response;
    }
    if (!response.ok) {
        logger.error("Error creating game");
        return null;
    }


    return response;

}
async function join_game(game_id, player_type, socket_id, jwt) {
    if (!jwt) {
        logger.error("JWT is required to join a game");
        return null;
    }
    const response = await fetch(`${api_url}/games/${game_id}/join`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `${jwt}`
        },
        body: JSON.stringify({ player_type, socket_id }),
    });
    if (!response.ok) {
        logger.error("Error joining game");
        return null;
    }
    //console.log("Response from join_game:", response);
    return await response.json();
}
async function game_info(game_id) {

    const response = await fetch(`${api_url}/games/${game_id}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
    });
    logger.info(`Fetching game info for game ID: ${game_id}`);
    if (!response.ok) {
        logger.error("Game not found");
        return null;
    }
    return await response.json();
}
async function active_games() {
    const response = await fetch(`${api_url}/games/`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
    });
    if (!response.ok) {
        logger.error("Error fetching active games");
        return null;
    }
    return await response.json();
}



export {
    get_map_chunk,
    userinfo,
    authenticate,
    verifyToken,
    register,
    delete_user,
    get_seed,
    get_ranking,
    join_game,
    create_game,
    game_info,
    active_games
}