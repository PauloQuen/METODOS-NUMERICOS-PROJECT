import katex from 'katex';
import { METODOS_MODULO4 } from '../registro-modulo4';
import { simpsonCompuesto } from '../tipos/newton-cotes/simpson/simpson.algoritmo';
import { trapecioCompuesto } from '../tipos/newton-cotes/trapecio/trapecio.algoritmo';
import { FuncionEvaluable } from '../../../shared/domain/numerico/evaluador-funciones';
import type { DatosModulo4 } from '../modelos/modulo4.model';
import {
  EJEMPLOS_SIMPSON,
  EJERCICIOS_SIMPSON,
  TEORIA_SIMPSON,
} from '../tipos/newton-cotes/simpson/simpson.contenido';
import {
  EJEMPLOS_TRAPECIO,
  EJERCICIOS_TRAPECIO,
  TEORIA_TRAPECIO,
} from '../tipos/newton-cotes/trapecio/trapecio.contenido';

/**
 * Red de seguridad del CONTENIDO del Módulo 4.
 *
 * Los TeX del trapecio se escribieron con escapes simples en un literal de
 * TypeScript: `\frac` llegaba a KaTeX como carácter de salto de página y
 * `\right` como retorno de carro. Como `MathFormula` usa
 * `throwOnError: false`, no rompía la pantalla: mostraba la fórmula mal
 * renderizada. Acá todo TeX se compila con errores activados y se revisa
 * que no haya caracteres de control.
 */

const FUENTES: [string, unknown][] = [
  ['Trapecio/teoria', TEORIA_TRAPECIO],
  ...EJEMPLOS_TRAPECIO.map((e) => [`Trapecio/ejemplo/${e.id}`, e] as [string, unknown]),
  ...EJERCICIOS_TRAPECIO.map((e) => [`Trapecio/ejercicio/${e.id}`, e] as [string, unknown]),
  ['Simpson/teoria', TEORIA_SIMPSON],
  ...EJEMPLOS_SIMPSON.map((e) => [`Simpson/ejemplo/${e.id}`, e] as [string, unknown]),
  ...EJERCICIOS_SIMPSON.map((e) => [`Simpson/ejercicio/${e.id}`, e] as [string, unknown]),
  ['Registro', METODOS_MODULO4],
];

describe('contenido del Módulo 4', () => {
  it('cada fórmula Unicode tiene su equivalente TeX', () => {
    const pares = FUENTES.flatMap(([id, fuente]) => formulasTex(fuente, id));
    // 5 del trapecio + 5 de Simpson + 2 del registro.
    expect(pares.length).toBe(12);
  });

  it('ningún TeX trae caracteres de control de un escape mal duplicado', () => {
    const rotos: string[] = [];
    for (const [id, tex] of FUENTES.flatMap(([id, fuente]) => formulasTex(fuente, id))) {
      if (/[\u0000-\u001f]/.test(tex)) rotos.push(`${id}: ${JSON.stringify(tex)}`);
    }
    expect(rotos).toEqual([]);
  });

  it('renderiza con KaTeX las 12 fórmulas del módulo', () => {
    const errores: string[] = [];
    for (const [id, tex] of FUENTES.flatMap(([id, fuente]) => formulasTex(fuente, id))) {
      try {
        katex.renderToString(tex, {
          displayMode: true,
          throwOnError: true,
          strict: 'ignore',
          trust: false,
          output: 'html',
        });
      } catch (error) {
        errores.push(`${id}: ${tex} → ${(error as Error).message}`);
      }
    }
    expect(errores).toEqual([]);
  });

  it('cada valor escrito coincide con el recalculado por el motor', () => {
    for (const [id, metodo, datos] of CALCULOS) {
      const r = correr(datos, metodo);
      expect(r.mensaje).withContext(id).toBeUndefined();
      expect(Math.abs(r.integral - VALORES[id]))
        .withContext(id)
        .toBeLessThan(1e-6 * Math.max(1, Math.abs(VALORES[id])));
    }
  });

  it('los dos errores corregidos coinciden con los motores, no con la regla error/4', () => {
    const fuerza = trapecioCompuesto({
      f: (x) => 200 / (x + 1),
      a: 0,
      b: 4,
      n: 16,
      valorExacto: 200 * Math.log(5),
    });
    expect(fuerza.errorAbs!).toBeCloseTo(0.9937, 4);
    expect(TEORIA_TRAPECIO.ejemploCasuistica.criterio).toContain('0.9937 J');

    const seno = trapecioCompuesto({ f: Math.sin, a: 0, b: Math.PI, n: 8, valorExacto: 2 });
    expect(seno.errorAbs!).toBeCloseTo(0.02577, 5);
    expect(seno.errorRel!).toBeCloseTo(1.29, 2);
    const ejercicio = EJERCICIOS_TRAPECIO.find((e) => e.id === 'tr-ej-cas-1')!;
    expect(ejercicio.criterio).toContain('0.02577 (1.29 %)');
  });

  it('no deja el caret literal de la integral del seno en la prosa', () => {
    const conCaret: string[] = [];
    const recorrer = (valor: unknown, ruta: string): void => {
      if (typeof valor === 'string') {
        if (valor.includes('∫₀^π')) conCaret.push(`${ruta}: ${valor}`);
        return;
      }
      if (Array.isArray(valor)) {
        valor.forEach((v, i) => recorrer(v, `${ruta}[${i}]`));
        return;
      }
      if (valor && typeof valor === 'object') {
        for (const [clave, v] of Object.entries(valor)) recorrer(v, `${ruta}.${clave}`);
      }
    };
    FUENTES.forEach(([id, fuente]) => recorrer(fuente, id));
    expect(conCaret).toEqual([]);
  });

  it('Simpson acierta cualquier cúbica con cualquier n par, sin refinar', () => {
    for (const n of [2, 4, 6, 20]) {
      const r = simpsonCompuesto({ f: (x) => x ** 3, a: 0, b: 3, n, valorExacto: 81 / 4 });
      expect(Math.abs(r.integral - 81 / 4)).withContext(`n=${n}`).toBeLessThan(1e-9);
    }
    expect(TEORIA_SIMPSON.fundamento).toContain('con cualquier n par');
    expect(TEORIA_SIMPSON.fundamento).not.toContain('suficientemente fino');
  });
});

/** Valores de control, recalculados con los motores antes de escribirlos acá. */
const VALORES: Record<string, number> = {
  'tr-num-1': 0.34375,
  'tr-cas-1': 325.7936508,
  'tr-num-2': 0.6970238,
  'tr-cas-2': 3.375,
  'tr-ej-num-1': 1.7272219,
  'tr-ej-num-2': 0.6948773,
  'tr-ej-cas-1': 1.8961189,
  'tr-ej-cas-2': 7.5625,
  'si-num-1': 1 / 3,
  'si-cas-1': 2.0008632,
  'si-num-2': 0.6932540,
  'si-cas-2': 6,
  'si-ej-num-1': 1.7183188,
  'si-ej-num-2': 0.6931698,
  'si-ej-cas-1': 2.0045598,
  'si-ej-cas-2': 6,
};

type Metodo = 'trapecio' | 'simpson';

const CALCULOS: [string, Metodo, DatosModulo4][] = [
  ['tr-num-1', 'trapecio', TEORIA_TRAPECIO.ejemploNormal.calculo],
  ['tr-cas-1', 'trapecio', TEORIA_TRAPECIO.ejemploCasuistica.calculo],
  ...EJEMPLOS_TRAPECIO.map((e) => [e.id, 'trapecio' as Metodo, e.calculo] as [string, Metodo, DatosModulo4]),
  ...EJERCICIOS_TRAPECIO.map((e) => [e.id, 'trapecio' as Metodo, e.calculo] as [string, Metodo, DatosModulo4]),
  ['si-num-1', 'simpson', TEORIA_SIMPSON.ejemploNormal.calculo],
  ['si-cas-1', 'simpson', TEORIA_SIMPSON.ejemploCasuistica.calculo],
  ...EJEMPLOS_SIMPSON.map((e) => [e.id, 'simpson' as Metodo, e.calculo] as [string, Metodo, DatosModulo4]),
  ...EJERCICIOS_SIMPSON.map((e) => [e.id, 'simpson' as Metodo, e.calculo] as [string, Metodo, DatosModulo4]),
];

function correr(datos: DatosModulo4, metodo: Metodo) {
  const f = FuncionEvaluable.compilar(datos.funcion);
  const comunes = {
    f: (x: number) => f.evaluar(x),
    a: datos.a,
    b: datos.b,
    n: datos.n,
    valorExacto: datos.valorExacto,
  };
  return metodo === 'trapecio' ? trapecioCompuesto(comunes) : simpsonCompuesto(comunes);
}

/** Busca los pares `formula` / `formulaTex` en teoría, ejemplos y registro. */
function formulasTex(fuente: unknown, nombre: string): [string, string][] {
  const resultado: [string, string][] = [];
  const recorrer = (valor: unknown, ruta: string): void => {
    if (Array.isArray(valor)) {
      valor.forEach((v, i) => recorrer(v, `${ruta}[${i}]`));
      return;
    }
    if (valor && typeof valor === 'object') {
      const obj = valor as Record<string, unknown>;
      if (typeof obj['formulaTex'] === 'string') {
        expect(typeof obj['formula']).withContext(`${nombre}/${ruta}`).toBe('string');
        resultado.push([`${nombre}/${ruta}`, obj['formulaTex'] as string]);
      }
      for (const [clave, v] of Object.entries(obj)) recorrer(v, `${ruta}.${clave}`);
    }
  };
  recorrer(fuente, nombre);
  return resultado;
}
