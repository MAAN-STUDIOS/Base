import db from "../../config/db.js";
import get_logger from "../utils/logger.js";
const logger = get_logger("GameEngine");

export class Game {
    constructor(options = {}) {
        this.human_players = [];
        this.flood_players = [];
        this.state = "starting";
        this.game_id = null;
        this.seed = options.seed || Math.floor(Math.random() * 1000000);
        this.name = options.name || "Untitled Game";
        this.description = options.description || "No description provided.";
        this.game_id = null;
        this.fragments = 0;
        this.flood_kills = 0;
        this.human_kills = 0;

    }

    static async init() {
        // Setup listeners
        
        this.db_game = await db.query("INSERT INTO game (name, description, status, seed) VALUES (?, ?, ?, ?)", this.name, this.description, "starting", this.seed);
        this.game_id = this.db_game.id;
        console.log(`Game initialized with ID: ${this.game_id}, Name: ${this.name}, Seed: ${this.seed}`);
        this.gameLoop();
    }

    gameLoop() {
        console.log("Game loop started. State is now running.");
        this.state = "running";
        
       //while (this.state === "running") {
            // Game logic goes here
            //console.log("Game is running...");
           



        //}
    }
    #generate_dungeons(){

    }
    #generate_overworld_map(overworld_map_size) {
        logger.info("Generating overworld map with size:", overworld_map_size);
        // Logic to generate the overworld map
    }
    update(){

    }

    addPlayer(player) {
        this.players.push(player);
        console.log(`Player ${player.name} added to the game.`);
    }

    start() {
        if (this.players.length === 0) {
            console.log("No players in the game. Cannot start.");
            return;
        }
        this.state = { status: "started", players: this.players };
        console.log("Game started with players:", this.players.map(p => p.name));
    }

    end() {
        this.state = { status: "ended" };
        console.log("Game ended.");
    }
}