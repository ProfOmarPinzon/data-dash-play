/**
 * ============================================================================
 *  StudentAgent.js — TU AGENTE PARA DATA DASH
 * ============================================================================
 *
 * Este es el ÚNICO archivo que debes modificar. El juego lo carga cada vez que
 * eliges «Agente personalizado» y pulsas «Comenzar»: guarda los cambios y
 * vuelve a pulsar «Comenzar» para probarlos (no hace falta recargar la página).
 *
 * CONTRATO
 *   - `decide(obs)` se llama 120 veces por segundo y debe devolver
 *     exactamente 'JUMP' (saltar / mantener pulsado) o 'WAIT' (no pulsar).
 *     Solo se puede saltar cuando el cubo está apoyado (obs.player.grounded).
 *   - `reset()` se llama al comenzar cada intento (útil si guardas memoria).
 *   - `name` y `version` aparecen en los datos exportados (sessions.csv):
 *     cambia la versión cada vez que cambies la estrategia.
 *
 * LA OBSERVACIÓN (obs)
 *   obs.tick, obs.time        paso de simulación y segundos simulados
 *   obs.speed                 velocidad horizontal del nivel (u/s)
 *   obs.progress              progreso del intento (0–100 %)
 *   obs.player.x, .y          esquina inferior izquierda del cubo (y = 0: suelo)
 *   obs.player.vy             velocidad vertical (u/s, positiva hacia arriba)
 *   obs.player.grounded       true si está apoyado
 *   obs.obstacles             hasta 3 obstáculos aún no superados, el más
 *                             cercano primero. Cada uno tiene:
 *       .type                 'spike' (pincho), 'block' (bloque) o 'platform'
 *       .dx                   distancia del frente del cubo al obstáculo
 *                             (negativa si el cubo ya está encima)
 *       .y, .top              altura de la base y de la parte superior
 *       .w, .h                ancho y alto
 *   obs.next                  igual a obs.obstacles[0] (null si no quedan)
 *   obs.physics               { tickRate, gravity, jumpVelocity, playerSize }
 *
 *   Unidades: el cubo mide 1 × 1 u. Un salto sube ≈ 2,1 u y dura ≈ 0,43 s.
 *
 * REGLAS
 *   - No uses Math.random() si quieres resultados reproducibles.
 *   - No uses bucles largos dentro de decide(): se ejecuta 120 veces por
 *     segundo y un bucle infinito congela la pestaña.
 *   - Si decide() lanza un error o devuelve otra cosa, la partida se detiene
 *     y el juego muestra el mensaje. Usa console.log() y la consola del
 *     navegador (F12) para depurar.
 * ============================================================================
 */

export default class StudentAgent {
  constructor() {
    this.name = 'StudentAgent';
    this.version = '0.1.0';
    // Parámetros de la estrategia: aparecen en sessions.csv (columna agent_params).
    this.params = { jumpDistance: 0.5 };
  }

  /** Se llama al comenzar cada intento. */
  reset() {}

  /**
   * Decide la acción de este paso.
   * @param {object} obs Observación del juego (ver arriba).
   * @returns {'JUMP'|'WAIT'}
   */
  decide(obs) {
    const next = obs.next;

    // Estrategia de ejemplo (muy simple): saltar cuando el siguiente obstáculo
    // está cerca. Choca pronto: ¡mejórala!
    if (obs.player.grounded && next && next.dx >= 0 && next.dx < this.params.jumpDistance) {
      return 'JUMP';
    }
    return 'WAIT';
  }
}
