import { Component, inject } from '@angular/core';
import { TeoriaContenido } from '../../../../../shared/domain/teoria-contenido/teoria-contenido';
import { METODO_ITERATIVO } from './iterativo.config';
import { ejemplosIterativos, teoriaIterativa } from './iterativo.contenido';
import { EjemploIterativo } from './iterativo-ejemplo';

@Component({
  selector: 'app-iterativo-teoria', standalone: true, imports: [TeoriaContenido, EjemploIterativo],
  template: `
    <app-teoria-contenido [teoria]="teoria" [terceraTexto]="teoria.precision"
      terceraTitulo="Convergencia, cambio y residuo" terceraIcono="straighten"
      tituloMetodo="Cómo se realiza una barrida" tituloCriterios="Qué se comprueba">
      <section class="teoria-m3__seccion"><h2 class="teoria-m3__titulo">Ejemplo numérico resuelto</h2>
        <app-ejemplo-iterativo [ejemplo]="ejemplos[0]" />
      </section>
      <section class="teoria-m3__seccion"><h2 class="teoria-m3__titulo">Ejemplo de aplicación</h2>
        <app-ejemplo-iterativo [ejemplo]="ejemplos[2]" />
      </section>
    </app-teoria-contenido>
  `,
})
export class IterativoTeoria {
  readonly metodo = inject(METODO_ITERATIVO);
  readonly teoria = teoriaIterativa(this.metodo);
  readonly ejemplos = ejemplosIterativos(this.metodo);
}
