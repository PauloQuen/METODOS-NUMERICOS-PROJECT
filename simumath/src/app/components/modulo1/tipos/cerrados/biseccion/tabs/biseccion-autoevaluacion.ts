import { crearBancoRaices } from '../../../../autoevaluacion/bancos/crear-banco';
import { SesionPracticaService } from '../../../../../../shared/practica-guiada/sesion-practica.service';
import { CabeceraPractica } from '../../../../../../shared/practica-guiada/cabecera-practica';
import { Component, computed, inject } from '@angular/core';
import { EJERCICIOS_BISECCION } from '../biseccion.contenido';
import { COLUMNAS_BISECCION } from '../biseccion.config';
import { BiseccionService, type BiseccionEstado } from '../biseccion.service';
import { dibujarBiseccion } from '../biseccion.grafico';
import { BloqueEjercicio } from '../../../../../../shared/domain/bloque-ejercicio/bloque-ejercicio';
import { autoevaluacionMejoradaM1, politicaDeMetodoM1 } from '../../../../autoevaluacion.config';
import { AUTOEVALUACION_BISECCION } from '../biseccion.autoevaluacion';

/** Autoevaluación por tandas: tres ejercicios numéricos y tres de aplicación. */
@Component({
  selector: 'app-biseccion-autoevaluacion',
  standalone: true,
  imports: [BloqueEjercicio, CabeceraPractica],
  templateUrl: './biseccion-autoevaluacion.html',
  styleUrl: './biseccion-autoevaluacion.scss',
})
export class BiseccionAutoevaluacion {
  private readonly servicio = inject(BiseccionService);

  /** Banco completo y selección conservada durante la sesión. */
  private readonly practica = inject(SesionPracticaService);
  readonly banco = crearBancoRaices(EJERCICIOS_BISECCION.map((e) => ({
    ...e,
    ...(AUTOEVALUACION_BISECCION[e.id] ?? {}),
  })), 'biseccion');
  readonly ejercicios = this.practica.tanda('modulo1:biseccion', this.banco);

  readonly mejorada = autoevaluacionMejoradaM1('cerrados', 'biseccion');
  readonly desbloqueoBase = politicaDeMetodoM1('cerrados', 'biseccion');

  readonly columnas = COLUMNAS_BISECCION;
  readonly dibujar = dibujarBiseccion;

  /** Se recalcula únicamente cuando cambia la tanda. */
  protected readonly calculos = computed<BiseccionEstado[]>(() => this.ejercicios().map((e) =>
    this.servicio.calcularEjemplo(e),
  ));


  protected calculoDe(indice: number): BiseccionEstado {
    return this.calculos()[indice];
  }

  protected funcionDe(indice: number): (x: number) => number {
    return this.servicio.funcionDeEjemplo(this.ejercicios()[indice]);
  }

  protected rangoDe(indice: number): { min: number; max: number } {
    return this.servicio.rangoPara(this.ejercicios()[indice].calculo);
  }

  nuevaTanda(): void {
    this.practica.renovar('modulo1:biseccion', this.banco);
  }
}
