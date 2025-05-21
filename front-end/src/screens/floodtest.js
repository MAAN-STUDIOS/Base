import { FloodPlayer } from "@engine/floodPlayer.js";
import { Vector } from "@utils/vector.js";
import styles from "@screens/styles/game.module.css";

export default function () {
  setTimeout(() => {
    const canvas = document.getElementById("game");
    if (!canvas) {
      console.error("Canvas not found!");
      return;
    }
    console.log("Canvas found:", canvas);

    // Ajustar tamaño del canvas al tamaño de la ventana
    function resizeCanvas() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      console.log("Canvas resized to:", canvas.width, canvas.height);
    }

    // Inicializar tamaño y agregar listener para resize
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      console.error("Could not get canvas context!");
      return;
    }
    console.log("Canvas context obtained");

    // Crear el jugador en el centro de la pantalla
    const flood = new FloodPlayer({
      position: new Vector(
        canvas.width / 2 - 25,  // Centrar horizontalmente (restamos la mitad del ancho)
        canvas.height / 2 - 25  // Centrar verticalmente (restamos la mitad del alto)
      ),
      width: 50,
      height: 50,
      color: "purple"
    });
    console.log("Flood player created at:", flood.position);

    // Array para mantener los clones y enemigos
    const clones = [];
    const enemies = [];

    // Crear algunos enemigos de prueba
    for (let i = 0; i < 5; i++) {
      enemies.push({
        position: new Vector(
          Math.random() * canvas.width,
          Math.random() * canvas.height
        ),
        width: 30,
        height: 30,
        health: 100,
        takeDamage(amount) {
          this.health -= amount;
          if (this.health <= 0) {
            const index = enemies.indexOf(this);
            if (index > -1) {
              enemies.splice(index, 1);
            }
          }
        }
      });
    }

    const keys = {};
    window.addEventListener("keydown", (e) => (keys[e.key.toLowerCase()] = true));
    window.addEventListener("keyup", (e) => (keys[e.key.toLowerCase()] = false));

    let lastTime = performance.now();

    function loop() {
      // Calcular delta time
      const now = performance.now();
      const dt = (now - lastTime) / 1000; // convertir de ms a segundos
      lastTime = now;

      // Limpiar el canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Movement con velocidad base y velocidad rápida
      const baseSpeed = 2;
      const sprintSpeed = 4;
      const currentSpeed = keys["shift"] ? sprintSpeed : baseSpeed;

      if (keys["w"]) flood.position.y -= currentSpeed;
      if (keys["s"]) flood.position.y += currentSpeed;
      if (keys["a"]) flood.position.x -= currentSpeed;
      if (keys["d"]) flood.position.x += currentSpeed;

      // Abilities
      if (keys["e"]) flood.evolve();
      if (keys["c"]) {
        const clone = flood.createClone();
        if (clone) {
          clones.push(clone);
          console.log("Clone added to array, total clones:", clones.length);
        }
      }
      if (keys["f"]) {
        // Atacar al enemigo más cercano
        const nearestEnemy = enemies.reduce((nearest, enemy) => {
          const dx = enemy.position.x - flood.position.x;
          const dy = enemy.position.y - flood.position.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          if (!nearest || distance < nearest.distance) {
            return { enemy, distance };
          }
          return nearest;
        }, null);

        if (nearestEnemy && nearestEnemy.distance < 100) {
          flood.attack("melee", nearestEnemy.enemy);
        }
      }

      // Actualizar clones con delta time
      clones.forEach(clone => {
        clone.update(dt, flood, enemies);
      });

      // Dibujar enemigos
      enemies.forEach(enemy => {
        ctx.fillStyle = "red";
        ctx.fillRect(enemy.position.x, enemy.position.y, enemy.width, enemy.height);
        
        // Barra de vida del enemigo
        const healthPercentage = enemy.health / 100;
        ctx.fillStyle = "gray";
        ctx.fillRect(enemy.position.x, enemy.position.y - 10, enemy.width, 5);
        ctx.fillStyle = "green";
        ctx.fillRect(enemy.position.x, enemy.position.y - 10, enemy.width * healthPercentage, 5);
      });

      // Dibujar el jugador
      flood.draw(ctx);

      // Dibujar los clones
      clones.forEach(clone => {
        clone.draw(ctx);
      });

      // Dibujar texto de estado
      ctx.font = "16px monospace";
      ctx.fillStyle = "white";
      ctx.fillText(`Biomass: ${flood.biomass}`, 20, 30);
      ctx.fillText(`Evo: ${flood.evolution}`, 20, 50);
      ctx.fillText(`Speed: ${currentSpeed}`, 20, 70);
      ctx.fillText(`Clones: ${clones.length}`, 20, 90);
      ctx.fillText(`Enemies: ${enemies.length}`, 20, 110);

      requestAnimationFrame(loop);
    }

    // Iniciar el loop
    loop();
  }, 100);

  return `
    <main class="${styles.container}">
      <canvas id="game"></canvas>
    </main>
  `;
}
