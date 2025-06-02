# Requerimientos para Cosmonavt: The Flood Edition

**Niveles de relevancia**:

- `[Crítico]`: Esencial para un prototipo jugable.
- `[Importante]`: Ideal para un segundo prototipo más completo.
- `[Opcional]`: Útil después del prototipo; se puede implementar más adelante.

## Funcionales

### Jugabilidad Principal

- `[Crítico]` Sistema de absorción de conocimiento: Narrativa que avanza mediante la eliminación de jugadores humanos clave que poseen fragmentos de información sobre la cura.
- `[Crítico]` Exploración procedural de mapas: Entornos generados con semilla donde el Flood busca fragmentos de información mientras enfrenta jugadores humanos.
- `[Crítico]` Sistema de biomasa: Acumulación y gasto de biomasa para evolucionar, con efectos directos en el gameplay.
- `[Crítico]` Duplicación con cooldown: Capacidad para crear un duplicado controlable al eliminar humanos, con tiempo de espera entre usos.
- `[Importante]` Sistema de evolución del Flood: Árbol de mutaciones con tres ramas principales (Depredador, Infiltrador, Adaptativo).
- `[Importante]` Gestión de riesgo-recompensa: Decisión entre atacar jugadores humanos fuertemente equipados o buscar rutas alternativas.
- `[Opcional]` Eventos de resistencia humana: Acciones coordinadas de jugadores humanos como purgas, cuarentenas y defensas que dificultan la búsqueda de la cura.
- `[Opcional]` Finales múltiples: Variaciones narrativas basadas en si el Flood encontró la cura primero o la cantidad de conocimiento absorbido.
- `[Importante]` Progresión entre sesiones: Conservación de evoluciones básicas y conocimiento absorbido entre partidas.
- `[Importante]` Sentidos mejorados del Flood: Visión ampliada (180°) con opciones para detectar jugadores humanos a través de obstáculos según evoluciones.
- `[Importante]` Alternancia entre duplicados: Sistema para cambiar el control entre diferentes unidades Flood creadas mediante duplicación.

### IA y Jugadores Humanos

- `[Crítico]` Sistema de interacción PvP: Mecánicas para que los Flood detecten, acechan e infecten a jugadores humanos.
- `[Crítico]` Escalada de dificultad: Jugadores humanos con mejor equipamiento y coordinación conforme avanza la partida.
- `[Importante]` Jugadores científicos prioritarios: Jugadores humanos con rol científico que proporcionan fragmentos cruciales al ser absorbidos.
- `[Importante]` Progreso de investigación humana: Los jugadores científicos avanzan gradualmente hacia completar la cura si no son eliminados.

### Multijugador

- `[Crítico]` Enfrentamiento asimétrico: Flood vs. jugadores humanos con objetivos y mecánicas completamente diferentes.
- `[Crítico]` Compartir información: Capacidad para transmitir ubicaciones y pistas descubiertas a otros jugadores Flood.
- `[Importante]` Especialización complementaria: Distintos jugadores Flood pueden evolucionar en diferentes ramas para cubrir más estrategias.
- `[Importante]` Comunicación entre Floods: Chat de texto o comandos rápidos entre jugadores del mismo equipo.
- `[Opcional]` Asignación de objetivos: Sistema para dividir áreas de búsqueda entre jugadores Flood.
- `[Opcional]` Ayuda mutua: Posibilidad de asistir a otros jugadores Flood en situaciones peligrosas.
- `[Opcional]` Resumen de rendimiento: Estadísticas de fragmentos encontrados, humanos convertidos y áreas exploradas al final de la partida.

### Mundo y Ambientación

- `[Crítico]` Ecosistemas diversos: Al menos dos biomas con diferentes desafíos (estación espacial, nave, colonia minera).
- `[Crítico]` Transformación visual: El personaje Flood cambia su apariencia según evoluciones seleccionadas.
- `[Importante]` Regeneración por semilla: Mostrar, guardar y reutilizar semillas de mapa para desafíos específicos.
- `[Opcional]` Zonas de alta biomasa: Lugares con alta concentración de recursos orgánicos para evolucionar más rápido.
- `[Opcional]` Entornos hostiles: Zonas con radiación, descontaminación o defensas automatizadas que afectan al Flood.

### Personalización

- `[Importante]` Evoluciones visuales: Cambios en la apariencia del Flood según su rama evolutiva.
- `[Importante]` Sistema de mutaciones: Diferentes tipos de evoluciones distribuidas en las tres ramas principales.
- `[Importante]` Habilidades especiales desbloqueables: Capacidades únicas que requieren biomasa para activarse.
- `[Opcional]` Formas Flood alternativas: Variantes estéticas o funcionales basadas en logros anteriores.

### Interfaces y Feedback

- `[Crítico]` HUD orgánico e inmersivo: Biomasa, cooldown de duplicación, y fragmentos de conocimiento encontrados.
- `[Crítico]` Registro de información absorbida: Visualización de los fragmentos sobre la cura obtenidos.
- `[Importante]` Evoluciones persistentes: Conservación de ciertas mutaciones básicas entre sesiones.
- `[Opcional]` Tabla de progreso: Comparativa de fragmentos encontrados y tiempo al finalizar partida.
- `[Importante]` Indicadores sensoriales del Flood: Feedback visual y sonoro único para la detección de jugadores humanos, conocimiento cercano o evoluciones disponibles.

---

## No Funcionales

### Rendimiento

- `[Crítico]` Gestión eficiente de duplicados: El sistema debe soportar la alternancia fluida entre unidades Flood duplicadas.
- `[Crítico]` Soporte para transformaciones visuales: El motor debe manejar los cambios de apariencia según evoluciones sin caídas de rendimiento.
- `[Crítico]` Multijugador PvP sincronizado: Las interacciones entre jugadores Flood y humanos deben mantener latencia por debajo de 100 ms.
- `[Importante]` Optimización de partículas y efectos: Los efectos de absorción, duplicación y evolución deben ser visualmente impactantes sin afectar el rendimiento.
- `[Importante]` Consumo eficiente en gestión de múltiples unidades: El sistema de duplicación debe escalar sin problemas de memoria.

### Escalabilidad y Red

- `[Importante]` Soporte para múltiples jugadores: El servidor debe gestionar varios jugadores Flood y humanos interactuando simultáneamente.
- `[Crítico]` Persistencia de evoluciones: Las mutaciones y conocimientos absorbidos deben guardarse entre sesiones.
- `[Importante]` Sincronización de jugador vs jugador: WebSocket optimizado para actualizar el estado de todos los jugadores en tiempo real.
- `[Importante]` Gestión de múltiples partidas: Soporte para varias partidas con diferentes configuraciones de dificultad o semilla.
- `[Opcional]` Recuperación de partida: Sistema para reconectar a una sesión en caso de desconexión temporal.

### Seguridad

- `[Crítico]` Validación de interacciones PvP: Prevención de cheats en las interacciones entre Flood y humanos mediante verificación en servidor.
- `[Importante]` Integridad de la biomasa: Control servidor-lado de los recursos acumulados para prevenir cheats.
- `[Crítico]` Control de acceso a partidas: Sistema de invitación para sesiones privadas y matchmaking para públicas.
- `[Opcional]` Anti-cheating: Sistema para detectar y prevenir comportamientos no permitidos.

### Experiencia de Usuario

- `[Crítico]` Diseño biomórfico del HUD: Interfaz orgánica que transmita la sensación de ser un organismo alienígena.
- `[Importante]` Feedback sensorial único: Sistema visual y sonoro que comunique la percepción alienígena del entorno y otros jugadores.
- `[Importante]` Accesibilidad: Configuración de controles, ayudas visuales para gestión de duplicados, indicaciones claras.
- `[Importante]` Satisfacción táctil: Animaciones y efectos sonoros gratificantes al absorber conocimiento, duplicarse o evolucionar.
- `[Opcional]` Tutorial de absorción: Guía inicial integrada sobre mecánicas básicas del Flood.

### Mantenibilidad

- `[Crítico]` Arquitectura modular: Separación clara entre sistemas de infección, duplicación, evolución y recolección de conocimiento.
- `[Importante]` Componentes reutilizables: Mecánicas compartidas entre diferentes tipos de evoluciones.
- `[Importante]` Registro de actividad: Logs detallados de interacciones PvP y conocimiento absorbido.
- `[Opcional]` Soporte para nuevas evoluciones: Estructura que facilite añadir nuevas habilidades o mutaciones.
- `[Opcional]` Documentación biológica: Comentarios y estándares que describan el comportamiento y lógica de las mecánicas Flood.

### Balance y Juego Justo

- `[Crítico]` Equilibrio Flood vs humanos: Las mecánicas deben garantizar que ambos equipos tengan oportunidades justas de victoria.
- `[Importante]` Sistema de matchmaking: Emparejamiento que equilibre la cantidad y experiencia de jugadores en cada equipo.
- `[Importante]` Mecanismos anti-frustración: Elementos que eviten situaciones donde un equipo no tenga oportunidad de recuperarse.
- `[Opcional]` Datos de balance: Recopilación y análisis de estadísticas para ajustar el balance entre facciones post-lanzamiento.