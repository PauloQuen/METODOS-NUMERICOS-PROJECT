import { EJERCICIOS_SIMPSON } from '../../components/modulo4/tipos/newton-cotes/simpson/simpson.contenido';
import { EJERCICIOS_TRAPECIO } from '../../components/modulo4/tipos/newton-cotes/trapecio/trapecio.contenido';
import { EJERCICIOS_EULER } from '../../components/modulo5/tipos/edo-clasicos/euler/euler.contenido';
import { EJERCICIOS_RK4 } from '../../components/modulo5/tipos/edo-clasicos/rk4/rk4.contenido';

/**
 * Guardia de "varias preguntas como en el Módulo 3".
 *
 * Si alguien vuelve a dejar un solo `q1` por ejercicio, este spec falla.
 * También comprueba que `correcta` exista entre las opciones: una pregunta
 * sin respuesta válida dejaría el gate estricto abierto para siempre.
 */

interface PreguntaPlana {
  id: string;
  tipo: string;
  enunciado: string;
  opciones: { id: string; texto: string }[];
  correcta: string;
  explicacion: string;
}

interface EjercicioPlano {
  id: string;
  cuestionario?: PreguntaPlana[];
}

const GRUPOS: [string, EjercicioPlano[]][] = [
  ['trapecio', EJERCICIOS_TRAPECIO as unknown as EjercicioPlano[]],
  ['simpson', EJERCICIOS_SIMPSON as unknown as EjercicioPlano[]],
  ['euler', EJERCICIOS_EULER as unknown as EjercicioPlano[]],
  ['rk4', EJERCICIOS_RK4 as unknown as EjercicioPlano[]],
];

describe('cuestionarios de la autoevaluación de M4 y M5', () => {
  for (const [metodo, ejercicios] of GRUPOS) {
    describe(metodo, () => {
      it('cada ejercicio trae varias preguntas, con ids distintos', () => {
        for (const ejercicio of ejercicios) {
          const cuestionario = ejercicio.cuestionario ?? [];
          expect(cuestionario.length)
            .withContext(`${ejercicio.id}: se esperan varias preguntas`)
            .toBeGreaterThanOrEqual(2);
          const ids = cuestionario.map((p) => p.id);
          expect(new Set(ids).size)
            .withContext(`${ejercicio.id}: ids de pregunta repetidos`)
            .toBe(ids.length);
        }
      });

      it('todas las preguntas tienen enunciado, opciones, respuesta válida y explicación', () => {
        const problemas: string[] = [];
        for (const ejercicio of ejercicios) {
          for (const pregunta of ejercicio.cuestionario ?? []) {
            const etiqueta = `${ejercicio.id}/${pregunta.id}`;
            if (!pregunta.enunciado?.trim()) problemas.push(`${etiqueta}: sin enunciado`);
            if (!pregunta.explicacion?.trim()) problemas.push(`${etiqueta}: sin explicación`);
            const ids = (pregunta.opciones ?? []).map((o) => o.id);
            if (ids.length < 2) problemas.push(`${etiqueta}: menos de 2 opciones`);
            if (new Set(ids).size !== ids.length) problemas.push(`${etiqueta}: opciones repetidas`);
            if (!ids.includes(pregunta.correcta)) {
              problemas.push(`${etiqueta}: correcta "${pregunta.correcta}" no está en las opciones`);
            }
            if (pregunta.tipo === 'verdadero-falso' && ids.join(',') !== 'v,f') {
              problemas.push(`${etiqueta}: verdadero/falso debe usar v y f`);
            }
            if ((pregunta.opciones ?? []).some((o) => !o.texto?.trim())) {
              problemas.push(`${etiqueta}: opción sin texto`);
            }
          }
        }
        expect(problemas).toEqual([]);
      });
    });
  }
});
