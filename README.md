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

## Niveles

| Nivel | Semilla |
|---|---|
| Neón Inicial (fácil) | 1001 |
| Circuito Magenta (intermedio) | 2002 |
| Núcleo Ácido (difícil) | 3003 |
| Procedural | configurable |

Todos los niveles son superables. El juego es determinista: el mismo nivel con las mismas acciones produce siempre el mismo resultado.

## Datos de las partidas

El juego registra cada intento: saltos, aterrizajes, choques, obstáculos superados y el estado del cubo 10 veces por segundo. Los datos se guardan **solo en su navegador**; no se envían a ningún servidor ni contienen datos personales.

- **Descargar datos** (pantalla de inicio o de resultados): un ZIP con `sessions.csv`, `attempts.csv`, `events.csv` y `experiment.json`. Incluye todas las partidas guardadas en ese navegador.
- **Borrar datos**: elimina todo lo guardado.

Para abrir los CSV en Python: `pd.read_csv("events.csv", encoding="utf-8-sig")`. En Excel basta con abrirlos con doble clic. El archivo `LEEME.txt` del ZIP describe cada tabla.

> Descargue sus datos antes de borrar el historial del navegador. En navegación privada se pierden al cerrar la pestaña.

## Ejecutar sin internet

Descargue este repositorio (**Code → Download ZIP**), descomprímalo y, dentro de la carpeta, ejecute:

```bash
python3 -m http.server 8080
```

Luego abra http://localhost:8080. Abrir `index.html` con doble clic no funciona; hace falta un servidor HTTP.

---

Este repositorio contiene solo la versión compilada del juego y se actualiza automáticamente. La versión publicada aparece en [`version.json`](version.json).
