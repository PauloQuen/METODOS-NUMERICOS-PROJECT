import { crearBancoRaices } from '../../../../autoevaluacion/bancos/crear-banco';
import { SesionPracticaService } from '../../../../../../shared/practica-guiada/sesion-practica.service';
import { Component, computed, inject } from '@angular/core';
import { EJERCICIOS_REGLA_FALSA } from '../regla-falsa.contenido';
import { COLUMNAS_REGLA_FALSA } from '../regla-falsa.config';
import { ReglaFalsaService } from '../regla-falsa.service';
import { BloqueEjercicio } from '../../../../../../shared/domain/bloque-ejercicio/bloque-ejercicio';
import { autoevaluacionMejoradaM1, politicaDeMetodoM1 } from '../../../../autoevaluacion.config';
import { AUTOEVALUACION_REGLA_FALSA } from '../regla-falsa.autoevaluacion';
import { dibujarReglaFalsa } from '../regla-falsa.grafico';

@Component({
  selector: 'app-regla-falsa-autoevaluacion',
  standalone: true,
  imports: [BloqueEjercicio],
  templateUrl: './regla-falsa-autoevaluacion.html',
  styleUrl: './regla-falsa-autoevaluacion.scss',
})
export class ReglaFalsaAutoevaluacion {
  private readonly sesion = inject(SesionPracticaService);
  readonly banco = crearBancoRaices(EJERCICIOS_REGLA_FALSA.map((e) => ({
    ...e,
    ...(AUTOEVALUACION_REGLA_FALSA[e.id] ?? {}),
  })), 'regla-falsa');
  readonly ejercicios = this.sesion.tanda('modulo1/regla-falsa', this.banco);
  nuevaTanda(): void {
    this.sesion.renovar('modulo1/regla-falsa', this.banco);
  }

  readonly mejorada = autoevaluacionMejoradaM1('cerrados', 'regla-falsa');
  readonly desbloqueoBase = politicaDeMetodoM1('cerrados', 'regla-falsa');
  readonly columnas = COLUMNAS_REGLA_FALSA;
  readonly dibujar = dibujarReglaFalsa;

  private readonly servicio = inject(ReglaFalsaService);

  protected readonly estados = computed(() =>
    this.ejercicios().map((e) => this.servicio.calcularEjemplo(e)),
  );

  protected readonly funciones = computed(() => this.ejercicios().map((e) => this.servicio.funcionDeEjemplo(e)));

  protected readonly rangos = computed(() =>
    this.ejercicios().map((e) => this.servicio.rangoPara(e.calculo)),
  );
}
