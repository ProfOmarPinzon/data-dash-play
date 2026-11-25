# Práctica de analítica: del juego al informe

En esta práctica se recorre el ciclo completo de un proyecto de analítica con datos que genera el propio estudiante: **recolección → ETL → análisis descriptivo → visualización → inferencia → comunicación**. Los datos salen de partidas de Data Dash (personas y agentes) y se analizan en Python, Excel o Power BI. El **Panel de analítica** del juego sirve de referencia: cada cifra que muestra se puede reproducir con las fórmulas de esta guía.

Antes de empezar, lea la [guía del dataset](guia-datos.md) (qué representa cada fila) y tenga a mano el [diccionario de datos](diccionario-datos.md).

## Objetivos

Al terminar, el estudiante podrá:

1. Describir el **proceso que genera los datos** y la unidad de observación de cada tabla.
2. Hacer un **ETL** reproducible: cargar, unir, limpiar, derivar variables y documentar cada paso.
3. Calcular **indicadores** y verificarlos contra una fuente independiente (el panel).
4. Elegir la **visualización** adecuada para cada pregunta y construirla con criterio.
5. Formular una hipótesis y contrastarla con una **prueba estadística** adecuada, reconociendo sus supuestos.
6. Comunicar los hallazgos en un **informe** breve, con limitaciones y datos para reproducirlo.

## El panel de analítica

En la pantalla de inicio, **Panel de analítica** resume todo lo guardado en el navegador. También se abre desde el laboratorio con **Analizar en el panel**, ya filtrado por el experimento recién ejecutado.

| Elemento | Qué muestra | Cómo se calcula (`attempts.csv` salvo que se indique) |
|---|---|---|
| Filtros | Modalidad, nivel, experimento | Se filtran las sesiones; intentos y eventos se recortan por `session_id`. Los niveles procedurales se agrupan por dificultad |
| Sesiones | Número de sesiones y cuántas completaron el nivel | Filas de `sessions.csv`; `completed = 1` |
| Intentos | Número de intentos y tiempo de juego simulado | Filas; suma de `duration_s` |
| Intentos completados | Porcentaje de intentos que llegan a la meta | `outcome == "completed"` / intentos |
| Progreso medio | Media del avance por intento | Media de `progress` |
| Duración media, saltos por intento | Medias por intento | Media de `duration_s` y de `jumps` |
| Curva de aprendizaje | Progreso medio según el número de intento dentro de la sesión | Media de `progress` agrupando por `attempt` |
| ¿Dónde se choca? | Histograma del progreso alcanzado al chocar | `progress` de los intentos con `outcome == "collision"`, intervalos de 5 puntos |
| Choques por tipo | Choques por tipo de obstáculo | Conteo de `collision_obstacle_type` |
| Resultado de los intentos | Completado, choque, reinicio, salida | Conteo de `outcome` |
| ¿A qué distancia se salta? | Histogramas de la distancia al siguiente obstáculo al saltar, uno por tipo | `events.csv`: filas `event_type == "jump"`, columna `next_obstacle_dx`, intervalos de 0,25 u entre 0 y 5 u |
| Comparación por jugador o agente | Una fila por persona (modo humano) o por agente + versión + parámetros | Las mismas medias, agrupadas |
| Obstáculos con más choques | Los obstáculos concretos donde más se choca | Conteo de `collision_obstacle_id` |

Cada gráfico tiene **Ver datos** con la tabla de valores, y al pasar el puntero sobre una barra o un punto aparece el valor exacto.

> El panel es una herramienta de **exploración**, no reemplaza el análisis. No hace pruebas estadísticas, no quita duplicados entre descargas y no sabe qué preguntas importan: eso es trabajo del analista.

## Actividades

### 1. Generar los datos (30 min)

Cada grupo produce su propio conjunto de datos, con al menos dos fuentes que se puedan comparar:

- **Partidas humanas:** cada integrante juega el nivel fácil y el intermedio hasta completarlos o hasta 15 intentos. Es importante que haya **varios intentos por sesión**, para la curva de aprendizaje.
- **Agentes:** en el laboratorio, ejecute `RuleAgent` con los umbrales por defecto y con una variante (por ejemplo, `spike = 0,4`) en los tres niveles predefinidos y 30 semillas procedurales de dificultad intermedia, guardando eventos.

Anote los `experiment_id`, abra el panel y haga una captura de los indicadores generales: servirá para verificar el ETL.

Descargue los datos (**Descargar datos**). Si cada integrante juega en su navegador, cada uno descarga su ZIP; el `player_id` (un seudónimo) los distingue.

### 2. ETL (60 min)

```python
import glob, pandas as pd

def leer(nombre):
    # Uno o varios ZIP descomprimidos en carpetas data-dash-*/
    partes = [pd.read_csv(f, encoding="utf-8-sig") for f in glob.glob(f"data-dash-*/{nombre}")]
    return pd.concat(partes, ignore_index=True)

sessions = leer("sessions.csv").drop_duplicates("session_id", keep="last")
attempts = leer("attempts.csv").drop_duplicates(["session_id", "attempt"], keep="last")
events   = leer("events.csv").drop_duplicates()

# Contexto de la sesión en cada intento
att = attempts.merge(
    sessions[["session_id", "player_id", "agent_name", "agent_version", "agent_params", "level_name", "level_source", "difficulty"]],
    on="session_id", how="left", validate="many_to_one",
)
att["quien"] = att.agent_name.fillna("Humano") + " " + att.agent_version.fillna("")
att["completado"] = att.outcome.eq("completed")
```

Puntos de control (escríbalos en el informe):

1. ¿Cuántas filas tenía cada archivo antes y después de quitar duplicados? Las descargas son **acumulativas**: al unir dos ZIP del mismo navegador se repiten filas.
2. ¿Hay intentos sin sesión o sesiones sin intentos? (`validate=` y un `merge` con `indicator=True` ayudan.)
3. ¿Qué intentos terminaron en `restart` o `quit`? No son fracasos del jugador: decida si los excluye y justifíquelo ([guía del dataset §6](guia-datos.md#6-precauciones-al-analizar)).
4. **Verificación:** con los mismos filtros, sus indicadores deben coincidir con los del panel.

```python
def indicadores(a):
    return pd.Series({
        "intentos": len(a),
        "completados_%": 100 * a.completado.mean(),
        "progreso_medio": a.progress.mean(),
        "duracion_media_s": a.duration_s.mean(),
        "saltos_por_intento": a.jumps.mean(),
    })

indicadores(att)                                     # «Todas», sin filtros
indicadores(att[att.experiment_id == "<id>"])        # un experimento
att.groupby("quien").apply(indicadores)              # tabla de comparación
```

Si no coinciden, busque la causa antes de seguir: duplicados, filtros distintos o filas excluidas. Esta comprobación es la práctica habitual de **conciliar** un ETL con otra fuente.

### 3. Análisis descriptivo y visualización (60 min)

Responda cada pregunta con **una** visualización elegida a propósito y una frase de conclusión. Indique por qué eligió ese tipo de gráfico.

| Pregunta | Sugerencia |
|---|---|
| ¿Mejoran las personas con la práctica? | Línea: progreso medio por número de intento, una línea por persona o la media con su intervalo. Compare con la curva del panel |
| ¿Dónde del nivel se falla? | Histograma de `progress` en los choques, por nivel (pequeños múltiples). ¿Hay un «punto difícil»? Identifíquelo con `collision_obstacle_id` |
| ¿Qué obstáculo es más peligroso? | Barras de choques por tipo, **normalizadas** por el número de obstáculos de cada tipo que se intentaron superar |
| ¿Saltan las personas como el agente? | Histogramas de `next_obstacle_dx` en los saltos, persona frente a agente, por tipo de obstáculo |
| ¿Cuánto se tarda en completar un nivel? | Distribución del número de intentos hasta el primer `completed` por sesión |

```python
saltos = events[(events.record_type == "event") & (events.event_type == "jump")].merge(
    sessions[["session_id", "mode"]], on="session_id"
)
saltos.groupby(["mode", "next_obstacle_type"]).next_obstacle_dx.describe()

# Intentos hasta completar: primer intento con outcome == completed en cada sesión
primero = att[att.completado].groupby("session_id").attempt.min()
```

Criterios para las visualizaciones: un solo eje Y por gráfico, ejes con título y unidades, barras que empiezan en cero, la misma escala cuando se comparan paneles, pocos colores y con significado, y la fuente de los datos en el pie.

### 4. Inferencia (45 min)

Plantee **una** hipótesis, elija la prueba y verifique sus supuestos. Ejemplos:

1. **Aprendizaje:** el progreso del intento 5 es mayor que el del intento 1 en la misma persona y nivel → prueba **pareada** (Wilcoxon de rangos con signo) sobre las diferencias.
2. **Personas frente a agente:** la distancia de salto ante pinchos difiere entre personas y `RuleAgent` → **Mann-Whitney** (muestras independientes; las distribuciones no son normales).
3. **Variante del agente:** cambiar `spike` mejora el progreso en los mismos niveles → prueba **pareada** por nivel, como en [experimentos §6](experimentos.md#6-análisis-en-python).

```python
from scipy.stats import wilcoxon, mannwhitneyu

p = att[att.agent_name.isna()].pivot_table(index=["player_id", "level_name"], columns="attempt", values="progress")
d = (p[5] - p[1]).dropna()
print(len(d), d.median(), wilcoxon(d[d != 0]))

h = saltos[(saltos["mode"] == "human") & (saltos.next_obstacle_type == "spike")].next_obstacle_dx
r = saltos[(saltos["mode"] == "rule") & (saltos.next_obstacle_type == "spike")].next_obstacle_dx
print(mannwhitneyu(h, r))
```

Discuta en el informe:

- **Independencia:** los saltos de una misma persona no son independientes entre sí. ¿Cómo afecta eso a la prueba 2? (Alternativa: resumir primero por persona y comparar medianas por persona.)
- **Tamaño del efecto:** además del valor *p*, informe la diferencia (mediana, intervalo por remuestreo).
- **Determinismo del agente:** un agente sin azar repite exactamente el mismo intento; varios intentos de un agente en el mismo nivel no son observaciones nuevas.

### 5. Informe (fuera de clase)

Un tablero (Power BI, Excel o un cuaderno de Python) y un informe breve.

## Entregables

1. Cuaderno o script del ETL, que se ejecute de principio a fin sobre los ZIP entregados.
2. Los ZIP de datos usados (o su enlace) y la lista de `experiment_id`.
3. Tablero con al menos cuatro visualizaciones que respondan preguntas distintas.
4. Informe (2–4 páginas):
   - pregunta y proceso que genera los datos;
   - ETL: decisiones de limpieza, duplicados y exclusiones, y la conciliación con el panel;
   - hallazgos descriptivos con sus visualizaciones;
   - hipótesis, prueba, supuestos, resultado y tamaño del efecto;
   - limitaciones y qué datos adicionales recogería.

## Criterios de evaluación (orientativos)

| Criterio | Peso |
|---|---|
| ETL reproducible, documentado y conciliado con el panel | 25 % |
| Pertinencia y calidad de las visualizaciones | 25 % |
| Inferencia: prueba adecuada, supuestos y tamaño del efecto | 25 % |
| Interpretación, limitaciones y claridad del informe | 25 % |

La rúbrica detallada estará en la guía docente (Fase 6).

## Errores frecuentes

| Error | Consecuencia | Cómo evitarlo |
|---|---|---|
| Unir ZIP sin quitar duplicados | Conteos inflados; no coincide con el panel | `drop_duplicates` por la clave de cada tabla |
| Promediar `events.csv` sin filtrar `record_type` | Mezcla eventos y estados muestreados | Filtrar primero `record_type == "state"` o `"event"` |
| Tratar `restart` y `quit` como choques | Subestima el desempeño | Analizarlos aparte o excluirlos, y decirlo |
| Mezclar niveles de distinta dificultad en una media | Las diferencias reflejan los niveles, no el jugador | Comparar dentro del mismo nivel o estratificar |
| Contar intentos repetidos de un agente determinista como datos nuevos | Falsa precisión | Un intento por nivel para agentes sin azar |
| Concluir causalidad de una correlación | Afirmaciones no sustentadas | Distinguir lo observado de lo que causa; proponer un experimento |
