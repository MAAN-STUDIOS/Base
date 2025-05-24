let seed = "semilla";
let chunkX = 0;
let chunkY = 0;

const mapa = document.getElementById('mapa');
const colores = {
  0: '#A7C957', // piso
  1: '#6A994E', // muro
  2: '#F2E8CF', //puerta
  3: '#BC4749', 
  4: '#F1C40F', 
  5: '#386641', 
  6: '#264653'  
};

async function cargarChunk(x, y) {
  try {
    const res = await fetch(`http://localhost:5173/chunk/${x}/${y}/${seed}`);
    const data = await res.json();
    return data.chunk;
  } catch (error) {
    console.error("Error al cargar el chunk:", error);
    return null;
  }
}

function renderizarChunk(chunk) {
  mapa.innerHTML = '';

  chunk.forEach(val => {
    const tile = document.createElement('div');
    tile.className = 'tile';
    tile.style.backgroundColor = colores[val] || '#999';
    mapa.appendChild(tile);
  });
}

async function mostrarChunkActual() {
  const chunk = await cargarChunk(chunkX, chunkY);
  if (chunk) {
    renderizarChunk(chunk);
    //const texto = document.getElementById('coordenadas');
    //texto.textContent = `Coordenadas: (${chunkX}, ${chunkY})`;
  }
}

function colocarPuertas(chunk, x, y, seed) {
  const puerta = 2;
  const puertaX = 5; // fila central horizontal
  const puertaY = 5; // columna central vertical

  // Siempre verificar que no se salga de rango
  if (x > -4) chunk[puertaY][0] = puerta;    
  if (x < 4) chunk[puertaY][9] = puerta;    
  if (y > -4) chunk[0][puertaX] = puerta;  
  if (y < 4) chunk[9][puertaX] = puerta;   
}

//Cargar primer chunk
mostrarChunkActual();

document.addEventListener('keydown', async (event) => {
  let movido = false;

  if (event.key === 'ArrowUp') {
    if (chunkY > -4) {
      chunkY--;
      movido = true;
    }
  } else if (event.key === 'ArrowDown') {
    if (chunkY < 4) {
      chunkY++;
      movido = true;
    }
  } else if (event.key === 'ArrowLeft') {
    if (chunkX > -4) {
      chunkX--;
      movido = true;
    }
  } else if (event.key === 'ArrowRight') {
    if (chunkX < 4) {
      chunkX++;
      movido = true;
    }
  }

  if (movido) {
    await mostrarChunkActual();
  }
});
