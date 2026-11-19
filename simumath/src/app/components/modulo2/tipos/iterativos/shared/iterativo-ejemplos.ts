import { Component, inject } from '@angular/core';
import { METODO_ITERATIVO, CONFIG_ITERATIVOS } from './iterativo.config';
import { ejemplosIterativos } from './iterativo.contenido';
import { EjemploIterativo } from './iterativo-ejemplo';

@Component({
  selector: 'app-iterativo-ejemplos', standalone: true, imports: [EjemploIterativo],
  template: `
    <div class="lista-m2-tab">
      <header class="lista-m2-tab__encabezado"><h2 class="lista-m2-tab__titulo">Ejemplos de {{ nombre }}</h2>
        <p class="lista-m2-tab__intro">Dos problemas numéricos y dos de aplicación. Sigue los despejes, compara los vectores anterior y nuevo, y recorre la curva de convergencia con los controles de estados.</p>
      </header>
      @for (ejemplo of ejemplos; track ejemplo.id) {
        <section class="lista-m2-tab__bloque"><app-ejemplo-iterativo [ejemplo]="ejemplo" /></section>
      }
    </div>
  `,
  styleUrl: '../../../shared/estilos/lista.scss',
})
export class IterativoEjemplos {
  readonly metodo = inject(METODO_ITERATIVO);
  readonly nombre = CONFIG_ITERATIVOS[this.metodo].nombre;
  readonly ejemplos = ejemplosIterativos(this.metodo);
}
