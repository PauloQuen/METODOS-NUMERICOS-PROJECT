import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ListaEjemplosError } from '../shared/lista-ejemplos-error/lista-ejemplos-error';
import { datosDeRuta } from '../shared/datos-ruta';
import type { Columna } from '../../../shared/models/metodo.model';
import type { EjemploError } from '../modelos/modulo0.model';

/** Pestaña Ejemplos: cuatro ejemplos resueltos (dos numéricos, dos casuísticas). */
@Component({
  selector: 'app-m0-tab-ejemplos',
  standalone: true,
  imports: [ListaEjemplosError],
  template: `
    <app-m0-lista-ejemplos
      [ejemplos]="ejemplos"
      [columnas]="columnas"
      [titulo]="titulo"
      [intro]="intro"
    />
  `,
})
export class TabEjemplosModulo0 {
  private readonly route = inject(ActivatedRoute);
  private readonly datos = datosDeRuta(this.route);
  readonly ejemplos = this.datos['ejemplos'] as EjemploError[];
  readonly columnas = this.datos['columnas'] as Columna[];
  readonly titulo = this.datos['tituloEjemplos'] as string;
  readonly intro = this.datos['introEjemplos'] as string;
}
