import { crearBancoSistemas } from '../../../../autoevaluacion/crear-banco';
import { SesionPracticaService } from '../../../../../../shared/practica-guiada/sesion-practica.service';
import { Component, computed, inject, signal } from '@angular/core';
import { EJERCICIOS_GAUSS } from '../gauss.contenido';
import { COLUMNAS_GAUSS } from '../gauss.config';
import { GaussService } from '../gauss.service';
import { dibujarGauss } from '../gauss.grafico';
import { BloqueEjercicio } from '../../../../../../shared/domain/bloque-ejercicio/bloque-ejercicio';
import { autoevaluacionMejoradaM2, politicaDeMetodoM2 } from '../../../../autoevaluacion.config';
import { AUTOEVALUACION_GAUSS } from '../gauss.autoevaluacion';

/** Autoevaluación con banco aleatorio y recorrido matemático visual. */
@Component({
  selector: 'app-gauss-autoevaluacion',
  standalone: true,
  imports: [BloqueEjercicio],
  templateUrl: './gauss-autoevaluacion.html',
  styleUrl: './gauss-autoevaluacion.scss',
})
export class GaussAutoevaluacion {
  private readonly sesion = inject(SesionPracticaService);
  readonly banco = crearBancoSistemas(EJERCICIOS_GAUSS.map((e) => ({
    ...e,
    ...(AUTOEVALUACION_GAUSS[e.id] ?? {}),
  })), 'gauss');
  readonly ejercicios = this.sesion.tanda('modulo2/gauss', this.banco);
  nuevaTanda(): void {
    this.sesion.renovar('modulo2/gauss', this.banco);
    this.pasos.set(this.ejercicios().map(() => 0));
  }

  readonly mejorada = autoevaluacionMejoradaM2('directos', 'gauss');
  readonly desbloqueoBase = politicaDeMetodoM2('directos', 'gauss');
  readonly columnas = COLUMNAS_GAUSS;
  readonly dibujar = dibujarGauss;

  private readonly servicio = inject(GaussService);

  /** El estado calculado de cada ejercicio, en el mismo orden. */
  readonly estados = computed(() =>
    this.ejercicios().map((e) => this.servicio.calcularEjemplo(e)),
  );

  /** El paso actual de cada ejercicio, en el mismo orden. */
  readonly pasos = signal<number[]>(this.ejercicios().map(() => 0));

  /** El rango del gráfico de cada ejercicio. */
  readonly rangos = computed(() =>
    this.estados().map((e) => this.servicio.rangoPara(e.sistema, e.solucion)),
  );

  /** Avisa que el alumno cambió de paso en el ejercicio `indice`. */
  alCambiarPaso(indice: number, nuevo: number): void {
    this.pasos.update((todos) => {
      const copia = [...todos];
      copia[indice] = nuevo;
      return copia;
    });
  }

  /** El paso actual de un ejercicio. */
  pasoDe(indice: number): number {
    return this.pasos()[indice] ?? 0;
  }
}
