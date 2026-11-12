import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TeoriaErrorVista } from '../shared/teoria-error/teoria-error';
import { datosDeRuta } from '../shared/datos-ruta';
import type { Columna } from '../../../shared/models/metodo.model';
import type { TeoriaError } from '../modelos/modulo0.model';

/**
 * Pestaña Teoría. La teoría y las columnas llegan por `data` desde el
 * archivo de rutas del método, que se carga en diferido: el contenido de
 * un método no entra al bundle hasta que el alumno lo abre.
 */
@Component({
  selector: 'app-m0-tab-teoria',
  standalone: true,
  imports: [TeoriaErrorVista],
  template: `<app-m0-teoria-error [teoria]="teoria" [columnas]="columnas" />`,
})
export class TabTeoriaModulo0 {
  private readonly route = inject(ActivatedRoute);
  private readonly datos = datosDeRuta(this.route);
  readonly teoria = this.datos['teoria'] as TeoriaError;
  readonly columnas = this.datos['columnas'] as Columna[];
}
