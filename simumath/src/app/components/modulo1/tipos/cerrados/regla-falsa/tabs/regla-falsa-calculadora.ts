import { Component, computed, inject, signal } from '@angular/core';
import { ReglaFalsaService } from '../regla-falsa.service';
import { CAMPOS_CALCULADORA, COLUMNAS_REGLA_FALSA, DATOS_POR_DEFECTO } from '../regla-falsa.config';
import { dibujarReglaFalsa } from '../regla-falsa.grafico';
import { CalculadoraShell } from '../../../../../../shared/domain/calculadora-shell/calculadora-shell';
import { IterationTable } from '../../../../../../shared/domain/iteration-table/iteration-table';
import { PasosControl } from '../../../../../../shared/domain/pasos-control/pasos-control';
import { GraficoMetodo } from '../../../../../../shared/domain/grafico-metodo/grafico-metodo';
import { UiCard } from '../../../../../../shared/ui/ui-card/ui-card';

@Component({
  selector: 'app-regla-falsa-calculadora',
  standalone: true,
  imports: [CalculadoraShell, IterationTable, PasosControl, GraficoMetodo, UiCard],
  templateUrl: './regla-falsa-calculadora.html',
  styleUrl: './regla-falsa-calculadora.scss',
})
export class ReglaFalsaCalculadora {
  private readonly servicio = inject(ReglaFalsaService);

  readonly campos = CAMPOS_CALCULADORA;
  readonly columnas = COLUMNAS_REGLA_FALSA;
  readonly dibujar = dibujarReglaFalsa;

  protected readonly estado = this.servicio.resultado;
  protected readonly valores = signal<Record<string, string>>({});
  protected readonly paso = signal(0);
  protected readonly funcion = signal<(x: number) => number>(() => 0);
  protected readonly rango = signal<{ min: number; max: number }>({ min: -5, max: 5 });

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

  protected alCambiarPaso(paso: number): void {
    this.paso.set(paso);
  }

  protected alLimpiar(): void {
    this.servicio.limpiar();
    this.valores.set({});
    this.paso.set(0);
  }

  protected readonly total = computed(() => this.estado()?.filas.length ?? 0);

  protected readonly textoDelPaso = computed(() => {
    const e = this.estado();
    if (!e) return '';

    const fila = e.filas[this.paso()];
    if (!fila) return '';

    const n = fila['n'];
    const c = fila['c'];
    const fc = fila['fc'];
    const delta = fila['delta'];
    const ultima = e.filaFinal === this.paso();

    const base = `Iteración ${n}: c = ${c}, f(c) = ${fc}, |Δc| = ${delta}.`;

    return ultima
      ? `${base} Esta es la última: se cumplió el criterio de parada.`
      : `${base} Como f(c) no es cero todavía, se renueva un extremo y se traza una nueva cuerda.`;
  });
}

function aNumero(texto: string | undefined, porDefecto: number | undefined): number {
  if (texto === undefined || texto.trim() === '') return porDefecto ?? 0;
  return Number(texto);
}
