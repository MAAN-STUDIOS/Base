const seedrandom = require('seedrandom'); // para tener aleatoriedad con semilla                 

// app.get('/chunk/:x/:y/:seed', (req, res) => {
//   const { x, y, seed } = req.params;      //extraer x, y y semilla de la URL
//   const size = 10;                        //tamaño del chunk: 10x10 = 100 celdas
//   const rng = seedrandom(`${seed}-${x}-${y}`); //usar la semilla única para este chunk

//   const chunk = [];
//   for (let i = 0; i < size * size; i++) {
//     chunk.push(Math.floor(rng() * 6));
//   }

//   res.json({ chunk });
// });


function chunkConectado(seed) {
    const size = 10;
    const chunk = Array.from({ length: size }, () => Array(size).fill(1)); //todo muros
  
    const rng = seedrandom(seed);
  
    const directions = [
      [0, -1], [0, 1], [-1, 0], [1, 0],
    ];

    function reforzarMurosDeBorde(x, y) {
      // Refuerza los bordes si estamos en el borde global del mapa
      const size = 10;
    
      //izquierda
      if (x === -4) {
        for (let i = 0; i < size; i++) {
          chunk[i][0] = 1;
        }
      }
    
      //derecha
      if (x === 4) {
        for (let i = 0; i < size; i++) {
          chunk[i][size - 1] = 1;
        }
      }
    
      //arriba
      if (y === -4) {
        for (let i = 0; i < size; i++) {
          chunk[0][i] = 1;
        }
      }
    
      //abajo
      if (y === 4) {
        for (let i = 0; i < size; i++) {
          chunk[size - 1][i] = 1;
        }
      }
    }
  
    function enRango(x, y) {
      return x >= 0 && y >= 0 && x < size && y < size;
    }
  
    function mezclar(array) {
      for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(rng() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
      }
      return array;
    }

    //eliminar los muros y crear pasillos para que sean accesibles
    function tallar(x, y) {
      chunk[y][x] = 0;
  
      for (const [dx, dy] of mezclar(directions)) {
        const nx = x + dx * 2;
        const ny = y + dy * 2;
  
        if (enRango(nx, ny) && chunk[ny][nx] === 1) {
          chunk[y + dy][x + dx] = 0; 
          tallar(nx, ny);
        }
      }
    }


  //eliminar caminos bloqueados -> que no sea accesible desde la entrada (1,1)
  function limpiarInaccesibles(chunk) {
    const visitado = Array.from({ length: size }, () => Array(size).fill(false));
    
    function dfs(x, y) {
      if (!enRango(x, y) || visitado[y][x] || chunk[y][x] !== 0) return;
      visitado[y][x] = true;
      for (const [dx, dy] of directions) {
        dfs(x + dx, y + dy); //recursivo
      }
    }
  
    dfs(1, 1); //empieza desde el punto inicial
  
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        if (chunk[y][x] === 0 && !visitado[y][x]) {
          chunk[y][x] = 1; //convertir en muro
        }
      }
    }
  }
  
  function colocarConexiones(x, y) {
    const puerta = 2;
    const px = 5;

    //izquierda
    if (x > -4) {
      chunk[px][0] = puerta;
      chunk[px][1] = 0;
    }

    //derecha
    if (x < 4) {
      chunk[px][9] = puerta;
      chunk[px][8] = 0;
    }

    //arriba
    if (y > -4) {
      chunk[0][px] = puerta;
      chunk[1][px] = 0;
    }

    //abajo
    if (y < 4) {
      chunk[9][px] = puerta;
      chunk[8][px] = 0;
    }
  }
  
    tallar(1, 1);
    limpiarInaccesibles(chunk);

    colocarConexiones(x, y);
    reforzarMurosDeBorde(x, y);
  
    //meter valores (2-5) con probabilidad
    const plano = chunk.flat().map(val => {
      if (val === 0 && rng() < 0.1) return Math.floor(rng() * 4) + 2; // 2-5
      return val;
    });
  
    return plano;
  }
  
  app.get('/chunk/:x/:y/:seed', (req, res) => {
    const { x, y, seed } = req.params;
    const finalSeed = `${seed}-${x}-${y}`;
    const chunk = chunkConectado(finalSeed);
  
    res.json({ chunk });
  });
  