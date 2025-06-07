# **User Stories para Cosmonavt**lean up

## **BASE**

1. **Como jugador, quiero poder moverme en un entorno 2D utilizando WASD/teclas de flecha para navegar por la estación espacial.**  
   * Criterios de aceptación:  
     * El personaje se mueve en las 8 direcciones principales  
     * La velocidad de movimiento es consistente  
     * Las animaciones de movimiento coinciden con la dirección  
2. **Como jugador, quiero un sistema de colisiones que me impida atravesar paredes y objetos sólidos para una experiencia realista.**  
   * Criterios de aceptación:  
     * No es posible atravesar paredes  
     * No es posible atravesar objetos marcados como sólidos  
     * Las colisiones son precisas respecto al sprite visible  
3. **Como jugador, quiero poder hacer sprint con la tecla Shift para moverme más rápido durante un tiempo limitado.**  
   * Criterios de aceptación:  
     * La velocidad aumenta al presionar Shift  
     * Existe un cooldown después de usarlo  
     * Se muestra un indicador visual del estado del sprint  
4. **Como jugador, quiero un HUD que muestre mis estadísticas vitales para conocer mi estado actual.**  
   * Criterios de aceptación:  
     * Muestra barra de salud  
     * Indicadores claros y visibles  
     * No obstruye la visibilidad del juego  
5. **Como jugador, quiero poder interactuar con objetos del entorno usando la tecla E para recoger ítems o activar mecanismos.**  
   * Criterios de aceptación:  
     * Los objetos interactuables tienen un indicador visual  
     * La interacción tiene feedback claro (sonido, animación)  
     * El objeto cambia de estado o desaparece según corresponda  
6. **Como jugador, quiero atacar utilizando el clic izquierdo del ratón para defenderme de enemigos.**  
   * Criterios de aceptación:  
     * El ataque se dirige hacia la posición del cursor  
     * Existe feedback visual del ataque  
     * El ataque causa daño a los enemigos  
7. **Como jugador, quiero poder cambiar entre diferentes ataques/armas con la tecla R para adaptarme a diferentes situaciones.**  
   * Criterios de aceptación:  
     * El cambio es instantáneo  
     * Hay indicación visual del arma/ataque actual  
     * Cada arma/ataque tiene comportamientos distintos  
8. **Como jugador, quiero un menú principal funcional para iniciar el juego, configurar opciones o salir.**  
   * Criterios de aceptación:  
     * Contiene botones de inicio, opciones y salida  
     * La navegación es intuitiva  
     * Los cambios en opciones se guardan correctamente  
9. **Como jugador, quiero un menú de pausa accesible durante el juego para ajustar configuraciones o salir.**  
   * Criterios de aceptación:  
     * Se activa con una tecla específica  
     * Pausa efectivamente el juego  
     * Permite reanudar, configurar opciones o salir  
10. **Como jugador, quiero que el juego tenga un sistema de generación de mapas basado en semilla para tener experiencias únicas en cada partida.**  
    * Criterios de aceptación:  
      * Cada semilla genera un mapa consistente  
      * Los mapas tienen variedad estructural  
      * Es posible compartir semillas para jugar el mismo mapa  
11. **Como jugador, quiero poder comunicarme con otros jugadores mediante un chat básico para coordinar acciones.**  
    * Criterios de aceptación:  
      * Chat accesible con la tecla C  
      * Los mensajes son visibles para todos los jugadores  
      * Existe un historial de mensajes recientes  
12. **Como jugador, quiero crear o unirme a partidas multijugador para jugar con amigos.**  
    * Criterios de aceptación:  
      * Opción para crear sala con código compartible  
      * Opción para unirse mediante código  
      * Indicador de jugadores conectados  
13. **Como jugador, quiero ver una pantalla de resultados al finalizar la partida para conocer mi desempeño.**  
    * Criterios de aceptación:  
      * Muestra estadísticas básicas (tiempo, muertes, objetivos)  
      * Opción para regresar al menú o iniciar nueva partida  
      * Guarda los resultados para comparación futura  
14. **Como jugador, quiero que el juego tenga un sistema de guardado para continuar mi progreso más tarde.**  
    * Criterios de aceptación:  
      * Opción para guardar en el menú de pausa  
      * Carga correctamente todas las variables del juego  
      * Múltiples slots de guardado disponibles  
15. **Como jugador, quiero ajustar las configuraciones de audio para personalizar mi experiencia.**  
    * Criterios de aceptación:  
      * Control independiente de volumen para música y efectos  
      * Opción de silenciar completamente  
      * Los ajustes persisten entre sesiones

## **FLOOD VERSION**

1. **Como jugador Flood, quiero poder infectar humanos para obtener biomasa y conocimiento.**  
   * Criterios de aceptación:  
     * La infección tiene animación propia  
     * Se obtiene biomasa cuantificable  
     * Los científicos proporcionan fragmentos de conocimiento  
2. **Como jugador Flood, quiero gestionar mi recurso de biomasa para curarme, clonarme o evolucionar.**  
   * Criterios de aceptación:  
     * Indicador claro de biomasa disponible  
     * Opciones de uso bien definidas  
     * Los efectos de cada uso son visibles  
3. **Como jugador Flood, quiero crear clones usando biomasa para expandir mi presencia en el mapa.**  
   * Criterios de aceptación:  
     * La creación requiere estar quieto durante 5 segundos  
     * Consume 1 unidad de biomasa  
     * El clon aparece con 50% de la salud del jugador  
4. **Como jugador Flood, quiero evolucionar a formas más poderosas para obtener nuevas habilidades.**  
   * Criterios de aceptación:  
     * Evolución visible en el sprite del personaje  
     * Aumento de estadísticas (daño, salud)  
     * Desbloqueo de nuevas habilidades  
5. **Como jugador Flood, quiero utilizar diferentes tipos de ataques especializados para situaciones diversas.**  
   * Criterios de aceptación:  
     * Vómito ácido funcional (daño por tiempo)  
     * Humo tóxico funcional (ralentización)  
     * Lanzamiento de espinas funcional (daño a distancia)  
6. **Como jugador Flood, quiero recolectar fragmentos de conocimiento de científicos para descubrir la ubicación de la cura.**  
   * Criterios de aceptación:  
     * Indicador de fragmentos recolectados  
     * Diferentes tipos de fragmentos (básicos, clave)  
     * Al completar todos, revela ubicación final  
7. **Como jugador Flood, quiero percibir el entorno con visión mejorada para identificar presas humanas más fácilmente.**  
   * Criterios de aceptación:  
     * Filtro visual especial para la visión Flood  
     * Humanos destacados visualmente  
     * Efectos ambientales adaptados a la percepción Flood  
8. **Como jugador Flood, quiero cooperar con otros jugadores Flood para coordinar estrategias de infección.**  
   * Criterios de aceptación:  
     * Hasta 4 jugadores Flood en una partida  
     * Capacidad de ver a otros Flood en el mapa  
     * Sistema de comunicación entre Floods  
9. **Como jugador Flood, quiero destruir sistemas de purificación para asegurar la expansión de la biomasa.**  
   * Criterios de aceptación:  
     * Sistemas claramente identificables  
     * Mecánica de destrucción establecida  
     * Efectos visibles en el entorno tras la destrucción  
10. **Como jugador Flood, quiero que mis clones persigan objetivos según mis órdenes para optimizar la estrategia.**  
    * Criterios de aceptación:  
      * Sistema básico de órdenes (atacar, seguir, explorar)  
      * Los clones responden correctamente  
      * Indicador visual de órdenes activas

## **HUMAN VERSION**

1. **Como jugador humano, quiero gestionar recursos críticos como oxígeno, hambre y sed para sobrevivir.**  
   * Criterios de aceptación:  
     * Barras de estado para cada recurso  
     * Disminución gradual realista  
     * Efectos negativos cuando están bajos  
2. **Como jugador humano, quiero recolectar y usar consumibles para restaurar mis estadísticas vitales.**  
   * Criterios de aceptación:  
     * Variedad de consumibles con efectos distintos  
     * Animación de uso  
     * Efectos inmediatos en las estadísticas  
3. **Como jugador humano, quiero recolectar fragmentos de datos para descubrir la historia y avanzar en la trama.**  
   * Criterios de aceptación:  
     * Fragmentos visibles en el entorno  
     * Registro de fragmentos recolectados  
     * Desbloqueo de nueva información o ubicaciones  
4. **Como jugador humano, quiero acceder a un diario de conocimientos para revisar la información descubierta.**  
   * Criterios de aceptación:  
     * Interfaz organizada por categorías  
     * Texto legible y completo  
     * Capacidad de marcar entradas importantes  
5. **Como jugador humano, quiero encontrar y equipar diferentes armas para defenderme del Flood.**  
   * Criterios de aceptación:  
     * Variedad de armas con estadísticas diferentes  
     * Sistema de inventario para gestionar armas  
     * Cambio rápido entre armas equipadas  
6. **Como jugador humano, quiero curarme usando botiquines cuando estoy herido.**  
   * Criterios de aceptación:  
     * Tecla Q para usar botiquín  
     * Animación de uso  
     * Restauración de salud visible  
7. **Como jugador humano, quiero navegar entre diferentes ubicaciones espaciales para explorar el mundo del juego.**  
   * Criterios de aceptación:  
     * Mapa de navegación espacial  
     * Selección de destinos desbloqueados  
     * Animación de viaje entre ubicaciones  
8. **Como jugador humano, quiero encontrar componentes para construir la cura contra el Flood.**  
   * Criterios de aceptación:  
     * Componentes claramente identificables  
     * Registro de componentes recolectados  
     * Interfaz para ver progreso hacia la cura completa  
9. **Como jugador humano, quiero encontrarme con otros supervivientes para cooperar o competir por recursos.**  
   * Criterios de aceptación:  
     * Encuentros claramente indicados  
     * Opciones de interacción múltiples  
     * Sistema de reputación funcional  
10. **Como jugador humano, quiero hackear sistemas de la estación para acceder a áreas restringidas.**  
    * Criterios de aceptación:  
      * Mini-juego de hackeo funcional  
      * Recompensas acordes al riesgo  
      * Diferentes niveles de dificultad
