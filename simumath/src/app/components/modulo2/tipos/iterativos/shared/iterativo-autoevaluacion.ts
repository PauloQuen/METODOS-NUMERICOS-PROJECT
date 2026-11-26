import { Component, computed, inject, signal } from '@angular/core';
import { BloqueEjercicio } from '../../../../../shared/domain/bloque-ejercicio/bloque-ejercicio';
import { CabeceraPractica } from '../../../../../shared/practica-guiada/cabecera-practica';
import { SesionPracticaService } from '../../../../../shared/practica-guiada/sesion-practica.service';
import { autoevaluacionMejoradaM2, politicaDeMetodoM2 } from '../../../autoevaluacion.config';
import { resolverIterativo } from './iterativo.algoritmo';
import { columnasIterativas, filasIterativas, CONFIG_ITERATIVOS, METODO_ITERATIVO } from './iterativo.config';
import { crearBancoIterativo } from './iterativo.contenido';
import { GraficoIterativo } from './grafico-iterativo';

@Component({
  selector: 'app-iterativo-autoevaluacion', standalone: true, imports: [BloqueEjercicio, CabeceraPractica, GraficoIterativo],
  template: `
    <div class="lista-m2-tab">
      <header class="lista-m2-tab__encabezado"><h2 class="lista-m2-tab__titulo">Autoevaluación de {{ config.nombre }}</h2>
        <app-cabecera-practica [total]="banco.length" (nuevaTanda)="nuevaTanda()" />
      </header>
      @for (ejercicio of ejercicios(); track ejercicio.id; let i = $index) {
        <section class="lista-m2-tab__bloque">
          <app-bloque-ejercicio [ejercicio]="ejercicio" [mejorada]="mejorada" moduloId="modulo2" tipoId="iterativos"
            [metodoId]="metodo" [desbloqueoBase]="politica" [columnas]="vistas()[i].columnas" [filas]="vistas()[i].filas"
            [filaFinal]="vistas()[i].filas.length - 1" highlightBadge="Cumple tolerancia" tituloPasos="Desarrollo de las barridas"
            etiquetaPaso="Estado" tituloCriterio="Cambio y residuo" (pasoCambiado)="cambiarPaso(ejercicio.id, $event)">
            <app-grafico-iterativo slot="grafico" [resultado]="vistas()[i].resultado" [paso]="pasos()[ejercicio.id] ?? 0"
              [tolerancia]="ejercicio.calculo.tol ?? 0.000001" [nombre]="config.nombre" />
          </app-bloque-ejercicio>
        </section>
      }
    </div>
  `,
  styleUrl: '../../../shared/estilos/lista.scss',
})
export class IterativoAutoevaluacion {
  readonly metodo = inject(METODO_ITERATIVO);
  readonly config = CONFIG_ITERATIVOS[this.metodo];
  private readonly practica = inject(SesionPracticaService);
  readonly banco = crearBancoIterativo(this.metodo);
  readonly ejercicios = this.practica.tanda(`modulo2:iterativos:${this.metodo}`, this.banco);
  readonly politica = politicaDeMetodoM2('iterativos', this.metodo);
  readonly mejorada = autoevaluacionMejoradaM2('iterativos', this.metodo);
  readonly pasos = signal<Record<string, number | undefined>>({});
  readonly vistas = computed(() => this.ejercicios().map(e => {
    const resultado = resolverIterativo(e.calculo, this.metodo);
    return { resultado, filas: filasIterativas(resultado), columnas: columnasIterativas(e.calculo.A.length) };
  }));
  cambiarPaso(id: string, paso: number): void { this.pasos.update(p => ({ ...p, [id]: paso })); }
  nuevaTanda(): void { this.practica.renovar(`modulo2:iterativos:${this.metodo}`, this.banco); this.pasos.set({}); }
}
