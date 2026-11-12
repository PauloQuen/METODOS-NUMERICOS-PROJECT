import { Component, input } from '@angular/core';
import { BloqueEjercicioError } from '../bloque-ejercicio-error/bloque-ejercicio-error';
import type { Columna } from '../../../../shared/models/metodo.model';
import type { EjercicioError } from '../../modelos/modulo0.model';
import type { NivelDesbloqueo } from '../../../../shared/autoevaluacion-mejorada/solution-gate.service';

/** Lista de ejercicios de autoevaluación de un método del Módulo 0. */
@Component({
  selector: 'app-m0-lista-ejercicios',
  standalone: true,
  imports: [BloqueEjercicioError],
  templateUrl: './lista-ejercicios-error.html',
  styleUrl: '../../../modulo3/shared/estilos/lista.scss',
})
export class ListaEjerciciosError {
  readonly ejercicios = input.required<readonly EjercicioError[]>();
  readonly columnas = input<Columna[]>([]);
  readonly titulo = input('Autoevaluación');
  readonly intro = input('');
  readonly tipoId = input('');
  readonly metodoId = input('');
  readonly mejorada = input(true);
  readonly desbloqueoBase = input<readonly NivelDesbloqueo[]>([]);
}
