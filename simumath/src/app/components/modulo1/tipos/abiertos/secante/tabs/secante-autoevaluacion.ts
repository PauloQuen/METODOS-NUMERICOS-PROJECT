import { crearBancoRaices } from '../../../../autoevaluacion/bancos/crear-banco';
import { SesionPracticaService } from '../../../../../../shared/practica-guiada/sesion-practica.service';
import { Component, computed, inject } from '@angular/core';
import { EJERCICIOS_SECANTE } from '../secante.contenido';
import { COLUMNAS_SECANTE } from '../secante.config';
import { SecanteService } from '../secante.service';
import { BloqueEjercicio } from '../../../../../../shared/domain/bloque-ejercicio/bloque-ejercicio';
import { autoevaluacionMejoradaM1, politicaDeMetodoM1 } from '../../../../autoevaluacion.config';
import { AUTOEVALUACION_SECANTE } from '../secante.autoevaluacion';
import { dibujarSecante } from '../secante.grafico';

@Component({
  selector: 'app-secante-autoevaluacion',
  standalone: true,
  imports: [BloqueEjercicio],
  templateUrl: './secante-autoevaluacion.html',
  styleUrl: './secante-autoevaluacion.scss',
})
export class SecanteAutoevaluacion {
  private readonly sesion = inject(SesionPracticaService);
  readonly banco = crearBancoRaices(EJERCICIOS_SECANTE.map((e) => ({
    ...e,
    ...(AUTOEVALUACION_SECANTE[e.id] ?? {}),
  })), 'secante');
  readonly ejercicios = this.sesion.tanda('modulo1/secante', this.banco);
  nuevaTanda(): void {
    this.sesion.renovar('modulo1/secante', this.banco);
  }

  readonly mejorada = autoevaluacionMejoradaM1('abiertos', 'secante');
  readonly desbloqueoBase = politicaDeMetodoM1('abiertos', 'secante');
  readonly columnas = COLUMNAS_SECANTE;
  readonly dibujar = dibujarSecante;

  private readonly servicio = inject(SecanteService);

  protected readonly estados = computed(() =>
    this.ejercicios().map((e) => this.servicio.calcularEjemplo(e)),
  );

  protected readonly funciones = computed(() => this.ejercicios().map((e) =>
    this.servicio.funcionDeEjemplo(e),
  ));

  protected readonly rangos = computed(() =>
    this.ejercicios().map((e, i) =>
      this.servicio.rangoPara(e.calculo, this.estados()[i].raiz),
    ),
  );
}
