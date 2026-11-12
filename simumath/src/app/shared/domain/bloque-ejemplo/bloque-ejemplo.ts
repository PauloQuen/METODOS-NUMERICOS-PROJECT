import { MatrizVista } from '../matriz-vista/matriz-vista';
import { TextoMatricial } from '../matriz-vista/texto-matricial';
import type { MatrizPractica } from '../../practica-guiada/modelos';
import { FormulaMatematica } from '../../practica-guiada/formula-matematica';
import { Component, computed, input, output, signal } from '@angular/core';
import { IterationTable } from '../iteration-table/iteration-table';
import { GraficoMetodo } from '../grafico-metodo/grafico-metodo';
import { PasosControl } from '../pasos-control/pasos-control';
import { UiCard } from '../../ui/ui-card/ui-card';
import type { Columna, DibujarMetodo, EjemploBase } from '../../models/metodo.model';

/**
 * Tarjeta de un ejemplo resuelto.
 *
 * ── El bloque más repetido del portal ─────────────────────────────────
 * Aparece igual en la pestaña de Teoría, en Ejemplos y (al desplegar la
 * solución) en Autoevaluación. Por eso vive en `shared/` y recibe el
 * ejemplo por `input()`: no sabe de qué método viene ni qué significa
 * "bisección" o "secante".
 *
 * La estructura de dos columnas es fija para todos los métodos:
 *
 *   ┌─────────────────────┬──────────────────────┐
 *   │ Texto y cuentas     │  Gráfico del método  │
 *   │ (lo que hay que     │  + botones de pasos  │
 *   │  entender)          │  (lo que hay que ver)│
 *   └─────────────────────┴──────────────────────┘
 *   Conclusión en palabras
 *   Tabla de iteraciones
 *
 * ── Las cuentas y los números ─────────────────────────────────────────
 * `ejemplo()` trae el texto, pero la tabla de iteraciones y el gráfico
 * se calculan con los DATOS que trae (`calculo`), no con lo que dice el
 * texto. Así el ejemplo no puede mentir: si el algoritmo cambia, la
 * tabla cambia con él.
 */
@Component({
  selector: 'app-bloque-ejemplo',
  standalone: true,
  imports: [MatrizVista, TextoMatricial, FormulaMatematica, IterationTable, GraficoMetodo, PasosControl, UiCard],
  templateUrl: './bloque-ejemplo.html',
  styleUrl: './bloque-ejemplo.scss',
})
export class BloqueEjemplo {
  /**
   * El ejemplo a mostrar, con su texto.
   *
   * El tipo es `EjemploBase` y no `Ejemplo` a propósito: este bloque
   * NUNCA toca los datos de cálculo (la tabla y el gráfico se calculan
   * afuera y llegan por `filas`). Por eso puede mostrar un ejemplo del
   * Módulo 1 (una función) o del Módulo 2 (una matriz) con el mismo
   * componente y el mismo layout.
   */
  readonly ejemplo = input.required<EjemploBase>();
  readonly sistema = input<{ A: number[][]; b: number[] }>();
  readonly matrices = input<MatrizPractica[]>([]);
  readonly aumentada = computed(() => this.sistema()?.A.map((fila,i) => [...fila, this.sistema()!.b[i]]) ?? []);

  /** Las filas ya calculadas por el algoritmo del método. */
  readonly filas = input<Record<string, number | string>[]>([]);

  /** Las columnas de la tabla, definidas por el método. */
  readonly columnas = input<Columna[]>([]);

  /** Índice de la fila que cumple el criterio (se resalta en dorado). */
  readonly filaFinal = input<number | undefined>(undefined);

  /**
   * Texto del badge que se pone en la fila resaltada.
   *
   * "Cumple criterio" sirve para los métodos iterativos, que se detienen
   * porque cumplen una condición. Un método DIRECTO no tiene criterio de
   * parada: termina porque se acabó el trabajo, y su fila final dice
   * "Solución hallada".
   */
  readonly highlightBadge = input('Cumple criterio');

  /**
   * La función ya parseada, para el gráfico.
   *
   * Es opcional porque el gráfico es un slot: el Módulo 2 proyecta el
   * suyo (rectas del sistema) y no tiene ninguna función que pasarle.
   * El valor por defecto solo se usa si nadie proyecta nada, y en ese
   * caso el gráfico dibuja la recta y = 0.
   */
  readonly funcion = input<(x: number) => number>(() => 0);

  /** Rango visible del eje x. */
  readonly rango = input({ min: -5, max: 5 });

  /**
   * La raíz que encontró el método, si ya la encontró.
   *
   * Se pasa desde afuera (el padre la saca del resultado del algoritmo)
   * para que el gráfico pueda marcar la banda donde cae la raíz.
   */
  readonly raiz = input<number | undefined>(undefined);

  /**
   * Cómo dibuja ESTE método lo suyo sobre el gráfico.
   *
   * Va tipado como `DibujarMetodo` (el contrato de shared/models) y no
   * como un callback suelto: así el compilador obliga a que la función
   * tenga la firma (ctx, rect, contexto) y no se puede pasar algo
   * incompatible por error.
   */
  readonly dibujarMetodo = input<DibujarMetodo | undefined>(undefined);

  /** Qué claves de la fila usa el método para dibujar (a, b, c...). */
  readonly clavesGrafico = input<{ intervaloIzq?: string; intervaloDer?: string; punto?: string }>({});

  /** Muestra el botón "Ver video" si el contenido trae link. */
  readonly videoUrl = input<string | undefined>(undefined);

  /**
   * Textos de cada paso, uno por fila de la tabla.
   *
   * ── Por qué es opcional ───────────────────────────────────────────────
   * El Módulo 1 escribe sus pasos a mano en el contenido (son las dos
   * primeras iteraciones, con las cuentas desarrolladas). El Módulo 2 no
   * puede hacer eso: los pasos de una eliminación dependen de los
   * números que salen del algoritmo, y si el contenido los escribiera a
   * mano podrían dejar de coincidir con la tabla.
   *
   * Por eso, cuando el método trae los textos calculados, se los pasa
   * acá y mandan sobre los del ejemplo. El texto que se lee al mover los
   * botones es entonces la narración real del método.
   */
  readonly textosPasos = input<string[] | undefined>(undefined);

  /**
   * Rótulos que este componente usa y que no significan lo mismo en
   * todos los métodos. Los defaults son los de los métodos iterativos
   * (los que más se usan); Cardano, que no itera, pasa los suyos
   * ("Pasos (resolución paso a paso)", "Paso", "Discriminante y casos")
   * sin que haya que escribir una versión condicional del componente.
   */
  readonly tituloPasos = input('Pasos (iteraciones a mano)');
  readonly etiquetaPaso = input('Iteración');
  readonly tituloCriterio = input('Criterio de convergencia');

  /** Muestra el bloque de extracción de datos (solo casuísticas). */
  readonly esCasuistica = computed(() => this.ejemplo().tipo === 'casuistica');

  /** Qué iteración se está viendo. Lo mueven los botones de pasos. */
  readonly pasoActual = signal(0);

  /**
   * Avisa en qué paso está el alumno.
   *
   * ── Por qué hace falta ───────────────────────────────────────────────
   * El gráfico que se proyecta en el hueco `grafico` lo escribe el
   * PADRE de este componente, no este componente. Y hay gráficos que
   * dependen del paso: el de la eliminación gaussiana dibuja las rectas
   * auxiliares a medida que se despeja la solución. Sin este aviso, el
   * padre no podría saber por dónde va el alumno y el gráfico se vería
   * siempre en el primer paso.
   *
   * Es un `output` y no un `input`: acá el paso es la fuente de verdad
   * (lo mueven los botones de este bloque) y el padre solo se entera.
   */
  readonly pasoCambiado = output<number>();

  /** La última fila, que es la que converge. */
  protected readonly ultimaFila = computed(() => {
    const f = this.filas();
    return f.length > 0 ? f[f.length - 1] : undefined;
  });

  /** La función del gráfico cambia si el ejemplo cambia. */
  protected readonly textoPaso = (indice: number): string => {
    const dinamicos = this.textosPasos();
    if (dinamicos && dinamicos.length > 0) {
      return dinamicos[Math.min(indice, dinamicos.length - 1)] ?? '';
    }
    const pasos = this.ejemplo().pasos;
    if (indice < pasos.length) return pasos[indice];
    const ultima = pasos[pasos.length - 1];
    return ultima ?? '';
  };

  /** Lo que dicen los botones de pasos. */
  protected alCambiarPaso(nuevo: number): void {
    this.pasoActual.set(nuevo);
    this.pasoCambiado.emit(nuevo);
  }
}
