import { Component, computed, signal } from '@angular/core';
import { UiCard } from '../../../shared/ui/ui-card/ui-card';
import { Badge } from '../../../shared/ui/badge/badge';
import { StatChip } from '../../../shared/domain/stat-chip/stat-chip';
import {
  IterationTable,
  IterationColumn,
} from '../../../shared/domain/iteration-table/iteration-table';
import { IterRow } from '../../../shared/domain/numerico/methods';
import { EJERCICIOS, Ejercicio, FilaEjercicio } from './data.ejemplos';
import { CASUISTICAS, Casuistica } from './data.casuisticas';

/**
 * Ejemplos Resueltos del Módulo 1.
 *
 * Los 10 ejercicios del PDF «Explicación ejercicios tema 1 MN» con:
 * 1) la CASUÍSTICA: de dónde sale el problema, de dónde sale cada dato y por
 *    qué ese método (capa `data.casuisticas.ts`, no altera el enunciado original),
 * 2) el desarrollo manual con la fórmula aplicada (2 iteraciones),
 * 3) la tabla de iteraciones verificada por el algoritmo real,
 * 4) el análisis de convergencia y, como add-on, el código de MATLAB/Octave.
 * Incluye un filtro por método para estudiar un solo algoritmo a la vez.
 */

type MetodoEjemplo = Ejercicio['metodo'];

/** Filtro posible: todos los ejercicios o uno de los 5 métodos. */
type FiltroEjemplo = MetodoEjemplo | 'todos';

/**
 * Ejercicio del PDF + su casuística, unidos por `id`.
 *
 * El join se resuelve una sola vez aquí en lugar de en el template, y con un
 * `Map` para que buscar la casuística sea O(1) y no O(n) por cada ejercicio
 * renderizado. Un `id` mal escrito no puede fallar en silencio: se valida al
 * construir el mapa y se avisa por consola.
 */
interface EjemploConCasuistica {
  ejercicio: Ejercicio;
  casuistica: Casuistica | null;
}

function unirConCasuisticas(): EjemploConCasuistica[] {
  const porId = new Map(CASUISTICAS.map((c) => [c.id, c]));

  const huerfanos = CASUISTICAS.filter((c) => !EJERCICIOS.some((e) => e.id === c.id));
  if (huerfanos.length > 0) {
    console.warn(
      `[ejemplos] ${huerfanos.length} casuística(s) sin ejercicio equivalente: ` +
        huerfanos.map((c) => c.id).join(', '),
    );
  }

  return EJERCICIOS.map((ejercicio) => {
    const casuistica = porId.get(ejercicio.id) ?? null;
    if (!casuistica) {
      console.warn(`[ejemplos] el ejercicio "${ejercicio.id}" no tiene casuística`);
    }
    return { ejercicio, casuistica };
  });
}

const EJEMPLOS_UNIDOS: EjemploConCasuistica[] = unirConCasuisticas();

/** Opciones del filtro, en el orden en que se muestran. */
const FILTROS: { valor: FiltroEjemplo; etiqueta: string }[] = [
  { valor: 'todos', etiqueta: 'Todos' },
  { valor: 'biseccion', etiqueta: 'Bisección' },
  { valor: 'newton', etiqueta: 'Newton-Raphson' },
  { valor: 'secante', etiqueta: 'Secante' },
  { valor: 'punto-fijo', etiqueta: 'Punto Fijo' },
  { valor: 'regula-falsi', etiqueta: 'Regla Falsa' },
];

const VARIANT_METODO: Record<MetodoEjemplo, 'navy' | 'amber' | 'teal' | 'amber-solid'> = {
  biseccion: 'amber-solid',
  newton: 'navy',
  secante: 'teal',
  'punto-fijo': 'amber-solid',
  'regula-falsi': 'amber',
};

/** Filas máximas a mostrar cuando el ejercicio NO converge (punto fijo oscilante). */
const MAX_FILAS_SIN_CONVERGENCIA = 6;

/** Traduce una etiqueta de columna del PDF a la clave real del dato. */
const KEY_POR_LABEL: Record<string, keyof FilaEjercicio> = {
  i: 'i',
  a: 'a',
  b: 'b',
  xm: 'xm',
  'f(xm)': 'fxm',
  'f(a)·f(xm)': 'prod',
  'Ea %': 'Ea',
  'Nuevo intervalo': 'nuevo',
  x: 'x',
  'f(x)': 'fx',
  "f'(x)": 'dfx',
  'x_{n+1}': 'xnuevo',
  'x₀': 'x0',
  'x₁': 'x1',
  'x₂': 'x2',
  'f(x₂)': 'f2',
};

function columnasDelEjercicio(e: Ejercicio): IterationColumn[] {
  return e.columnas.map((label) => {
    const bonito =
      label === 'x_{n+1}'
        ? 'xₙ₊₁'
        : label === "f'(x)"
          ? 'f\'(x)'
          : label === 'Ea %'
            ? 'Ea %'
            : label;
    return { key: KEY_POR_LABEL[label] ?? label, label: bonito, align: 'right' as const };
  });
}

@Component({
  selector: 'app-ejemplos',
  imports: [UiCard, Badge, StatChip, IterationTable],
  templateUrl: './ejemplos.html',
  styleUrl: './ejemplos.scss',
})
export class Ejemplos {
  readonly ejercicios = EJERCICIOS;
  readonly filtros = FILTROS;

  /** Ejercicios + casuísticas, unidos por id (ver `unirConCasuisticas`). */
  readonly ejemplos = EJEMPLOS_UNIDOS;

  /** Método seleccionado en el filtro ('todos' muestra los 10). */
  readonly filtro = signal<FiltroEjemplo>('todos');

  /** Ejemplos visibles según el filtro, preservando el orden del PDF. */
  readonly ejemplosFiltrados = computed(() => {
    const f = this.filtro();
    return f === 'todos' ? EJEMPLOS_UNIDOS : EJEMPLOS_UNIDOS.filter((e) => e.ejercicio.metodo === f);
  });

  cambiarFiltro(f: FiltroEjemplo): void {
    this.filtro.set(f);
  }

  /** Número original del ejercicio en el PDF (no se renumera al filtrar). */
  numeroEjercicio(e: Ejercicio): number {
    return EJERCICIOS.findIndex((x) => x.id === e.id) + 1;
  }

  variantMetodo(m: MetodoEjemplo): 'navy' | 'amber' | 'teal' | 'amber-solid' {
    return VARIANT_METODO[m];
  }

  /** Total de filas reales que se muestran (recorte para no convergencia). */
  filasAMostrar(e: Ejercicio): IterRow[] {
    const filas = e.convergeEn !== null ? e.filas : e.filas.slice(0, MAX_FILAS_SIN_CONVERGENCIA);
    return filas as unknown as IterRow[];
  }

  /** Índice (0-based) de la fila donde se cumple el criterio. */
  filaDestacada(e: Ejercicio): number | undefined {
    return e.convergeEn !== null ? e.convergeEn - 1 : undefined;
  }

  /** Badge del criterio. En convergencia avisa la iteración; en divergencia lo dice claro. */
  badgeConvergencia(e: Ejercicio): string {
    if (e.convergeEn !== null) return `Criterio en iteración ${e.convergeEn}`;
    if (e.id === 'puntoFijoE2') return 'No converge: la sucesión oscila';
    return 'Iteración pedida por el enunciado';
  }

  columnas(e: Ejercicio): IterationColumn[] {
    return columnasDelEjercicio(e);
  }

  /** Fila final visible (última aproximación) para el chip de raíz. */
  raiz(e: Ejercicio): string {
    return e.raizRef ?? '—';
  }

  /** ¿El ejercicio NO converge? (caso honesto de punto fijo divergente). */
  noConverge(e: Ejercicio): boolean {
    return e.convergeEn === null && e.id === 'puntoFijoE2';
  }
}