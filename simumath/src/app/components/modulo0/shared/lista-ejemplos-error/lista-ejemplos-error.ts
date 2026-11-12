import { Component, input } from '@angular/core';
import { BloqueEjemploError } from '../bloque-ejemplo-error/bloque-ejemplo-error';
import type { Columna } from '../../../../shared/models/metodo.model';
import type { EjemploError } from '../../modelos/modulo0.model';

/** Lista de ejemplos resueltos de un método del Módulo 0. */
@Component({
  selector: 'app-m0-lista-ejemplos',
  standalone: true,
  imports: [BloqueEjemploError],
  templateUrl: './lista-ejemplos-error.html',
  // Misma hoja que las listas del M3.
  styleUrl: '../../../modulo3/shared/estilos/lista.scss',
})
export class ListaEjemplosError {
  readonly ejemplos = input.required<readonly EjemploError[]>();
  readonly columnas = input<Columna[]>([]);
  readonly titulo = input('Ejemplos resueltos');
  readonly intro = input('');
}
