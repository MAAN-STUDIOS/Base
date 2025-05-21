import { navigate } from "@utils/router.js";
import style from "@screens/styles/credits.module.css";

export default function () {
    const listener = () => {
        const btn = document.getElementById("menu-btn");

        btn?.addEventListener("click", () => navigate("menu"))
    }

    return [listener, `
    <main class="${style.main}">
        <h1>Cosmonavt Developer Team</h1>
        <div class="${style.container}">
            <div class="${style.containerTeam}">
                <h2 class="${style.humans}">Humans Team</h2>
                <ul>
                    <li>Angel Montemayor Davila</li>
                    <li>Emiliano Delgadillo Osorio</li>
                    <li>Katia Abigail Alvarez Contreras</li>
                </ul>
            </div>   
            <div class="${style.containerTeam}">
                <h2 class="${style.floods}">Flood Team</h2>
                <ul>
                    <li>Mariano Carretero Fuentes</li>
                    <li>Isabela Valls</li>
                    <li>Hans Preinfalk Davila</li>
                </ul>
            </div>    
        </div>
        <button id="menu-btn">Back to Menu</button>
    </main>
    `];
}