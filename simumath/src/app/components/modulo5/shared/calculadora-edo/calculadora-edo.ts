import { Component, computed, inject, input, signal } from '@angular/core';
import { PanelCalculadoraEdo } from '../panel-calculadora-edo/panel-calculadora-edo';
import { IterationTable } from '../../../../shared/domain/iteration-table/iteration-table';
import { PasosControl } from '../../../../shared/domain/pasos-control/pasos-control';
import { GraficoMetodo } from '../../../../shared/domain/grafico-metodo/grafico-metodo';
import { UiCard } from '../../../../shared/ui/ui-card/ui-card';
import type { Columna } from '../../../../shared/models/metodo.model';
import type { CampoCalculadoraM5, DatosModulo5 } from '../../modelos/modulo5.model';
import { eulerExplicito } from '../../tipos/edo-clasicos/euler/euler.algoritmo';
import { rungeKutta4 } from '../../tipos/edo-clasicos/rk4/rk4.algoritmo';
import {
  armarRespuestaEdo,
  compilarExacta,
  compilarF,
  filasDeEuler,
  filasDeRk4,
  numero,
  rangoYDe,
} from '../edo';
import { crearDibujoEdo } from '../edo.grafico';
import {
  EdoCalculadoraStore,
  type EstadoCalculadoraEdo,
  type MetodoCalculadora,
} from '../edo-calculadora.store';

const sinCurva = () => NaN;

/**
 * Calculadora compartida de Euler y RK4.
 *
 * El método es un input (`euler` | `rk4`). El componente junta los datos,
 * corre el algoritmo, arma la tabla, la gráfica, el paso a paso, el CSV,
 * la comparación entre ambos métodos y la tabla de convergencia.
 *
 * Se hace una sola calculadora para los dos métodos porque el 90 % de la
 * interfaz es idéntico: lo único que cambia es la tabla (k₁ solo en
 * Euler, k₁…k₄ en RK4) y el texto del paso.
 */
@Component({
  selector: 'app-calculadora-edo',
  standalone: true,
  imports: [
    PanelCalculadoraEdo,
    IterationTable,
    PasosControl,
    GraficoMetodo,
    UiCard,
  ],
  templateUrl: './calculadora-edo.html',
  styleUrl: './calculadora-edo.scss',
})
export class CalculadoraEdo {
  readonly metodo = input.required<MetodoCalculadora>();
  readonly campos = input<CampoCalculadoraM5[]>([]);
  readonly columnas = input<Columna[]>([]);
  readonly titulo = input('Calculadora');
  readonly intro = input('');

  private readonly store = inject(EdoCalculadoraStore);

  protected readonly estado = computed<EstadoCalculadoraEdo | null>(
    () => this.store.estados()[this.metodo()],
  );

  protected readonly valores = computed<Record<string, string>>(
    () => this.store.valores()[this.metodo()],
  );

  protected readonly paso = signal(0);
  protected readonly copiado = signal(false);

  protected readonly dibujo = crearDibujoEdo();

  protected readonly sinCurva = sinCurva;

  protected readonly exacta = computed(() => {
    const e = this.estado();
    return e ? compilarExacta(e.datos.exacta) : undefined;
  });

  protected readonly rango = computed(() => {
    const e = this.estado();
    if (!e) return { min: -1, max: 1 };
    const min = Math.min(e.datos.t0, e.datos.tFin);
    const max = Math.max(e.datos.t0, e.datos.tFin);
    const margen = (max - min) * 0.03 || 1;
    return { min: min - margen, max: max + margen };
  });

  protected readonly rangoY = computed(() => {
    const e = this.estado();
    if (!e) return undefined;
    return rangoYDe(e.filas, compilarExacta(e.datos.exacta));
  });

  /** Texto del paso actual. */
  protected readonly textoDelPaso = computed(() => {
    const e = this.estado();
    if (!e) return '';
    const fila = e.filas[this.paso()];
    if (!fila) return '';

    const metodo = this.metodo();
    const h = numero(e.datos.h, 6);
    const t = fila['t'];
    const y = fila['y'];

    if (metodo === 'euler') {
      const k1 = fila['k1'];
      if (k1 === '') {
        return `Fin del intervalo: t = ${t}, y = ${y}.`;
      }
      return (
        `Paso en t = ${t}, y = ${y}: k₁ = f(t, y) = ${k1}. ` +
        `El siguiente valor es y + h·k₁ = ${y} + ${h}·${k1}.`
      );
    }

    const k1 = fila['k1'];
    if (k1 === '') {
      return `Fin del intervalo: t = ${t}, y = ${y}.`;
    }
    return (
      `Paso en t = ${t}, y = ${y}: k₁ = ${k1}, k₂ = ${fila['k2']}, k₃ = ${fila['k3']}, ` +
      `k₄ = ${fila['k4']}. Se combinan con y + (h/6)(k₁ + 2k₂ + 2k₃ + k₄), con h = ${h}.`
    );
  });

  protected readonly total = computed(() => this.estado()?.filas.length ?? 0);

  protected alCalcular(escrito: Record<string, string>): void {
    this.store.guardarValores(this.metodo(), escrito);
    const estado = this.calcular(this.metodo(), escrito);
    this.store.guardar(this.metodo(), estado);
    this.paso.set(0);
  }

  protected alCambiarValores(valores: Record<string, string>): void {
    this.store.guardarValores(this.metodo(), valores);
  }

  protected alCambiarPaso(paso: number): void {
    this.paso.set(paso);
  }

  protected alLimpiar(): void {
    this.store.limpiar(this.metodo());
    this.paso.set(0);
  }

  /* ---------------------------------------------------------------- */
  /* Comparación y convergencia                                        */
  /* ---------------------------------------------------------------- */

  /** Comparación Euler vs RK4 con los mismos datos, si hay un cálculo. */
  protected readonly comparacion = computed(() => {
    const e = this.estado();
    if (!e) return null;
    const compilada = compilarF(e.datos.funcion);
    if (!compilada.f) return null;
    const exacta = compilarExacta(e.datos.exacta);

    const comun = {
      f: compilada.f,
      t0: e.datos.t0,
      y0: e.datos.y0,
      h: e.datos.h,
      tFin: e.datos.tFin,
      exacta,
    };
    const eu = eulerExplicito(comun);
    const rk = rungeKutta4(comun);
    if (eu.mensaje || rk.mensaje) return null;

    return [
      { metodo: 'Euler', valor: eu.yFinal, error: eu.errorFinal },
      { metodo: 'RK4', valor: rk.yFinal, error: rk.errorFinal },
    ];
  });

  /** Error vs h para h, h/2 y h/4. Solo si hay solución exacta. */
  protected readonly convergencia = computed(() => {
    const e = this.estado();
    if (!e) return [];
    if (!e.datos.exacta) return [];
    const compilada = compilarF(e.datos.funcion);
    const exacta = compilarExacta(e.datos.exacta);
    if (!compilada.f || !exacta) return [];

    const metodo = this.metodo();
    const filas: { h: string; pasos: number; yFinal: string; error: string; razon: string }[] = [];
    let errorAnterior: number | undefined;

    for (let i = 0; i < 3; i++) {
      const h = e.datos.h / Math.pow(2, i);
      const r =
        metodo === 'euler'
          ? eulerExplicito({ f: compilada.f, t0: e.datos.t0, y0: e.datos.y0, h, tFin: e.datos.tFin, exacta })
          : rungeKutta4({ f: compilada.f, t0: e.datos.t0, y0: e.datos.y0, h, tFin: e.datos.tFin, exacta });

      if (r.mensaje || r.errorFinal === undefined) break;

      const razon =
        errorAnterior !== undefined && r.errorFinal > 0
          ? `×${numero(errorAnterior / r.errorFinal, 2)}`
          : '—';

      filas.push({
        h: numero(h, 8),
        pasos: r.pasos,
        yFinal: numero(r.yFinal, 8),
        error: numero(r.errorFinal, 10),
        razon,
      });
      errorAnterior = r.errorFinal;
    }

    return filas;
  });

  /* ---------------------------------------------------------------- */
  /* CSV                                                               */
  /* ---------------------------------------------------------------- */

  protected descargarCsv(): void {
    const e = this.estado();
    if (!e) return;
    const columnas = this.columnas();
    const encabezado = columnas.map((c) => c.label).join(',');
    const filas = e.filas.map((fila) => columnas.map((c) => fila[c.key] ?? '').join(','));
    descargar(`edo-${this.metodo()}.csv`, [encabezado, ...filas].join('\n'));
  }

  protected async copiarCsv(): Promise<void> {
    const e = this.estado();
    if (!e) return;
    const columnas = this.columnas();
    const encabezado = columnas.map((c) => c.label).join('\t');
    const filas = e.filas.map((fila) => columnas.map((c) => fila[c.key] ?? '').join('\t'));
    const texto = [encabezado, ...filas].join('\n');
    try {
      await navigator.clipboard.writeText(texto);
      this.copiado.set(true);
      setTimeout(() => this.copiado.set(false), 2000);
    } catch {
      this.copiado.set(false);
    }
  }

  /* ---------------------------------------------------------------- */
  /* Cálculo                                                           */
  /* ---------------------------------------------------------------- */

  private calcular(metodo: MetodoCalculadora, escrito: Record<string, string>): EstadoCalculadoraEdo {
    const t0 = Number(escrito['t0']);
    const y0 = Number(escrito['y0']);
    const h = Number(escrito['h']);
    const tFin = Number(escrito['tFin']);
    const funcion = escrito['funcion'] ?? '';
    const exactaTexto = (escrito['exacta'] ?? '').trim();

    const datos: DatosModulo5 = {
      funcion,
      t0,
      y0,
      h,
      tFin,
      exacta: exactaTexto === '' ? undefined : exactaTexto,
    };

    const fallo = (mensaje: string): EstadoCalculadoraEdo => ({
      datos,
      filas: [],
      filasOcultas: 0,
      pasos: 0,
      yFinal: 0,
      respuesta: { exito: false, conclusion: mensaje },
    });

    if (![t0, y0, h, tFin].every((v) => Number.isFinite(v))) {
      return fallo('t₀, y₀, h y t final tienen que ser números.');
    }
    if (h <= 0) return fallo('El paso h tiene que ser mayor que 0.');
    if (tFin <= t0) return fallo('El instante final tiene que ser mayor que t₀.');

    const compilada = compilarF(funcion);
    if (!compilada.f) return fallo(compilada.error ?? 'No se pudo interpretar f(t, y).');

    let exacta: ((t: number) => number) | undefined;
    if (exactaTexto !== '') {
      exacta = compilarExacta(exactaTexto);
      if (!exacta) {
        return fallo(
          'No se pudo interpretar la solución exacta. Dejala vacía o escribila con t, por ejemplo exp(t).',
        );
      }
    }

    const comun = { f: compilada.f, t0, y0, h, tFin, exacta };

    const r =
      metodo === 'euler'
        ? (() => {
            const res = eulerExplicito(comun);
            return {
              mensaje: res.mensaje,
              filas: filasDeEuler(res),
              pasos: res.pasos,
              yFinal: res.yFinal,
              exactaFinal: res.exactaFinal,
              errorFinal: res.errorFinal,
              errorRel: res.errorRel,
            };
          })()
        : (() => {
            const res = rungeKutta4(comun);
            return {
              mensaje: res.mensaje,
              filas: filasDeRk4(res),
              pasos: res.pasos,
              yFinal: res.yFinal,
              exactaFinal: res.exactaFinal,
              errorFinal: res.errorFinal,
              errorRel: res.errorRel,
            };
          })();

    if (r.mensaje) return fallo(r.mensaje);

    const filas = r.filas.slice(0, 1000);
    const filasOcultas = Math.max(0, r.filas.length - filas.length);

    return {
      datos,
      filas,
      filasOcultas,
      pasos: r.pasos,
      yFinal: r.yFinal,
      exactaFinal: r.exactaFinal,
      errorFinal: r.errorFinal,
      errorRel: r.errorRel,
      respuesta: armarRespuestaEdo(metodo === 'euler' ? 'Euler' : 'RK4', datos, r),
    };
  }
}

/* ------------------------------------------------------------------ */
/* Utilidades                                                          */
/* ------------------------------------------------------------------ */

function descargar(nombre: string, contenido: string): void {
  const blob = new Blob([contenido], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = nombre;
  a.click();
  URL.revokeObjectURL(url);
}
