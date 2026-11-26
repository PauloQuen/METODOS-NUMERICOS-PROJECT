import { crearBancoRaices } from '../../../../autoevaluacion/bancos/crear-banco';
import { SesionPracticaService } from '../../../../../../shared/practica-guiada/sesion-practica.service';
import { CabeceraPractica } from '../../../../../../shared/practica-guiada/cabecera-practica';
import { Component, computed, inject } from '@angular/core';
import { EJERCICIOS_NEWTON } from '../newton-raphson.contenido';
import { COLUMNAS_NEWTON } from '../newton-raphson.config';
import { NewtonRaphsonService } from '../newton-raphson.service';
import { BloqueEjercicio } from '../../../../../../shared/domain/bloque-ejercicio/bloque-ejercicio';
import { autoevaluacionMejoradaM1, politicaDeMetodoM1 } from '../../../../autoevaluacion.config';
import { AUTOEVALUACION_NEWTON } from '../newton-raphson.autoevaluacion';
import { dibujarNewtonRaphson } from '../newton-raphson.grafico';

@Component({
  selector: 'app-newton-raphson-autoevaluacion',
  standalone: true,
  imports: [BloqueEjercicio, CabeceraPractica],
  templateUrl: './newton-raphson-autoevaluacion.html',
  styleUrl: './newton-raphson-autoevaluacion.scss',
})
export class NewtonRaphsonAutoevaluacion {
  private readonly practica = inject(SesionPracticaService);
  readonly banco = crearBancoRaices(EJERCICIOS_NEWTON.map((e) => ({
    ...e,
    ...(AUTOEVALUACION_NEWTON[e.id] ?? {}),
  })), 'newton-raphson');
  readonly ejercicios = this.practica.tanda('modulo1:newton-raphson', this.banco);

  readonly mejorada = autoevaluacionMejoradaM1('abiertos', 'newton-raphson');
  readonly desbloqueoBase = politicaDeMetodoM1('abiertos', 'newton-raphson');
  readonly columnas = COLUMNAS_NEWTON;
  readonly dibujar = dibujarNewtonRaphson;

  private readonly servicio = inject(NewtonRaphsonService);

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

  nuevaTanda(): void {
    this.practica.renovar('modulo1:newton-raphson', this.banco);
  }
}
