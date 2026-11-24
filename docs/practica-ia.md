# Práctica de IA: desarrollo y evaluación de un agente

En esta práctica se diseña, programa y evalúa un **agente** que juega Data Dash. Se trabaja con el repo plantilla `data-dash-agente` (guía del estudiante) y con el **Laboratorio de agentes** del juego ([experimentos](experimentos.md)).

## Objetivos

Al terminar, el estudiante podrá:

1. Describir un agente en términos de **entorno, percepción (observación), decisión y acción**.
2. Programar una **política** a partir de reglas y mejorarla de forma iterativa con evidencia.
3. **Evaluar** un agente de forma reproducible, separando niveles de desarrollo y de evaluación.
4. **Comparar** su agente con una línea base usando métricas y una prueba estadística pareada.
5. (Opcional) **Aprender** parte de la política a partir de datos de partidas humanas.

## El problema como agente de IA

| Elemento | En Data Dash |
|---|---|
| Entorno | El nivel: obstáculos fijos, física determinista, velocidad constante |
| Percepción | La observación `obs`: estado del cubo y los 3 próximos obstáculos |
| Acciones | `JUMP` o `WAIT`, 120 veces por segundo |
| Objetivo | Llegar a la meta; si no, avanzar lo más posible (`progress`) |
| Propiedades | Determinista, totalmente observable en lo cercano, secuencial, un solo agente |

Pregunta para discutir: si el entorno es determinista y conocido, ¿por qué no basta con «memorizar» una secuencia de saltos? (Pista: los niveles procedurales de evaluación son nuevos para el agente.)

## Actividades

### 1. Explorar la observación (30 min)

- Juegue el nivel fácil con la tecla `H` activada y observe `dx` y las cajas de colisión.
- Añada a `decide()` un `console.log` **solo cuando** `obs.next` cambie de tipo, para ver qué recibe el agente.
- Responda: ¿a qué `dx` hay que saltar para superar un pincho a 8,5 u/s? Estímelo con la física: el salto dura 0,43 s y el cubo avanza 3,7 u.

### 2. Línea base (30 min)

- En el laboratorio, ejecute `RuleAgent` con sus umbrales por defecto en **fácil, intermedio y difícil, semillas 1–50**. Anote los `experiment_id`.
- Ejecute también el `StudentAgent` de ejemplo en las mismas semillas.
- Identifique, con la columna «Último choque» o con `collision_obstacle_type`, **qué tipos de obstáculo** hacen fallar a cada agente.

### 3. Iterar sobre el agente (90 min)

Repita este ciclo, cambiando `this.version` en cada vuelta:

1. **Hipótesis:** «Si salto antes ante dos pinchos seguidos, superaré los pinchos dobles».
2. **Cambio** en `StudentAgent.js` (uno cada vez).
3. **Medición** en las semillas de **desarrollo** (1–50) de la dificultad elegida.
4. **Decisión:** se conserva el cambio si mejora el progreso mediano sin empeorar lo demás.

Ideas: umbrales por tipo, mirar `obs.obstacles[1]` y `[2]`, considerar la altura actual (`player.y`), predecir el punto de aterrizaje con `obs.physics` o simular el salto con las ecuaciones del movimiento.

### 4. Evaluación final (30 min)

- Con la versión final **congelada**, ejecute el laboratorio en las semillas de **evaluación** (1001–1100) de cada dificultad, una sola vez.
- Ejecute `RuleAgent` en las mismas semillas.
- Descargue los datos y compare nivel a nivel con el código de [experimentos §6](experimentos.md#6-análisis-en-python): diferencia de progreso, proporción de niveles ganados y prueba de Wilcoxon.

### 5. (Opcional) Aprender de los datos humanos

1. Juegue (o reúna partidas de compañeros) en modo humano y descargue los datos.
2. En `events.csv`, tome las filas `state` con `grounded = 1` y etiquete si en ese paso se decidió saltar: hay una fila `decision` con `action = JUMP` en el mismo `tick` del mismo intento.
3. Entrene un clasificador sencillo (regresión logística o árbol de decisión) con `next_obstacle_dx`, `next_obstacle_type`, `next_obstacle_h` y `player_y`.
4. Traduzca el modelo a reglas o fórmulas en `decide()`. Por ejemplo, el umbral de `dx` en que la probabilidad de saltar supera 0,5 para cada tipo.
5. Evalúe el agente resultante como en la actividad 4. ¿Imitar a las personas es una buena estrategia? ¿Por qué?

## Entregables

1. Enlace al repositorio con `agents/StudentAgent.js` y su historial de commits, una versión por estrategia.
2. Enlace a la página publicada (GitHub Pages) con el agente final.
3. Informe breve (2–4 páginas):
   - descripción de la política final y por qué funciona;
   - tabla de iteraciones: versión, cambio, progreso mediano en desarrollo;
   - evaluación final frente a `RuleAgent` en las semillas 1001–1100: métricas, prueba pareada e interpretación;
   - análisis de fallos: qué obstáculos o patrones siguen sin resolverse;
   - datos para reproducir: versión del juego, semillas y `experiment_id`.

## Criterios de evaluación (orientativos)

| Criterio | Peso |
|---|---|
| Funcionamiento: el agente cumple el contrato y no falla en ningún nivel | 15 % |
| Desempeño en evaluación frente a la línea base | 25 % |
| Proceso iterativo documentado con evidencia (versiones y mediciones) | 25 % |
| Rigor de la evaluación: semillas separadas, comparación pareada, estadística | 25 % |
| Claridad del código y del informe | 10 % |

La rúbrica detallada estará en la guía docente (Fase 6).
