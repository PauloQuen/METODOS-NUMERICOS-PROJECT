import { Component, computed, inject, signal } from '@angular/core';
import { BiseccionService } from '../biseccion.service';
import { CAMPOS_CALCULADORA, COLUMNAS_BISECCION, DATOS_POR_DEFECTO } from '../biseccion.config';
import { dibujarBiseccion } from '../biseccion.grafico';
import { CalculadoraShell } from '../../../../../../shared/domain/calculadora-shell/calculadora-shell';
import { IterationTable } from '../../../../../../shared/domain/iteration-table/iteration-table';
import { PasosControl } from '../../../../../../shared/domain/pasos-control/pasos-control';
import { GraficoMetodo } from '../../../../../../shared/domain/grafico-metodo/grafico-metodo';
import { UiCard } from '../../../../../../shared/ui/ui-card/ui-card';

/**
 * PESTAÑA DE CALCULADORA de Bisección.
 *
 * ── Quién hace qué ───────────────────────────────────────────────────
 * `CalculadoraShell` solo junta lo que el alumno escribe: no sabe qué
 * método es. Este componente recibe ese evento, se lo pasa al
 * `BiseccionService`, y reparte el resultado entre la tabla, el visor de
 * pasos y el gráfico. La matemática vive en el servicio y el algoritmo;
 * esta pantalla solo las conecta.
 *
 * ── Por qué el estado NO es local ────────────────────────────────────
 * El resultado se lee del servicio, no de un signal propio. Si fuera
 * local, el cálculo moriría al salir de la pestaña. Como está en el
 * servicio, el alumno puede ir a Teoría, volver, y seguir con la misma
 * cuenta a medio hacer.
 *
 * ── Tabla completa vs. paso a paso ───────────────────────────────────
 * `IterationTable` muestra TODAS las filas de una: es la trayectoria
 * entera. `PasosControl` va recorriendo una por una, y el gráfico usa
 * `pasoActual` para dibujar el intervalo de esa iteración (por eso se
 * le pasa la lista completa y no un recorte: el indexado lo hace
 * `biseccion.grafico.ts`).
 */
@Component({
  selector: 'app-biseccion-calculadora',
  standalone: true,
  imports: [CalculadoraShell, IterationTable, PasosControl, GraficoMetodo, UiCard],
  templateUrl: './biseccion-calculadora.html',
  styleUrl: './biseccion-calculadora.scss',
})
export class BiseccionCalculadora {
  private readonly servicio = inject(BiseccionService);

  /** Los campos del formulario: los define `biseccion.config.ts`. */
  readonly campos = CAMPOS_CALCULADORA;

  /** Las columnas de la tabla. */
  readonly columnas = COLUMNAS_BISECCION;

  /** El dibujo de bisección. */
  readonly dibujar = dibujarBiseccion;

  /** El resultado del último cálculo, tal como lo guarda el servicio. */
  protected readonly estado = this.servicio.resultado;

  /** Lo que el alumno escribió. Va en dos direcciones con el shell. */
  protected readonly valores = signal<Record<string, string>>({});

  /** Qué iteración está mostrando el visor de pasos. */
  protected readonly paso = signal(0);

  /** La función ya parseada, para el gráfico. */
  protected readonly funcion = signal<(x: number) => number>(() => 0);

  /** El rango del eje X, ajustado al intervalo que se está mirando. */
  protected readonly rango = signal<{ min: number; max: number }>({ min: -5, max: 5 });

  /**
   * El alumno apretó Calcular.
   *
   * Los campos vienen como strings porque así los da el input. Se
   * convierten con `Number` acá, nunca en el shell: el shell es
   * genérico y no debería saber qué es una tolerancia.
   */
  protected alCalcular(escrito: Record<string, string>): void {
    const datos = {
      funcion: escrito['funcion'] ?? DATOS_POR_DEFECTO.funcion,
      a: aNumero(escrito['a'], DATOS_POR_DEFECTO.a),
      b: aNumero(escrito['b'], DATOS_POR_DEFECTO.b),
      tol: aNumero(escrito['tol'], DATOS_POR_DEFECTO.tol),
      maxIter: aNumero(escrito['maxIter'], DATOS_POR_DEFECTO.maxIter),
    };

    this.servicio.calcular(datos);

    this.funcion.set(this.servicio.funcionDesdeTexto(datos.funcion));
    this.rango.set(this.servicio.rangoPara(datos));
    this.paso.set(0);
  }

  /** El visor de pasos pasó a otra iteración. */
  protected alCambiarPaso(paso: number): void {
    this.paso.set(paso);
  }

  /** El alumno apretó Limpiar: se borra el cálculo. */
  protected alLimpiar(): void {
    this.servicio.limpiar();
    this.valores.set({});
    this.paso.set(0);
  }

  /**
   * Cuántas iteraciones hay, para el total del visor de pasos.
   *
   * Es un `computed` y no un signal propio porque depende del estado: si
   * el alumno recalcula con otro intervalo, el total tiene que cambiar
   * solo. Con un signal manual habría que acordarse de actualizarlo en
   * cada cálculo, y es el tipo de forgot que después rompe el visor.
   */
  protected readonly total = computed(() => this.estado()?.filas.length ?? 0);

  /**
   * La explicación de la iteración que se está mirando.
   *
   * Se arma con los números de la fila actual, para que el texto y el
   * gráfico no puedan discrepar: salen de la misma fila.
   */
  protected readonly textoDelPaso = computed(() => {
    const e = this.estado();
    if (!e) return '';

    const fila = e.filas[this.paso()];
    if (!fila) return '';

    const n = fila['n'];
    const c = fila['c'];
    const fc = fila['fc'];
    const error = fila['error'];
    const ultima = e.filaFinal === this.paso();

    const base = `Iteración ${n}: c = ${c}, f(c) = ${fc}, error = ${error}.`;

    return ultima
      ? `${base} Esta es la última: se cumplió el criterio de parada.`
      : `${base} Como f(c) no es cero todavía, el intervalo se reduce a la mitad.`;
  });
}

/** Convierte lo que escribió el alumno, con un valor por defecto. */
function aNumero(texto: string | undefined, porDefecto: number | undefined): number {
  if (texto === undefined || texto.trim() === '') return porDefecto ?? 0;
  return Number(texto);
}