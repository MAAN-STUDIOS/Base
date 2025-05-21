"use strict";
import logger from "./logger.js";

const api_url = "http://localhost:3000";

async function get_map_chunk(coordinates_x, coordinates_y) {
    const response = await fetch(`${api_url}/map/chunk/${coordinates_x}/${coordinates_y}`);
    if (!response.ok) {
        logger.error("Error fetching map chunk");
        return null;
    }
    const data = await response.json();
    return data;

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
async function authenticate(username, password) {
    const response = await fetch(`${api_url}/auth/login`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
    });
    if (!response.ok) {
        logger.error("Error fetching map chunk");
        return null;
    }
    const data = await response.json();
    return data;
}
async function register(username, password) {
    const response = await fetch(`${api_url}/user/`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
    });
    if (response.status == 401) {
        logger.error("User already exists");
        return null;
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
export {
    get_map_chunk,
    userinfo,
    authenticate,
    register,
    delete_user,
    get_seed,
    get_ranking
}