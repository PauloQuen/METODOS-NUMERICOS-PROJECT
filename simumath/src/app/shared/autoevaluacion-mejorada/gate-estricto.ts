/**
 * GATE ESTRICTO PARA M4 Y M5.
 *
 * Es aditivo: `solution-gate.service.ts` sigue como está, con su política
 * `cualquiera` para M0–M3. Acá la regla es única y no tiene atajo:
 *
 *   varias preguntas + todas correctas + resultado marcado como enviado
 *
 * `comprobado` importa: elegir las opciones correctas sin apretar
 * «Comprobar» no cuenta. `totalPreguntas > 0` evita que un ejercicio sin
 * cuestionario se desbloquee por defecto.
 */

export interface EstadoGateEstricto {
  totalPreguntas: number;
  aciertos: number;
  comprobado: boolean;
  resultadoEnviado: boolean;
}

export function puedeVerSolucionEstricto(estado: EstadoGateEstricto): boolean {
  return (
    estado.totalPreguntas > 0 &&
    estado.comprobado &&
    estado.aciertos === estado.totalPreguntas &&
    estado.resultadoEnviado
  );
}

export const TEXTO_BLOQUEO_ESTRICTO =
  'Respondé bien todas las preguntas y marcá el resultado como enviado para desbloquear la solución.';
