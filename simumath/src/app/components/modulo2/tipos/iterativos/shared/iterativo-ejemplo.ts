import { Component, computed, inject, input, signal } from '@angular/core';
import { BloqueEjemplo } from '../../../../../shared/domain/bloque-ejemplo/bloque-ejemplo';
import type { EjercicioSistema } from '../../../../../shared/models/sistema.model';
import type { ConGuia } from '../../../../../shared/practica-guiada/modelos';
import { resolverIterativo } from './iterativo.algoritmo';
import { columnasIterativas, filasIterativas, METODO_ITERATIVO, numero, vector, CONFIG_ITERATIVOS } from './iterativo.config';
import { GraficoIterativo } from './grafico-iterativo';

@Component({
  selector: 'app-ejemplo-iterativo', standalone: true, imports: [BloqueEjemplo, GraficoIterativo],
  template: `
    <app-bloque-ejemplo [ejemplo]="ejemplo()" [etapas]="ejemplo().guia" [formatoMatricial]="true"
      [columnas]="columnas()" [filas]="filas()" [filaFinal]="resultado().convergio ? filas().length - 1 : undefined"
      highlightBadge="Cumple tolerancia" [textosPasos]="textos()" tituloPasos="Desarrollo de las barridas"
      etiquetaPaso="Estado" tituloCriterio="Cambio y residuo" (pasoCambiado)="paso.set($event)">
      <app-grafico-iterativo slot="grafico" [resultado]="resultado()" [paso]="paso()"
        [tolerancia]="ejemplo().calculo.tol ?? 0.000001" [nombre]="nombre" />
    </app-bloque-ejemplo>
  `,
})
export class EjemploIterativo {
  readonly metodo = inject(METODO_ITERATIVO);
  readonly nombre = CONFIG_ITERATIVOS[this.metodo].nombre;
  readonly ejemplo = input.required<ConGuia<EjercicioSistema>>();
  readonly paso = signal(0);
  readonly resultado = computed(() => resolverIterativo(this.ejemplo().calculo, this.metodo));
  readonly filas = computed(() => filasIterativas(this.resultado()));
  readonly columnas = computed(() => columnasIterativas(this.ejemplo().calculo.A.length));
  readonly textos = computed(() => {
    const r = this.resultado();
    return [...(r.inicial ? [r.inicial] : []), ...r.iteracionesDetalle].map(f =>
      `${f.k === 0 ? 'Vector inicial' : `Iteración ${f.k}`}: x = ${vector(f.x)}. Residuo relativo η = ${numero(f.residuoRelativo)}.`);
  });
}
