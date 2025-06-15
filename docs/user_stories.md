# Historias de Usuario Actualizadas - Cosmonavt
---

## ÉPICA 1: SISTEMA DE AUTENTICACIÓN Y GESTIÓN DE USUARIOS
**Prioridad: CRÍTICA - Sprint 1**

### US-001: Sistema de Registro y Autenticación
**Como usuario, quiero registrarme y autenticarme en el sistema para acceder a las funcionalidades del juego.**

**Criterios de Aceptación:**
- Endpoint `/auth/register` implementado con validación de email, nombre y contraseña
- Endpoint `/auth/login` con generación de JWT tokens
- Validación de contraseñas con bcrypt
- Middleware de autenticación `authenticateToken` funcional
- Almacenamiento seguro de credenciales en base de datos MySQL
- Redirección automática si no está autenticado (`redirectIfNotLoggedIn`)
- Tokens JWT almacenados en localStorage del frontend

**Implementación Backend:**
- `AuthController` con métodos de login/registro
- Base de datos con tabla `users`
- JWT_SECRET configurado en variables de entorno
- Validación de email format y longitud de contraseña mínima

**Implementación Frontend:**
- Pantallas de login/registro con validación
- Manejo de tokens en `apimanager.js`
- Redirecciones automáticas basadas en estado de autenticación

**Definición de Terminado:**
- Usuario puede registrarse con email válido
- Usuario puede iniciar sesión y recibir token JWT
- Token se almacena y utiliza en requests subsecuentes
- Middleware rechaza requests sin token válido

---

### US-002: Gestión de Partidas y Salas
**Como jugador autenticado, quiero crear y unirme a partidas multijugador para jugar con otros usuarios.**

**Criterios de Aceptación:**
- Endpoint `/games` para crear nuevas partidas
- Endpoint `/games/:id/join` para unirse a partidas existentes
- Sistema de códigos de sala compartibles
- Validación de capacidad máxima de jugadores
- Estados de partida: `starting`, `running`, `ended`
- Almacenamiento de gameId en localStorage
- Integración con Socket.IO para unirse a rooms

**Implementación Backend:**
- `GameController` con métodos CRUD para partidas
- Base de datos con tabla `game` y `player_game`
- Sistema de validación de capacidad y estado
- Integration con sockets para gestión de rooms

**Implementación Frontend:**
- Pantalla `startgame.js` para selección de tipo de jugador
- API calls en `apimanager.js` para crear/unirse a partidas
- Manejo de errores específicos (partida llena, terminada, no encontrada)

**Definición de Terminado:**
- Usuario puede crear partidas con código único
- Usuario puede unirse usando código de partida
- Sistema valida capacidad y estado antes de permitir entrada
- Errores se muestran claramente al usuario

---

## ÉPICA 2: MOTOR DE JUEGO Y SISTEMA CENTRAL
**Prioridad: CRÍTICA - Sprint 1-2**

### US-003: Motor de Juego 2D con Sistema de Chunks
**Como jugador, quiero un motor de juego fluido que maneje mapas grandes mediante un sistema de chunks optimizado.**

**Criterios de Aceptación:**
- Motor de juego `Engine` con renderizado a 60 FPS
- Sistema de chunks de 16x16 tiles para optimización
- Carga dinámica de 3 chunks alrededor del jugador
- Mapas generados proceduralmente y almacenados en BD
- Sistema de colisiones preciso con `Hitbox`
- Coordenadas globales y locales manejadas correctamente

**Implementación Backend:**
- Vista `view_chunk` en base de datos para chunks optimizados
- Generación de mapas con diferentes tipos de tiles (1-8)
- Sistema de coordenadas de chunks (chunk_x, chunk_y)
- API para obtener datos específicos de chunks

**Implementación Frontend:**
- Clase `Engine` principal con loop de juego
- Sistema `Vector` para manejo de coordenadas 2D
- Clase `Hitbox` para detección de colisiones
- Manejo de spritesheets para tiles del mapa
- Optimización de renderizado solo para chunks visibles

**Definición de Terminado:**
- Juego mantiene 60 FPS estables
- Chunks se cargan/descargan dinámicamente sin lag
- Colisiones funcionan correctamente
- Mapas se generan y persisten en base de datos

---

### US-004: Sistema de Comunicación en Tiempo Real
**Como jugador, quiero comunicarme en tiempo real con otros jugadores durante la partida.**

**Criterios de Aceptación:**
- Socket.IO configurado con CORS para multiple frontends
- Eventos implementados: `join`, `update`, `damage`, `death`
- Sistema de rooms para aislar partidas
- Reconexión automática en caso de desconexión
- Latencia minimizada para actualizaciones de posición
- Ping/pong implementado para monitoreo de conexión

**Implementación Backend:**
- `sockets/index.js` con manejo de eventos principales
- Función `joinGame` para unir jugadores a rooms específicos
- Broadcasting de eventos solo dentro de cada room
- Manejo de errores de conexión y desconexión
- Logging detallado de eventos de socket

**Implementación Frontend:**
- `networkmanager.js` con cliente Socket.IO
- Funciones `emitEvent` y `subscribeToEvent` para comunicación
- Almacenamiento de socketID en localStorage
- Sistema de callbacks para manejo de respuestas
- Reconexión automática configurada

**Definición de Terminado:**
- Jugadores se conectan automáticamente al entrar al juego
- Eventos se transmiten solo a jugadores de la misma partida
- Sistema maneja desconexiones gracefully
- Latencia de red es mínima para gameplay fluido

---

## ÉPICA 3: MECÁNICAS ESPECÍFICAS DE JUGADORES HUMANOS
**Prioridad: ALTA - Sprint 2**

### US-005: Sistema de Supervivencia Humana con Oxígeno
**Como jugador humano, quiero gestionar mi oxígeno como recurso vital para sobrevivir en la estación espacial.**

**Criterios de Aceptación:**
- Oxígeno inicial de 100 unidades al spawneo
- Consumo gradual: 10 unidades por acción de sprint
- Regeneración: 0.3 unidades por segundo en reposo
- Muerte automática al llegar a 0 de oxígeno
- Indicador visual de oxígeno en HUD
- Sistema de timers para manejo de regeneración

**Implementación Backend:**
- Campo `oxygen` en tabla `human_game`
- Validación de muerte por falta de oxígeno en motor de juego
- Persistencia de estado de oxígeno en base de datos

**Implementación Frontend:**
- Clase `HumanPlayer` con lógica de oxígeno
- Variables `oxygenUse`, `oxygenReload`, `oxygenTimer`
- HUD específico mostrando barra de oxígeno
- Sistema de muerte implementado en `takeDamage`

**Definición de Terminado:**
- Oxígeno se consume y regenera según especificaciones
- Jugador muere al agotar oxígeno completamente
- HUD muestra información precisa de oxígeno restante
- Estado se guarda correctamente en base de datos

---

### US-006: Sistema de Progresión de Armas por Niveles
**Como jugador humano, quiero desbloquear armas más poderosas conforme elimino enemigos para mejorar mi capacidad de combate.**

**Criterios de Aceptación:**
- 4 niveles de progresión con armas específicas:
  - Nivel 1: Pistola (desbloqueada por defecto)
  - Nivel 2: Protogun (5 kills requeridas)
  - Nivel 3: Ametralladora (7 kills adicionales)
  - Nivel 4: Lanzallamas (9 kills adicionales)
- Sistema de kills tracking con `addKill()` method
- Desbloqueo automático al alcanzar kills requeridas
- Persistencia de armas desbloqueadas en `unlockedWeapons`
- Cambio de arma con tecla R entre armas disponibles

**Implementación Backend:**
- Campos `weapon_1`, `weapon_2` en tabla `human_game`
- Tracking de kills en motor de juego
- Endpoint para reportar kills y progreso

**Implementación Frontend:**
- Variables `level`, `kills`, `killsNeededForNextLevel` en `HumanPlayer`
- Método `levelUp()` para gestionar progresión
- Sistema `unlockedWeapons` para control de disponibilidad
- Sprites específicos para cada arma (Pistola, Shotgun, Metra, Lanzallamas)

**Definición de Terminado:**
- Armas se desbloquean automáticamente al alcanzar kills
- Sistema persiste progreso entre sesiones
- Jugador puede cambiar solo entre armas desbloqueadas
- HUD muestra arma activa y nivel actual

---

## ÉPICA 4: MECÁNICAS ESPECÍFICAS DE JUGADORES FLOOD
**Prioridad: ALTA - Sprint 2**

### US-008: Sistema de Biomasa y Gestión de Recursos
**Como jugador Flood, quiero gestionar biomasa como recurso principal para realizar acciones especiales.**

**Criterios de Aceptación:**
- Biomasa obtenida al infectar jugadores humanos
- Dos usos principales: clonación, evolución
- Persistencia de biomasa en base de datos
- HUD específico mostrando biomasa disponible
- Sistema de validación antes de gastar biomasa

**Implementación Backend:**
- Campo `biomass` en tabla `flood_game`
- Tracking de biomasa ganada por infecciones
- Persistencia automática de estado

**Implementación Frontend:**
- Clase `FloodPlayer` con gestión de biomasa
- Variable `biomass` para tracking de recursos
- HUD específico para Flood (`FloodHUD`)
- Métodos para gastar biomasa en acciones

**Definición de Terminado:**
- Biomasa se obtiene correctamente por infecciones
- Sistema permite gastar biomasa en acciones válidas
- Estado se persiste en base de datos
- HUD muestra información actualizada

---

### US-009: Sistema de Clonación con Biomasa
**Como jugador Flood, quiero crear clones usando biomasa para expandir mi presencia en el mapa.**

**Criterios de Aceptación:**
- Costo: 1 unidad de biomasa por clon
- Tiempo de canalización: 5 segundos estático
- Clones aparecen con 50% de salud del creador
- Clase `FloodClone` independiente del jugador principal
- Sistema de IA básica para clones

**Implementación Frontend:**
- Clase `FloodClone` extiende funcionalidad base
- Proceso de canalización de 5 segundos
- Sistema de spawn en posición del jugador
- IA básica para movimiento de clones
- Array `clones` para tracking de entidades creadas

**Definición de Terminado:**
- Clones se crean tras canalización exitosa
- Biomasa se consume correctamente
- Clones tienen IA funcional básica
- Sistema limita número máximo de clones

---

### US-010: Sistema de Evolución Flood
**Como jugador Flood, quiero evolucionar mi forma para obtener mejores estadísticas y habilidades.**

**Criterios de Aceptación:**
- Consumo de biomasa para evolucionar
- Cambios visibles en sprite del personaje
- Mejora de estadísticas (salud, daño, velocidad)
- Desbloqueo de nuevas habilidades por nivel
- Sistema de niveles de evolución progresivos

**Implementación Frontend:**
- Método de evolución en `FloodPlayer`
- Sistema de estadísticas escalables
- Sprites diferentes por nivel de evolución
- Desbloqueo progresivo de habilidades

**Definición de Terminado:**
- Evolución consume biomasa apropiadamente
- Estadísticas mejoran visiblemente
- Sprite cambia según nivel de evolución
- Nuevas habilidades se desbloquean correctamente

---

## ÉPICA 5: SISTEMA DE MAPAS Y NAVEGACIÓN
**Prioridad: MEDIA - Sprint 3**

### US-011: Generación de Mapas Procedurales por Chunks
**Como jugador, quiero explorar mapas únicos generados proceduralmente que ofrezcan variedad en cada partida.**

**Criterios de Aceptación:**
- Cada chunk de 16x16 tiles con layout específico
- Generación basada en algoritmos determinísticos
- Almacenamiento persistente en base de datos

**Implementación Backend:**
- Vista `view_layout` con tipos de mapas
- Función `getMapLayout()` con casos específicos por tipo
- Generación determinística de arrays de tiles
- Persistencia en tabla de chunks

**Implementación Frontend:**
- Sistema de renderizado de diferentes tipos de tiles
- Spritesheets específicos para cada tipo de ubicación
- Manejo de tiles especiales (paredes, pisos, obstáculos)

**Definición de Terminado:**
- Mapas se generan consistentemente
- Layouts se almacenan y cargan correctamente
- Variedad visual clara entre tipos de ubicaciones

---

### US-012: Sistema de Minimapa
**Como jugador, quiero un minimapa que me ayude a navegar por las ubicaciones complejas.**

**Criterios de Aceptación:**
- Minimapa de 250x125 píxeles en esquina de pantalla
- Representación simplificada del mapa principal
- Indicador de posición del jugador
- Chunks visibles: 2 alrededor del jugador
- Tile size reducido (6px) para vista general
- Actualización en tiempo real con movimiento

**Implementación Frontend:**
- Configuración específica de minimapa en Engine
- Spritesheet dedicado para minimapa (`minimapsSpriteSheet`)
- Sistema de renderizado paralelo al mapa principal
- Optimización de rendimiento para actualización constante

**Definición de Terminado:**
- Minimapa se renderiza correctamente
- Posición del jugador se actualiza en tiempo real
- Vista es clara y útil para navegación
- No impacta significativamente el rendimiento

---

## ÉPICA 6: INTERFAZ DE USUARIO Y EXPERIENCIA
**Prioridad: MEDIA - Sprint 3-4**

### US-013: Sistema de HUD Específico por Facción
**Como jugador, quiero un HUD personalizado que muestre información relevante según mi tipo de jugador.**

**Criterios de Aceptación:**
- HUD diferenciado para Human vs Flood
- **HUD Humano:**
  - Barra de salud
  - Indicador de oxígeno
  - Arma activa con sprite
  - Nivel y kills actuales
  - Indicador de sprint/cooldown
- **HUD Flood:**
  - Barra de salud
  - Contador de biomasa
  - Indicador de clones activos
  - Nivel de evolución
- Posicionamiento no intrusivo
- Actualización en tiempo real

**Implementación Frontend:**
- Clase `FloodHUD` específica para jugadores Flood
- HUD integrado en `HumanPlayer` class
- Sprites específicos para armas y elementos UI
- Sistema de actualización automática con estado del jugador

**Definición de Terminado:**
- Cada facción tiene HUD apropiado y funcional
- Información se actualiza correctamente
- UI no obstruye gameplay
- Elementos visuales son claros y legibles

---

### US-014: Sistema de Pantallas de Contexto por Facción
**Como jugador, quiero pantallas de introducción específicas que expliquen las mecánicas de mi facción elegida.**

**Criterios de Aceptación:**
- Pantalla `context_screen` para jugadores humanos
- Pantalla `context_flood` para jugadores Flood
- Información específica de controles y mecánicas
- Diseño visual diferenciado por facción
- Navegación fluida hacia el juego principal
- Estilos CSS específicos por facción

**Implementación Frontend:**
- Archivos separados: `context_screen.js` y `context_flood.js`
- Estilos específicos: `context_screen.module.css` y `context_screenFlood.module.css`
- Información de controles y objetivos por facción
- Sistema de navegación hacia pantalla de juego

**Definición de Terminado:**
- Ambas pantallas implementadas y funcionales
- Información es clara y específica por facción
- Navegación funciona correctamente
- Diseño visual es apropiado para cada lado

---

### US-015: Sistema de Navegación y Router
**Como usuario, quiero un sistema de navegación fluido entre diferentes pantallas del juego.**

**Criterios de Aceptación:**
- Router implementado en `router.js`
- Registro de pantallas con `registerScreen()`
- Función `navigate()` para cambios de pantalla
- Manejo de historial del browser
- Pantalla 404 para rutas no encontradas
- Sistema de callbacks post-navegación

**Implementación Frontend:**
- Sistema de router personalizado sin dependencias
- Manejo de `window.history` para navegación
- Sistema de componentes registrables
- Error handling para pantallas inexistentes

**Definición de Terminado:**
- Navegación entre pantallas es fluida
- URLs se actualizan correctamente
- Botón atrás del browser funciona
- Sistema maneja errores gracefully

---

## ÉPICA 7: SISTEMAS DE SOPORTE Y OPTIMIZACIÓN
**Prioridad: BAJA - Sprint 4-5**

### US-016: Sistema de Logging y Debugging
**Como product owner, quiero un sistema de logging robusto para monitorear y debuggear el sistema.**

**Criterios de Aceptación:**
- Logger implementado tanto en backend como frontend
- Niveles de log: info, warn, error, debug
- Logging de eventos críticos (conexiones, errores, gameplay)
- Configuración de debug mode
- Logs estructurados con timestamps
- Separación por módulos/componentes

**Implementación Backend:**
- `utils/logger.js` con configuración por módulo
- Logging de eventos de socket, base de datos, autenticación
- Variables de entorno para nivel de debug

**Implementación Frontend:**
- Logger implementado en `@utils/logger.js`
- Logging de eventos de juego, red, errores de UI
- Console.log estructurado para debugging

**Definición de Terminado:**
- Sistema de logging funcional en ambos lados
- Logs proporcionan información útil para debugging
- Configuración permite ajustar verbosidad
- Performance no se ve afectada significativamente

---

### US-017: Sistema de Variables de Entorno y Configuración
**Como product owner, quiero gestionar configuración mediante variables de entorno para diferentes ambientes.**

**Criterios de Aceptación:**
- Archivo `.env.develop` como template
- Variables para DB, JWT, URLs, puertos
- Configuración diferenciada por ambiente
- Validación de variables requeridas
- Documentación clara de todas las variables

**Implementación Backend:**
- Configuración en `.env.develop`
- Variables: `DB_HOST`, `DB_USER`, `JWT_SECRET`, `PORT`, etc.
- Validación de variables críticas al startup

**Implementación Frontend:**
- Configuración de `BACKEND_URL` para API calls
- Variables de build para diferentes ambientes

**Definición de Terminado:**
- Sistema funciona en desarrollo y producción
- Variables están documentadas
- Configuración es segura (secrets no en código)
- Setup es reproducible

---

### US-018: Sistema de Base de Datos con Vistas Optimizadas
**Como product owner, quiero vistas de base de datos optimizadas para consultas frecuentes del juego.**

**Criterios de Aceptación:**
- Vistas implementadas:
  - `view_game`: Información general de partidas
  - `view_chunk`: Datos optimizados de chunks de mapa
  - `view_layout`: Tipos y configuraciones de mapas
  - `view_node`: Información de nodos de navegación
  - `view_dungeon`: Datos de ubicaciones especiales
  - `view_flood_game`: Datos específicos de jugadores Flood
  - `view_human_game`: Datos específicos de jugadores humanos
- APIs REST para acceder a cada vista
- Optimización de consultas frecuentes
- Documentación OpenAPI/Swagger

**Implementación Backend:**
- Controllers específicos para cada vista
- Endpoints REST documentados con Swagger
- Optimización de queries de MySQL
- Estructuras de datos eficientes

**Definición de Terminado:**
- Todas las vistas implementadas y funcionales
- APIs documentadas y testeadas
- Performance de consultas es adecuada
- Swagger documentation accesible

---

## CRITERIOS DE ACEPTACIÓN GLOBALES DEL PRODUCTO

### Arquitectura y Tecnología
- **Backend:** Node.js, Express, Socket.IO, MySQL, JWT
- **Frontend:** JavaScript, Canvas 2D, Socket.IO client
- **Base de datos:** MySQL con sistema de vistas optimizadas
- **Comunicación:** REST APIs + WebSockets para tiempo real

### Rendimiento
- Motor de juego mantiene 60 FPS estables
- Carga de chunks optimizada (< 100ms por chunk)
- Latencia de red < 200ms en condiciones normales
- Reconexión automática en < 5 segundos

### Escalabilidad
- Soporte para múltiples partidas simultáneas
- Sistema de rooms aisladas por partida
- Base de datos optimizada para consultas concurrentes
- Arquitectura preparada para load balancing

### Seguridad
- Autenticación JWT segura
- Validación de input en todos los endpoints
- Passwords hasheadas con bcrypt
- CORS configurado apropiadamente

### Mantenibilidad
- Código modularizado con imports ES6
- Sistema de aliases para imports limpios
- Logging comprehensivo para debugging
- Documentación API con OpenAPI/Swagger
