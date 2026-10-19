import { Component, computed, inject, signal } from '@angular/core';
import { PuntoFijoService } from '../punto-fijo.service';
import {
  CAMPOS_CALCULADORA,
  COLUMNAS_PUNTO_FIJO,
  DATOS_POR_DEFECTO,
} from '../punto-fijo.config';
import { dibujarPuntoFijo } from '../punto-fijo.grafico';
import { CalculadoraShell } from '../../../../../../shared/domain/calculadora-shell/calculadora-shell';
import { IterationTable } from '../../../../../../shared/domain/iteration-table/iteration-table';
import { PasosControl } from '../../../../../../shared/domain/pasos-control/pasos-control';
import { GraficoMetodo } from '../../../../../../shared/domain/grafico-metodo/grafico-metodo';
import { UiCard } from '../../../../../../shared/ui/ui-card/ui-card';
import { parseFuncion } from '../../../../../../shared/domain/numerico/methods';
import type {
  DatosCalculo,
  RespuestaCalculadora,
} from '../../../../../../shared/models/metodo.model';

/**
 * PESTAÑA DE CALCULADORA de Punto Fijo.
 *
 * ── Quién hace qué ───────────────────────────────────────────────────
 * `CalculadoraShell` solo junta lo que el alumno escribe: no sabe qué
 * método es. Este componente recibe ese evento, se lo pasa al
 * `PuntoFijoService`, y reparte el resultado entre la tabla, el visor
 * de pasos y el gráfico. La matemática vive en el servicio y el
 * algoritmo; esta pantalla solo las conecta.
 *
 * ── Por qué el estado vive en el servicio ────────────────────────────
 * El resultado se lee de los signals del servicio, no de signals
 * propios: si fuera local, el cálculo moriría al salir de la pestaña.
 * El alumno puede ir a Teoría, volver, y seguir con la misma cuenta.
 *
 * ── El puente hacia los componentes compartidos ──────────────────────
 * Los componentes genéricos (shell, tabla, visor) no conocen a Punto
 * Fijo. Acá se traduce: los campos salen del config, la respuesta se
 * arma desde los signals del servicio y el texto de cada paso se
 * construye con las filas de esta iteración.
 */
@Component({
  selector: 'app-punto-fijo-calculadora',
  standalone: true,
  imports: [CalculadoraShell, IterationTable, PasosControl, GraficoMetodo, UiCard],
  templateUrl: './punto-fijo-calculadora.html',
  styleUrl: './punto-fijo-calculadora.scss',
})
export class PuntoFijoCalculadora {
  private readonly servicio = inject(PuntoFijoService);

  /** Los campos del formulario: los define `punto-fijo.config.ts`. */
  readonly campos = CAMPOS_CALCULADORA;

  /** Las columnas de la tabla. */
  readonly columnas = COLUMNAS_PUNTO_FIJO;

  /** El dibujo del método (la telaraña contra la diagonal y = x). */
  readonly dibujar = dibujarPuntoFijo;

  /** Lo que el alumno escribió. Va en dos direcciones con el shell. */
  protected readonly valores = signal<Record<string, string>>({});

  /** Qué iteración está mostrando el visor de pasos. */
  protected readonly paso = signal(0);

  /** La función ya parseada, para el gráfico. */
  protected readonly funcion = signal<(x: number) => number>(() => 0);

  /** El rango del eje X, ajustado a la semilla que se está mirando. */
  protected readonly rango = signal<{ min: number; max: number }>({
    min: 0,
    max: 2.5,
  });

  // ── Lectura del estado del servicio ────────────────────────────────
  protected readonly filas = this.servicio.filas;
  protected readonly raiz = this.servicio.raiz;
  protected readonly convergio = this.servicio.convergio;
  protected readonly iteraciones = this.servicio.iteraciones;
  protected readonly error = this.servicio.error;
  protected readonly mensaje = this.servicio.mensaje;

  /** ¿Hay cálculo para mostrar? La tabla y el gráfico se ocultan sin filas. */
  protected readonly hayCalculo = computed(() => this.filas().length > 0);

  /** La fila donde se cumplió el criterio, para resaltarla en la tabla. */
  protected readonly filaFinal = computed(() =>
    this.convergio() ? this.filas().length - 1 : undefined,
  );

  /**
   * La respuesta que muestra el shell, armada desde los signals del
   * servicio. Es `null` mientras no haya cálculo: el shell no dibuja
   * nada. Si el alumno escribió algo inválido, el servicio deja un
   * mensaje y se muestra como respuesta fallida.
   */
  protected readonly respuesta = computed<RespuestaCalculadora | null>(() => {
    const filas = this.filas();
    const mensaje = this.mensaje();

    if (filas.length === 0) {
      return mensaje ? { exito: false, conclusion: mensaje } : null;
    }

    if (this.convergio()) {
      const raiz = this.raiz();
      const tol = Number(this.servicio.datos().tol);
      const n = this.iteraciones();
      return {
        exito: true,
        raiz: formatear(raiz),
        iteraciones: n,
        error: formatear(this.error()),
        conclusion:
          `Punto Fijo convergió en ${n} iteraciones. La raíz es ` +
          `x ≈ ${formatear(raiz)} con |Δx| < ${formatearTolTexto(tol)}. ` +
          'El método se detuvo porque el desplazamiento entre iteraciones ' +
          'quedó por debajo de la tolerancia.',
      };
    }

    return {
      exito: false,
      conclusion:
        mensaje ??
        'No se pudo completar el cálculo con los datos ingresados. ' +
          'Probá otra reescritura x = g(x): si |g′| no es menor que 1 ' +
          'cerca de la raíz, el método puede no converger.',
    };
  });

  /** Cuántas iteraciones hay, para el total del visor de pasos. */
  protected readonly total = computed(() => this.filas().length);

  /**
   * La explicación de la iteración que se está mirando.
   *
   * Se arma con los números de la fila actual, para que el texto y el
   * gráfico no puedan discrepar: salen de la misma fila.
   */
  protected readonly textoDelPaso = computed(() => {
    const filas = this.filas();
    const fila = filas[this.paso()];
    if (!fila) return '';

    const base =
      `Iteración ${fila['n']}: xᵢ = ${fila['x']}, g(xᵢ) = ${fila['gx']}, ` +
      `|Δx| = ${fila['delta'] === '' ? '—' : fila['delta']}.`;
    const ultima = this.filaFinal() === this.paso();

    return ultima
      ? `${base} Esta es la última: se cumplió el criterio de parada.`
      : `${base} Como |Δx| todavía supera la tolerancia, se itera de nuevo: ` +
        'xᵢ₊₁ = g(xᵢ) y el punto rebota contra la diagonal y = x.';
  });

  /**
   * El alumno apretó Calcular.
   *
   * Los campos vienen como strings porque así los da el input. Se
   * convierten con `Number` acá, nunca en el shell: el shell es
   * genérico y no debería saber qué es una tolerancia.
   */
  protected alCalcular(escrito: Record<string, string>): void {
    const datos: DatosCalculo = {
      funcion: escrito['funcion'] ?? DATOS_POR_DEFECTO.funcion,
      x0: aNumero(escrito['x0'], DATOS_POR_DEFECTO.x0),
      tol: aNumero(escrito['tol'], DATOS_POR_DEFECTO.tol),
      maxIter: aNumero(escrito['maxIter'], DATOS_POR_DEFECTO.maxIter),
    };

    this.servicio.calcular(datos);

    this.funcion.set(parseSeguro(datos.funcion));
    this.rango.set(rangoDeSemillas([datos.x0!]));
    this.paso.set(0);
  }

  /** El visor de pasos pasó a otra iteración. */
  protected alCambiarPaso(paso: number): void {
    this.paso.set(paso);
  }

  /** El alumno apretó Limpiar: se borra el cálculo. */
  protected alLimpiar(): void {
    this.servicio.reiniciar();
    this.valores.set({});
    this.paso.set(0);
  }
}

/** Convierte lo que escribió el alumno, con un valor por defecto. */
function aNumero(
  texto: string | undefined,
  porDefecto: number | undefined,
): number {
  if (texto === undefined || texto.trim() === '') return porDefecto ?? 0;
  return Number(texto);
}

/** Parsea sin explotar: si la expresión no va, el gráfico queda vacío. */
function parseSeguro(texto: string): (x: number) => number {
  try {
    return parseFuncion(texto);
  } catch {
    return () => NaN;
  }
}

/**
 * Rango del eje X alrededor de la semilla, con margen para ver la
 * curva y la telaraña. Si la semilla no es un número, se usa el rango
 * genérico.
 */
function rangoDeSemillas(
  semillas: number[],
): { min: number; max: number } {
  const validas = semillas.filter((n) => Number.isFinite(n));
  if (validas.length === 0) return { min: -5, max: 5 };

  const min = Math.min(...validas);
  const max = Math.max(...validas);
  const ancho = Math.max(max - min, 0.5);
  const margen = ancho * 0.5;

  return { min: min - margen, max: max + margen };
}

/** Formatea un número para mostrarlo, o «—» si no es finito. */
function formatear(v: number | undefined): string {
  if (v === undefined || !Number.isFinite(v)) return '—';
  if (Number.isInteger(v)) return String(v);
  return v.toFixed(8).replace(/\.?0+$/, '');
}

/** La tolerancia, en texto legible (exponencial si es muy chica). */
function formatearTolTexto(tol: number): string {
  if (tol < 1e-4) return tol.toExponential(1);
  if (Number.isInteger(tol)) return String(tol);
  return String(tol);
}