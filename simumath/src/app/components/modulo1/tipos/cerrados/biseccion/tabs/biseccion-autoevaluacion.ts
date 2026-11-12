import { crearBancoRaices } from '../../../../autoevaluacion/bancos/crear-banco';
import { SesionPracticaService } from '../../../../../../shared/practica-guiada/sesion-practica.service';
import { Component, computed, inject } from '@angular/core';
import { EJERCICIOS_BISECCION } from '../biseccion.contenido';
import { COLUMNAS_BISECCION } from '../biseccion.config';
import { BiseccionService, type BiseccionEstado } from '../biseccion.service';
import { dibujarBiseccion } from '../biseccion.grafico';
import { BloqueEjercicio } from '../../../../../../shared/domain/bloque-ejercicio/bloque-ejercicio';
import { autoevaluacionMejoradaM1, politicaDeMetodoM1 } from '../../../../autoevaluacion.config';
import { AUTOEVALUACION_BISECCION } from '../biseccion.autoevaluacion';

/** Autoevaluación con banco aleatorio y recorrido matemático visual. */
@Component({
  selector: 'app-biseccion-autoevaluacion',
  standalone: true,
  imports: [BloqueEjercicio],
  templateUrl: './biseccion-autoevaluacion.html',
  styleUrl: './biseccion-autoevaluacion.scss',
})
export class BiseccionAutoevaluacion {
  private readonly servicio = inject(BiseccionService);

  /** Banco completo y tanda conservada durante la sesión. */
  private readonly sesion = inject(SesionPracticaService);
  readonly banco = crearBancoRaices(EJERCICIOS_BISECCION.map((e) => ({
    ...e,
    ...(AUTOEVALUACION_BISECCION[e.id] ?? {}),
  })), 'biseccion');
  readonly ejercicios = this.sesion.tanda('modulo1/biseccion', this.banco);
  nuevaTanda(): void {
    this.sesion.renovar('modulo1/biseccion', this.banco);
  }

  readonly mejorada = autoevaluacionMejoradaM1('cerrados', 'biseccion');
  readonly desbloqueoBase = politicaDeMetodoM1('cerrados', 'biseccion');

  readonly columnas = COLUMNAS_BISECCION;
  readonly dibujar = dibujarBiseccion;

  /** Los cálculos se actualizan únicamente cuando cambia la tanda. */
  protected readonly calculos = computed(() => this.ejercicios().map(e => this.servicio.calcularEjemplo(e)));


  protected calculoDe(indice: number): BiseccionEstado {
    return this.calculos()[indice];
  }

  protected funcionDe(indice: number): (x: number) => number {
    return this.servicio.funcionDeEjemplo(this.ejercicios()[indice]);
  }

  protected rangoDe(indice: number): { min: number; max: number } {
    return this.servicio.rangoPara(this.ejercicios()[indice].calculo);
  }
}