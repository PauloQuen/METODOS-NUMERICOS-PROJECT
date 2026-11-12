import { Component, computed, inject, signal } from '@angular/core';
import { EJERCICIOS_CARDANO } from '../cardano.contenido';
import { COLUMNAS_CARDANO } from '../cardano.config';
import { CardanoService } from '../cardano.service';
import { BloqueEjercicio } from '../../../../../../shared/domain/bloque-ejercicio/bloque-ejercicio';
import { autoevaluacionMejoradaM1, politicaDeMetodoM1 } from '../../../../autoevaluacion.config';
import { AUTOEVALUACION_CARDANO } from '../cardano.autoevaluacion';
import { dibujarCardano } from '../cardano.grafico';

@Component({
  selector: 'app-cardano-autoevaluacion',
  standalone: true,
  imports: [BloqueEjercicio],
  templateUrl: './cardano-autoevaluacion.html',
  styleUrl: './cardano-autoevaluacion.scss',
})
export class CardanoAutoevaluacion {
  readonly ejercicios = EJERCICIOS_CARDANO.map((e) => ({
    ...e,
    ...(AUTOEVALUACION_CARDANO[e.id] ?? {}),
  }));

  readonly mejorada = autoevaluacionMejoradaM1('polinomios', 'cardano');
  readonly desbloqueoBase = politicaDeMetodoM1('polinomios', 'cardano');
  readonly columnas = COLUMNAS_CARDANO;
  readonly dibujar = dibujarCardano;

  private readonly servicio = inject(CardanoService);

  protected readonly estados = signal(this.ejercicios.map((e) => this.servicio.calcularEjemplo(e)));

  protected readonly funciones = this.ejercicios.map((e) => this.servicio.funcionDeEjemplo(e));

  protected readonly rangos = computed(() =>
    this.ejercicios.map((e, i) => this.servicio.rangoPara(this.estados()[i].raices)),
  );
}
