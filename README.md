# Data Dash

Videojuego de plataformas 2D usado como laboratorio de datos en las asignaturas de Analítica de Datos e Inteligencia Artificial.

## ▶ Jugar

**https://profomarpinzon.github.io/data-dash-play/**

Funciona en cualquier navegador moderno, en computador, tableta o celular. No requiere instalación ni cuenta.

## Controles

| Acción | Controles |
|---|---|
| Saltar | `Espacio`, `↑`, `W`, clic o toque en la pantalla |
| Saltos encadenados | Mantener pulsado |
| Pausa / continuar | `Esc` o `P` |
| Reiniciar el intento | `R` |
| Información técnica | `H` |

## Modalidades

| Modalidad | Quién decide cuándo saltar |
|---|---|
| Jugador humano | Usted, con teclado, ratón o pantalla táctil |
| Agente basado en reglas | `RuleAgent`: salta cuando el obstáculo está a cierta distancia. Los umbrales se cambian en la pantalla de configuración |
| Agente personalizado | Un programa en `agents/StudentAgent.js`. Aquí se carga un agente de ejemplo, muy simple |

**Laboratorio de agentes** (pantalla de inicio): hace jugar a un agente, sin gráficos y en segundos, decenas o cientos de niveles (semillas procedurales) para medir y comparar estrategias. Ver [experimentos con agentes](docs/experimentos.md).

**Panel de analítica** (pantalla de inicio): resume las partidas y experimentos guardados en el navegador con indicadores, curva de aprendizaje, dónde y contra qué se choca, a qué distancia se salta y una comparación entre jugadores y agentes. Ver la [práctica de analítica](docs/practica-analitica.md).

**¿Quiere programar su propio agente?** Use el repo plantilla **[data-dash-agente](https://github.com/ProfOmarPinzon/data-dash-agente)** (*Use this template*). Allí edita solo `agents/StudentAgent.js` y lo prueba en su computador, sin instalar Node.js.

## Niveles

| Nivel | Semilla |
|---|---|
| Neón Inicial (fácil) | 1001 |
| Circuito Magenta (intermedio) | 2002 |
| Núcleo Ácido (difícil) | 3003 |
| Procedural | configurable |

Todos los niveles son superables. El juego es determinista: el mismo nivel con las mismas acciones produce siempre el mismo resultado.

## Datos de las partidas (dataset)

Data Dash es también un **laboratorio de datos**. Mientras se juega, el juego registra qué veía el cubo, qué se decidió (saltar o no) y qué pasó después, tanto si juega una persona como un agente. Esos registros forman un dataset listo para analizar con Python, Excel o Power BI.

Los datos se guardan **solo en su navegador**. No se envían a ningún servidor ni contienen datos personales: los identificadores son aleatorios.

- **Descargar datos** (pantalla de inicio o de resultados): un ZIP con todas las partidas guardadas en ese navegador.
- **Borrar datos**: elimina todo lo guardado. Úselo antes de una práctica para empezar con un dataset limpio.

> Descargue sus datos antes de borrar el historial del navegador. En navegación privada se pierden al cerrar la pestaña.

### Qué contiene el ZIP

| Archivo | Una fila es… | Contenido |
|---|---|---|
| `sessions.csv` | Una **sesión**: un nivel jugado desde «Comenzar» hasta salir, o un nivel de un experimento del laboratorio (`experiment_id`) | Quién jugó (`mode`: `human`, `rule` o `student`; nombre, versión y parámetros del agente), nivel, dificultad, semilla, número de intentos, si se completó, mejor progreso y puntuación |
| `attempts.csv` | Un **intento**: de la salida hasta chocar, llegar a la meta, reiniciar o salir | Resultado (`outcome`), duración, distancia, progreso (%), puntuación, saltos, obstáculos superados, contra qué obstáculo chocó y dónde |
| `events.csv` | Un **evento** (salto, aterrizaje, obstáculo superado, choque, cambio de decisión) **o un estado** del cubo tomado 10 veces por segundo | Instante (`tick`, `time_s`), acción (`JUMP`/`WAIT`), posición y velocidad del cubo, distancia y tipo del siguiente obstáculo |
| `experiment.json` | — | Constantes físicas, versión del juego y frecuencia de muestreo |
| `LEEME.txt` | — | Resumen de los archivos |

Las tablas se unen por `session_id` (sesión → intentos) y por `session_id` + `attempt` (intento → eventos). Una sesión tiene varios intentos y cada intento tiene muchas filas de eventos.

### Claves para leerlo bien

- **Tiempo simulado:** el juego avanza en pasos de 1/120 s (`tick`); `time_s = tick / 120`. El juego es determinista: las mismas acciones en el mismo nivel producen exactamente las mismas filas.
- **Distancias en unidades del juego (u):** el cubo mide 1 × 1 u. `next_obstacle_dx` es lo que le falta al cubo para llegar al siguiente obstáculo.
- **`events.csv` tiene dos tipos de fila:** `record_type = event` (algo ocurrió) y `record_type = state` (estado tomado cada 0,1 s). Filtre por esa columna antes de calcular.
- **`restart` y `quit` no son choques:** son intentos que el jugador interrumpió.
- **`player_id` identifica el navegador, no a la persona.**
- **Personas y agentes no son comparables sin más:** separe por `mode`. Un agente determinista repite exactamente el mismo intento.
- **Cada descarga es acumulativa:** si combina varios ZIP del mismo navegador, elimine filas duplicadas.

```python
import pandas as pd
attempts = pd.read_csv("attempts.csv", encoding="utf-8-sig")
events = pd.read_csv("events.csv", encoding="utf-8-sig")
attempts.outcome.value_counts()                    # ¿cómo terminan los intentos?
events[events.event_type == "collision"].event_obstacle_type.value_counts()  # ¿contra qué se choca?
```

En Excel basta con abrir los CSV con doble clic. En Power BI: *Obtener datos → Texto/CSV*.

### Documentación completa del dataset

- **[Guía del dataset](docs/guia-datos.md):** qué representa cada tabla, un intento explicado fila a fila, tipos de variables, precauciones de análisis y preguntas para explorar.
- **[Diccionario de datos](docs/diccionario-datos.md):** cada columna con su tipo, unidad, descripción y ejemplo.
- **[Experimentos con agentes](docs/experimentos.md)** y **[práctica de IA](docs/practica-ia.md):** cómo evaluar y comparar agentes con el laboratorio.
- **[Práctica de analítica](docs/practica-analitica.md):** ETL, visualización e inferencia con estos datos, usando el panel de analítica como referencia.

## Ejecutar sin internet

Descargue este repositorio (**Code → Download ZIP**), descomprímalo y, dentro de la carpeta, ejecute:

```bash
python3 -m http.server 8080
```

Luego abra http://localhost:8080. Abrir `index.html` con doble clic no funciona; hace falta un servidor HTTP.

---

Este repositorio contiene solo la versión compilada del juego y se actualiza automáticamente. La versión publicada aparece en [`version.json`](version.json).
