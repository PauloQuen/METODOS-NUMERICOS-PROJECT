import { crearBancoRaices } from '../../../../autoevaluacion/bancos/crear-banco';
import { SesionPracticaService } from '../../../../../../shared/practica-guiada/sesion-practica.service';
import { Component, computed, inject } from '@angular/core';
import { EJERCICIOS_PUNTO_FIJO } from '../punto-fijo.contenido';
import { COLUMNAS_PUNTO_FIJO } from '../punto-fijo.config';
import { PuntoFijoService } from '../punto-fijo.service';
import { BloqueEjercicio } from '../../../../../../shared/domain/bloque-ejercicio/bloque-ejercicio';
import { autoevaluacionMejoradaM1, politicaDeMetodoM1 } from '../../../../autoevaluacion.config';
import { AUTOEVALUACION_PUNTO_FIJO } from '../punto-fijo.autoevaluacion';
import { dibujarPuntoFijo } from '../punto-fijo.grafico';

@Component({
  selector: 'app-punto-fijo-autoevaluacion',
  standalone: true,
  imports: [BloqueEjercicio],
  templateUrl: './punto-fijo-autoevaluacion.html',
  styleUrl: './punto-fijo-autoevaluacion.scss',
})
export class PuntoFijoAutoevaluacion {
  private readonly sesion = inject(SesionPracticaService);
  readonly banco = crearBancoRaices(EJERCICIOS_PUNTO_FIJO.map((e) => ({
    ...e,
    ...(AUTOEVALUACION_PUNTO_FIJO[e.id] ?? {}),
  })), 'punto-fijo');
  readonly ejercicios = this.sesion.tanda('modulo1/punto-fijo', this.banco);
  nuevaTanda(): void {
    this.sesion.renovar('modulo1/punto-fijo', this.banco);
  }

  readonly mejorada = autoevaluacionMejoradaM1('abiertos', 'punto-fijo');
  readonly desbloqueoBase = politicaDeMetodoM1('abiertos', 'punto-fijo');
  readonly columnas = COLUMNAS_PUNTO_FIJO;
  readonly dibujar = dibujarPuntoFijo;

  private readonly servicio = inject(PuntoFijoService);

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