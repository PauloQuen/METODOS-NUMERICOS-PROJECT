import { crearBancoRaices } from '../../../../autoevaluacion/bancos/crear-banco';
import { SesionPracticaService } from '../../../../../../shared/practica-guiada/sesion-practica.service';
import { CabeceraPractica } from '../../../../../../shared/practica-guiada/cabecera-practica';
import { Component, computed, inject } from '@angular/core';
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
  imports: [BloqueEjercicio, CabeceraPractica],
  templateUrl: './cardano-autoevaluacion.html',
  styleUrl: './cardano-autoevaluacion.scss',
})
export class CardanoAutoevaluacion {
  private readonly practica = inject(SesionPracticaService);
  readonly banco = crearBancoRaices(EJERCICIOS_CARDANO.map((e) => ({
    ...e,
    ...(AUTOEVALUACION_CARDANO[e.id] ?? {}),
  })), 'cardano');
  readonly ejercicios = this.practica.tanda('modulo1:cardano', this.banco);

  readonly mejorada = autoevaluacionMejoradaM1('polinomios', 'cardano');
  readonly desbloqueoBase = politicaDeMetodoM1('polinomios', 'cardano');
  readonly columnas = COLUMNAS_CARDANO;
  readonly dibujar = dibujarCardano;

  private readonly servicio = inject(CardanoService);

  protected readonly estados = computed(() => this.ejercicios().map((e) => this.servicio.calcularEjemplo(e)));

  protected readonly funciones = computed(() => this.ejercicios().map((e) => this.servicio.funcionDeEjemplo(e)));

  protected readonly rangos = computed(() =>
    this.ejercicios().map((e, i) => this.servicio.rangoPara(this.estados()[i].raices)),
  );

  nuevaTanda(): void {
    this.practica.renovar('modulo1:cardano', this.banco);
  }
}
