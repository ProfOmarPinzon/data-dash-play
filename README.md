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

## Ejecutar sin internet

Descargue este repositorio (**Code → Download ZIP**), descomprímalo y, dentro de la carpeta, ejecute:

```bash
python3 -m http.server 8080
```

Luego abra http://localhost:8080. Abrir `index.html` con doble clic no funciona; hace falta un servidor HTTP.

---

Este repositorio contiene solo la versión compilada del juego y se actualiza automáticamente. La versión publicada aparece en [`version.json`](version.json).
