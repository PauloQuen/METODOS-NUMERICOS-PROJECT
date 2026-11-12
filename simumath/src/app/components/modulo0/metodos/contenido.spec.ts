import type { Columna } from '../../../shared/models/metodo.model';
import type {
  CampoCalculadoraError,
  EjemploError,
  EjercicioError,
  RespuestaCalculadoraError,
  TeoriaError,
} from '../modelos/modulo0.model';
import * as cifras from './cifras-significativas/contenido';
import * as errores from './error-absoluto-relativo/contenido';
import * as taylor from './taylor/contenido';
import * as propagacion from './propagacion-errores/contenido';

interface DefinicionContenido {
  nombre: string;
  teoria: TeoriaError;
  ejemplos: EjemploError[];
  ejercicios: EjercicioError[];
  campos: CampoCalculadoraError[];
  calcular: (valores: Record<string, string>) => RespuestaCalculadoraError;
}

const METODOS: DefinicionContenido[] = [
  {
    nombre: 'cifras significativas',
    teoria: cifras.TEORIA_CIFRAS,
    ejemplos: cifras.EJEMPLOS_CIFRAS,
    ejercicios: cifras.EJERCICIOS_CIFRAS,
    campos: cifras.CAMPOS_CIFRAS,
    calcular: cifras.calcularCifras,
  },
  {
    nombre: 'error absoluto y relativo',
    teoria: errores.TEORIA_ERRORES,
    ejemplos: errores.EJEMPLOS_ERRORES,
    ejercicios: errores.EJERCICIOS_ERRORES,
    campos: errores.CAMPOS_ERRORES,
    calcular: errores.calcularErrorRelativo,
  },
  {
    nombre: 'Taylor',
    teoria: taylor.TEORIA_TAYLOR,
    ejemplos: taylor.EJEMPLOS_TAYLOR,
    ejercicios: taylor.EJERCICIOS_TAYLOR,
    campos: taylor.CAMPOS_TAYLOR,
    calcular: taylor.calcularTaylor,
  },
  {
    nombre: 'propagación',
    teoria: propagacion.TEORIA_PROPAGACION,
    ejemplos: propagacion.EJEMPLOS_PROPAGACION,
    ejercicios: propagacion.EJERCICIOS_PROPAGACION,
    campos: propagacion.CAMPOS_PROPAGACION,
    calcular: propagacion.calcularPropagacion,
  },
];

function revisarTabla(bloque: EjemploError, etiqueta: string): void {
  const columnas: Columna[] = bloque.tabla.columnas;
  const filas = bloque.tabla.filas;

  expect(columnas.length).withContext(`${etiqueta}: sin columnas`).toBeGreaterThan(0);
  expect(filas.length).withContext(`${etiqueta}: sin filas`).toBeGreaterThan(0);

  for (const col of columnas) {
    expect(col.key.length).withContext(`${etiqueta}: columna sin key`).toBeGreaterThan(0);
    expect(col.label.length).withContext(`${etiqueta}: columna sin label`).toBeGreaterThan(0);
  }

  for (const fila of filas) {
    for (const col of columnas) {
      expect(Object.prototype.hasOwnProperty.call(fila, col.key))
        .withContext(`${etiqueta}: falta la clave "${col.key}" en una fila`)
        .toBeTrue();
    }
  }
}

function valoresIniciales(campos: CampoCalculadoraError[]): Record<string, string> {
  return Object.fromEntries(campos.map((c) => [c.key, c.valorInicial]));
}

describe('contenido del Módulo 0', () => {
  for (const metodo of METODOS) {
    describe(metodo.nombre, () => {
      it('tiene la teoría completa y recursos verificables', () => {
        const t = metodo.teoria;

        expect(t.concepto.length).toBeGreaterThan(80);
        expect(t.fundamento.length).toBeGreaterThan(120);
        expect(t.cuandoFalla.length).toBeGreaterThan(100);
        expect(t.precision.length).toBeGreaterThan(80);
        expect(t.algoritmo.formula.length).toBeGreaterThan(10);
        expect(t.algoritmo.criterios.length).toBeGreaterThanOrEqual(3);
        expect(t.algoritmo.pasos.length).toBeGreaterThanOrEqual(4);
        expect(t.algoritmo.ventajas.length).toBeGreaterThanOrEqual(3);
        expect(t.algoritmo.limitaciones.length).toBeGreaterThanOrEqual(3);
        expect(t.algoritmo.recomendaciones.length).toBeGreaterThanOrEqual(3);

        for (const recurso of t.recursos) {
          expect(recurso.url.startsWith('https://'))
            .withContext(`${metodo.nombre}: recurso sin HTTPS`)
            .toBeTrue();
          expect(recurso.titulo.length).toBeGreaterThan(5);
        }
      });

      it('resuelve los dos ejemplos de la teoría con tablas coherentes', () => {
        revisarTabla(metodo.teoria.ejemploNormal, `${metodo.nombre} / teoría normal`);
        revisarTabla(metodo.teoria.ejemploCasuistica, `${metodo.nombre} / teoría casuística`);

        expect(metodo.teoria.ejemploNormal.tipo).toBe('numerico');
        expect(metodo.teoria.ejemploCasuistica.tipo).toBe('casuistica');
        expect(metodo.teoria.ejemploCasuistica.enunciado).toBeTruthy();
        expect(metodo.teoria.ejemploCasuistica.extraccion).toBeTruthy();
      });

      it('tiene cuatro ejemplos y tres ejercicios con IDs únicos', () => {
        expect(metodo.ejemplos.length).toBe(4);
        expect(metodo.ejercicios.length).toBe(3);

        const ids = [
          metodo.teoria.ejemploNormal.id,
          metodo.teoria.ejemploCasuistica.id,
          ...metodo.ejemplos.map((e) => e.id),
          ...metodo.ejercicios.map((e) => e.id),
        ];
        expect(new Set(ids).size).toBe(ids.length);
      });

      it('cada ejemplo y ejercicio tiene pasos, conclusión y tabla', () => {
        const bloques = [
          metodo.teoria.ejemploNormal,
          metodo.teoria.ejemploCasuistica,
          ...metodo.ejemplos,
          ...metodo.ejercicios,
        ];

        for (const bloque of bloques) {
          expect(bloque.pasos.length).toBeGreaterThanOrEqual(2);
          expect(bloque.conclusion.length).toBeGreaterThan(20);
          expect(bloque.planteamiento.length).toBeGreaterThan(20);
          revisarTabla(bloque, `${metodo.nombre} / ${bloque.id}`);
        }
      });

      it('cada ejercicio verificable tiene una respuesta y un cuestionario válido', () => {
        for (const ejercicio of metodo.ejercicios) {
          expect(ejercicio.resolucion).withContext(ejercicio.id).toBeTruthy();
          expect(typeof ejercicio.resolucion?.valorCorrecto).toBe('number');
          expect(Number.isFinite(ejercicio.resolucion?.valorCorrecto as number)).toBeTrue();
          expect(ejercicio.formatoRespuesta).toBe('escalar');
          expect(ejercicio.cuestionario?.length).withContext(ejercicio.id).toBeGreaterThanOrEqual(2);

          for (const pregunta of ejercicio.cuestionario ?? []) {
            const idsOpciones = pregunta.opciones.map((o) => o.id);
            expect(new Set(idsOpciones).size).toBe(idsOpciones.length);
            expect(idsOpciones).withContext(`${ejercicio.id}/${pregunta.id}`).toContain(
              pregunta.correcta,
            );
          }
        }
      });

      it('la calculadora resuelve los valores iniciales y rechaza entradas vacías', () => {
        const respuesta = metodo.calcular(valoresIniciales(metodo.campos));

        expect(respuesta.exito).withContext(metodo.nombre).toBeTrue();
        expect(respuesta.resultado).toBeTruthy();
        expect(respuesta.filas?.length).toBeGreaterThan(0);
        expect(respuesta.columnas?.length).toBeGreaterThan(0);

        const vacia = metodo.calcular({});
        expect(vacia.exito).toBeFalse();
        expect(vacia.conclusion.length).toBeGreaterThan(10);
      });
    });
  }
});
