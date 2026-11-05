import { resolverCardano, type CasoCardano } from '../../../../../shared/domain/numerico/cardano';
import type { DatosCalculo } from '../../../../../shared/models/metodo.model';

/**
 * Puente entre el motor `shared/domain/numerico/cardano.ts` y la
 * interfaz de esta página.
 *
 * ── Qué hace y qué no ────────────────────────────────────────────────
 * El motor devuelve pasos con `valor: number | null` (número crudo para
 * el gráfico, null donde no hay raíz). La tabla de la interfaz necesita
 * strings ya formateados, y la columna `valor` necesita un '—' en las
 * filas sin raíz para que se vea vacía y NO para que el dibujo la lea
 * (Number('—') es NaN y el gráfico la ignora). Ese traducir es todo
 * este archivo.
 *
 * La semántica de `resuelto` es la de "Cardano terminó": a diferencia
 * de los iterativos, no hay "convergió": o la fórmula se aplicó y las
 * raíces están, o el método explicó por qué no pudo (función no cúbica).
 */
export interface EntradaCardano {
  datos: DatosCalculo;
  /** La función ya parseada, evaluables sus coeficientes por evaluación. */
  fn: (x: number) => number;
}

export interface CardanoEstado {
  /** Los datos con los que se corrió (para reintentar o mostrar). */
  datos: DatosCalculo;
  /** Filas de la tabla: paso, etapa, detalle y valor ya formateado. */
  filas: Record<string, number | string>[];
  /** Las raíces reales, de menor a mayor. */
  raices: number[];
  /** Qué caso del discriminante le tocó, o null si no se pudo resolver. */
  caso: CasoCardano | null;
  /** true si la fórmula se aplicó; false si hubo error de dominio. */
  resuelto: boolean;
  /** Presente solo si no se pudo resolver (no era una cúbica, etc.). */
  mensaje?: string;
}

/**
 * Corre Cardano y arma las filas de la tabla.
 *
 * @param entrada Datos del bloque + función ya parseada.
 */
export function ejecutarCardano(entrada: EntradaCardano): CardanoEstado {
  const { datos, fn } = entrada;
  const r = resolverCardano(fn);

  if (r.error) {
    return {
      datos,
      filas: [],
      raices: [],
      caso: null,
      resuelto: false,
      mensaje: r.error,
    };
  }

  const filas = r.pasos.map((p) => ({
    paso: p.paso,
    etapa: p.etapa,
    detalle: p.detalle,
    // Solo las raíces llevan número; el resto queda en '—' y el
    // gráfico, al convertirlo con Number(), obtiene NaN y lo saltea.
    valor: p.valor === null ? '—' : formatear(p.valor),
  }));

  return {
    datos,
    filas,
    raices: r.raicesReales,
    caso: r.caso,
    resuelto: true,
  };
}

/** Formatea un número para mostrarlo, o «—» si no es finito. */
export function formatear(v: number | undefined): string {
  if (v === undefined || !Number.isFinite(v)) return '—';
  if (Number.isInteger(v)) return String(v);
  return v.toFixed(8).replace(/\.?0+$/, '');
}
