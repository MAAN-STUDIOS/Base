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
  
    tallar(1, 1);
  
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
  