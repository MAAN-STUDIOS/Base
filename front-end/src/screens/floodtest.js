import { FloodPlayer } from "@engine/floodplayer.js";
import { Vector } from "@utils/vector.js";
import { ObjectContainer, FloodContainer } from "@engine/objectcontainer.js";
import styles from "@screens/styles/game.module.css";

export default function () {
  setTimeout(() => {
    const canvas = document.getElementById("game");
    if (!canvas) {
      console.error("Canvas not found!");
      return;
    }
    console.log("Canvas found:", canvas);

    function resizeCanvas() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      console.log("Canvas resized to:", canvas.width, canvas.height);
    }

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      console.error("Could not get canvas context!");
      return;
    }
    console.log("Canvas context obtained");

    const flood = new FloodPlayer({
      position: new Vector(
        canvas.width / 2 - 25,
        canvas.height / 2 - 25
      ),
      width: 50,
      height: 50,
      color: "purple"
    });
    console.log("Flood player created at:", flood.position);

    const clones = [];
    const enemies = [];
    
    // Crear contenedores para recolectar biomasa
    const containers = [];
    
    // Crear contenedor estándar
    function createContainer(type, x, y) {
      const container = type === "flood" 
        ? new FloodContainer({
            position: new Vector(x, y),
            width: 40,
            height: 40,
            color: "#8b0000"
          })
        : new ObjectContainer({
            containerType: "crate",
            position: new Vector(x, y),
            width: 40,
            height: 40
          });
      
      container.generateContent();
      containers.push(container);
      return container;
    }
    
    // Crear varios contenedores en el mapa
    createContainer("flood", canvas.width / 2 - 200, canvas.height / 2 - 100);
    createContainer("flood", canvas.width / 2 + 150, canvas.height / 2 + 100);
    createContainer("standard", canvas.width / 2 - 100, canvas.height / 2 + 150);
    createContainer("standard", canvas.width / 2 + 200, canvas.height / 2 - 150);

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
    
    // Eliminar el manejador de clics ya que ahora la interacción es por proximidad
    
    function getPlayerOverlappingContainer() {
      // Comprobar qué contenedor está bajo el jugador
      for (const container of containers) {
        // Verificar si hay solapamiento entre jugador y contenedor
        const playerCenterX = flood.position.x + flood.width / 2;
        const playerCenterY = flood.position.y + flood.height / 2;
        const containerCenterX = container.position.x + container.width / 2;
        const containerCenterY = container.position.y + container.height / 2;
        
        // Calcular la distancia entre centros
        const distance = Math.sqrt(
          Math.pow(playerCenterX - containerCenterX, 2) + 
          Math.pow(playerCenterY - containerCenterY, 2)
        );
        
        // Si el jugador está lo suficientemente cerca del contenedor
        if (distance < 40) {
          return container;
        }
      }
      return null;
    }

    function loop() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const baseSpeed = 2;
      const sprintSpeed = 4;
      const currentSpeed = keys["shift"] ? sprintSpeed : baseSpeed;

      if (keys["w"]) flood.position.y -= currentSpeed;
      if (keys["s"]) flood.position.y += currentSpeed;
      if (keys["a"]) flood.position.x -= currentSpeed;
      if (keys["d"]) flood.position.x += currentSpeed;

      if (keys["e"]) flood.evolve();
      if (keys["c"]) {
        const clone = flood.createClone();
        if (clone) {
          clones.push(clone);
        }
      }
      
      // Interacción con contenedores cuando el jugador está encima
      const containerUnderPlayer = getPlayerOverlappingContainer();
      
      // Mostrar indicador visual si hay un contenedor bajo el jugador
      if (containerUnderPlayer) {
        ctx.beginPath();
        ctx.arc(
          containerUnderPlayer.position.x + containerUnderPlayer.width / 2,
          containerUnderPlayer.position.y + containerUnderPlayer.height / 2,
          45, 0, 2 * Math.PI
        );
        ctx.strokeStyle = "rgba(255, 255, 255, 0.7)";
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Si se presiona F, interactuar con el contenedor
        if (keys["f"]) {
          // Reiniciar la tecla para evitar interacciones repetidas
          keys["f"] = false;
          
          if (containerUnderPlayer instanceof FloodContainer) {
            if (!containerUnderPlayer.isOpen) {
              containerUnderPlayer.open(flood);
            }
            
            // Extraer biomasa si es un contenedor Flood
            const biomassAmount = containerUnderPlayer.extractBiomass(flood);
            if (biomassAmount > 0) {
              flood.biomass += biomassAmount;
              console.log(`Extracted ${biomassAmount} biomass. Total: ${flood.biomass}`);
            }
          } else {
            // Alternar estado abierto/cerrado
            if (containerUnderPlayer.isOpen) {
              containerUnderPlayer.close();
            } else {
              containerUnderPlayer.open(flood);
            }
          }
        }
      }
      
      // Ataque al enemigo más cercano
      if (keys["r"]) {
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

      clones.forEach(clone => {
        clone.update(flood, enemies);
      });
      
      // Dibujar contenedores
      containers.forEach(container => {
        container.draw(ctx);
        
        // Dibujar etiqueta de estado
        const centerX = container.position.x + container.width / 2;
        const centerY = container.position.y - 10;
        
        ctx.font = "12px monospace";
        ctx.fillStyle = "white";
        ctx.textAlign = "center";
        
        if (container instanceof FloodContainer) {
          if (container.biomassAmount > 0) {
            ctx.fillText("Biomass", centerX, centerY);
          } else {
            ctx.fillText("Empty", centerX, centerY);
          }
        } else {
          ctx.fillText(container.isOpen ? "Open" : "Closed", centerX, centerY);
        }
        
        ctx.textAlign = "left";
      });

      enemies.forEach(enemy => {
        ctx.fillStyle = "red";
        ctx.fillRect(enemy.position.x, enemy.position.y, enemy.width, enemy.height);
        
        const healthPercentage = enemy.health / 100;
        ctx.fillStyle = "gray";
        ctx.fillRect(enemy.position.x, enemy.position.y - 10, enemy.width, 5);
        ctx.fillStyle = "green";
        ctx.fillRect(enemy.position.x, enemy.position.y - 10, enemy.width * healthPercentage, 5);
      });

      flood.draw(ctx);
      clones.forEach(clone => clone.draw(ctx));

      ctx.font = "16px monospace";
      ctx.fillStyle = "white";
      ctx.fillText(`Biomass: ${flood.biomass}`, 20, 30);
      ctx.fillText(`Evo: ${flood.evolution}`, 20, 50);
      ctx.fillText(`Speed: ${currentSpeed}`, 20, 70);
      ctx.fillText(`Clones: ${clones.length}`, 20, 90);
      ctx.fillText(`Enemies: ${enemies.length}`, 20, 110);
      
      // Instrucciones actualizadas
      ctx.fillText("WASD - Move", 20, canvas.height - 100);
      ctx.fillText("E - Evolve", 20, canvas.height - 80);
      ctx.fillText("C - Create clone", 20, canvas.height - 60);
      ctx.fillText("F - Interact with container/Extract biomass", 20, canvas.height - 40);
      ctx.fillText("R - Attack enemies", 20, canvas.height - 20);
      
      // Ya usamos containerUnderPlayer arriba, no necesitamos declararlo de nuevo
      if (containerUnderPlayer) {
        ctx.font = "18px monospace";
        ctx.fillStyle = "yellow";
        ctx.textAlign = "center";
        ctx.fillText("Press F to interact", 
          canvas.width / 2, 
          canvas.height - 150);
        ctx.textAlign = "left";
      }

      requestAnimationFrame(loop);
    }

    loop();
  }, 100);

  return `
    <main class="${styles.container}">
      <canvas id="game"></canvas>
    </main>
  `;
}