# Experimentos con agentes

Cómo comparar agentes de forma **justa y reproducible** con el **Laboratorio de agentes** del juego. El diseño técnico está en el ADR-0010; el significado de cada columna, en el [diccionario de datos](diccionario-datos.md).

## 1. Qué hace el laboratorio

En la pantalla de inicio, **Laboratorio de agentes** hace jugar a un agente (`RuleAgent` o tu `StudentAgent`) en muchos niveles, sin gráficos y en segundos:

| Opción | Significado |
|---|---|
| Agente | `RuleAgent` (con sus tres umbrales) o el agente de `agents/StudentAgent.js` |
| Niveles predefinidos | Fácil (semilla 1001), intermedio (2002), difícil (3003) |
| Niveles procedurales | `N` niveles con semillas consecutivas desde la primera, en la dificultad elegida |
| Intentos por nivel | Cuántas veces juega cada nivel (el agente recibe `reset()` antes de cada intento) |
| Guardar eventos y estados | Si se desactiva, no se guarda `events.csv` (experimentos más ligeros) |

Al terminar se muestran una tabla por nivel y un resumen. La tabla **Comparación de experimentos** reúne los experimentos de la pestaña. Cada nivel se guarda como una sesión con el mismo `experiment_id`. **Descargar este experimento** entrega solo sus filas; **Descargar todos los datos**, todo lo guardado en el navegador.

## 2. Fuentes de variación

El motor es determinista: no hay azar en la física. Un resultado depende solo de:

| Factor | Columnas | Comentario |
|---|---|---|
| Nivel | `level_id`, `seed`, `difficulty` | Misma semilla y dificultad ⇒ mismo nivel, obstáculo por obstáculo |
| Agente | `agent_name`, `agent_version`, `agent_params` | Cambiar la estrategia o los parámetros cambia el resultado |
| Motor | `engine_version` | Debe ser igual en todo lo que se compare |
| Intento | `attempt` | Solo importa si el agente usa azar o memoria entre intentos |

**Consecuencia clave:** un agente sin azar ni memoria juega **exactamente igual** cada intento del mismo nivel. Repetir intentos no aporta información: la variación útil viene de **jugar más niveles distintos** (más semillas).

## 3. Comparación justa: mismos niveles para todos

Para comparar dos agentes, ambos deben jugar **las mismas semillas** con la misma dificultad. Así cada nivel es una pareja de observaciones (diseño **pareado**) y la diferencia se debe al agente, no a que a uno le tocaran niveles más fáciles.

1. Elija un conjunto de semillas y anótelo, por ejemplo intermedio, semillas 1 a 50.
2. Ejecute el experimento con el agente A y luego con el agente B, sin cambiar los niveles.
3. Compare nivel a nivel (`seed`) usando el `experiment_id` de cada uno.

### Desarrollo frente a evaluación

Si ajusta su agente mirando siempre las mismas semillas, terminará adaptándolo a esos niveles en concreto (**sobreajuste**). Separe:

| Conjunto | Semillas sugeridas | Uso |
|---|---|---|
| Desarrollo | 1–50 | Probar ideas y ajustar parámetros tantas veces como quiera |
| Evaluación | 1001–1100 | Medir **una sola vez** la versión final; no ajuste nada después de mirar este resultado |

Es la misma idea que separar los datos de entrenamiento y de prueba en aprendizaje automático.

## 4. Métricas

| Métrica | Cálculo | Cuándo usarla |
|---|---|---|
| Tasa de niveles completados | `sessions.completed` medio | Objetivo final; poco informativa si casi nunca se completa |
| Progreso medio y mediano | `attempts.progress` | Distingue agentes que no completan; la mediana es robusta a niveles atípicos |
| Puntuación media | `attempts.score` | Combina distancia y obstáculos (está correlacionada con el progreso) |
| Saltos por intento | `attempts.jumps` | Eficiencia o «nerviosismo» del agente |
| Choques por tipo | `attempts.collision_obstacle_type` | Dónde falla el agente: guía la siguiente mejora |

Informe siempre el **conjunto de niveles** (dificultad y rango de semillas) junto a la métrica.

## 5. Línea base de referencia

Resultados del simulador con 50 semillas procedurales (1 a 50) por dificultad y un intento por nivel (calculados con la versión 0.4.0 del juego y verificados de nuevo, sin cambios, en la 1.0.0):

| Agente | Fácil: completados · progreso medio | Intermedio | Difícil |
|---|---|---|---|
| `RuleAgent` 1.0.0, umbrales por defecto (0,15 · 2,5 · 1,3) | 50/50 · 100 % | 0/50 · 13,2 % | 0/50 · 6,3 % |
| `StudentAgent` 0.1.0 de ejemplo (`jumpDistance = 0,5`) | 0/50 · 12,4 % | 0/50 · 6,0 % | 0/50 · 4,2 % |

Subir el umbral de pincho de `RuleAgent` de 0,15 a 0,3 no cambia nada en estos 150 niveles: no todos los parámetros importan, y comprobarlo con datos forma parte del análisis.

## 6. Análisis en Python

```python
import pandas as pd

sessions = pd.read_csv("sessions.csv", encoding="utf-8-sig")
attempts = pd.read_csv("attempts.csv", encoding="utf-8-sig")

lab = attempts[attempts.experiment_id.notna()].merge(
    sessions[["session_id", "agent_name", "agent_version", "difficulty", "completed"]], on="session_id"
)
lab["agente"] = lab.agent_name + " " + lab.agent_version

# Resumen por experimento
lab.groupby(["experiment_id", "agente"]).agg(
    niveles=("seed", "nunique"), completados=("completed", "sum"),
    progreso_medio=("progress", "mean"), progreso_mediano=("progress", "median"),
)

# Comparación pareada: mismo nivel (dificultad + semilla), dos experimentos
A, B = "<experiment_id de A>", "<experiment_id de B>"
par = (lab[lab.experiment_id.isin([A, B])]
       .pivot_table(index=["difficulty", "seed"], columns="experiment_id", values="progress"))
dif = (par[B] - par[A]).dropna()
print(dif.describe())                         # ¿cuánto mejora B, nivel a nivel?
print((dif > 0).mean(), (dif < 0).mean())     # proporción de niveles en que gana cada uno

from scipy.stats import wilcoxon              # prueba pareada no paramétrica
print(wilcoxon(dif[dif != 0]))
```

Con pocos niveles o diferencias pequeñas, acompañe la prueba con un **intervalo de confianza por remuestreo (bootstrap)** de la diferencia media:

```python
import numpy as np
rng = np.random.default_rng(0)
boot = [rng.choice(dif, size=len(dif), replace=True).mean() for _ in range(5000)]
print(np.percentile(boot, [2.5, 97.5]))
```

## 7. Reproducir un experimento

Con la misma versión del juego (`engine_version`), el mismo agente (`agent_version`, `agent_params`) y las mismas semillas, el laboratorio produce **las mismas filas** salvo los identificadores (`session_id`, `experiment_id`) y las fechas reales (`started_at`, `ended_at`). Para que otra persona pueda repetir su experimento, informe:

- versión del juego (`version.json` del sitio) y `engine_version`;
- agente, versión y parámetros (o el archivo `StudentAgent.js`);
- dificultad, semilla inicial, número de niveles e intentos por nivel.

## 8. Errores frecuentes

| Error | Consecuencia | Cómo evitarlo |
|---|---|---|
| Comparar agentes en semillas distintas | La diferencia puede deberse a los niveles | Use las mismas semillas (diseño pareado) |
| Contar intentos repetidos de un agente determinista como datos independientes | Se infla artificialmente el tamaño de la muestra | Un intento por nivel; aumente el número de semillas |
| Ajustar el agente mirando las semillas de evaluación | Resultados optimistas que no se repiten en niveles nuevos | Separe desarrollo y evaluación |
| Mezclar personas y agentes | Comparación injusta: las personas aprenden y se cansan | Filtre por `mode` y `experiment_id` |
| Olvidar cambiar `this.version` del agente | No se distinguen las versiones en los datos | Cambie la versión en cada estrategia nueva |
| Mezclar versiones del juego | La física o los niveles pueden haber cambiado | Compruebe `engine_version` y `data_format_version` |
