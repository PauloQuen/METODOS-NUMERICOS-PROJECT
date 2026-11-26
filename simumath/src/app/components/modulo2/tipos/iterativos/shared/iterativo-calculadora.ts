import { Component, computed, inject, signal } from '@angular/core';
import { CalculadoraShell } from '../../../../../shared/domain/calculadora-shell/calculadora-shell';
import { IterationTable } from '../../../../../shared/domain/iteration-table/iteration-table';
import { PasosControl } from '../../../../../shared/domain/pasos-control/pasos-control';
import { GrupoMatrices, type MatrizPresentada } from '../../../../../shared/domain/matriz-vista/grupo-matrices';
import { FormulaMatematica } from '../../../../../shared/practica-guiada/formula-matematica';
import { UiCard } from '../../../../../shared/ui/ui-card/ui-card';
import { CAMPOS_ITERATIVOS, columnasIterativas, numero, vector } from './iterativo.config';
import { cuentasIteracion } from './iterativo.contenido';
import { GraficoIterativo } from './grafico-iterativo';
import type { ResultadoIterativo } from './iterativo.algoritmo';
import { IterativoService } from './iterativo.service';

@Component({
  selector: 'app-iterativo-calculadora', standalone: true,
  imports: [CalculadoraShell, IterationTable, PasosControl, GrupoMatrices, FormulaMatematica, UiCard, GraficoIterativo],
  templateUrl: './iterativo-calculadora.html',
  styleUrl: './iterativo-calculadora.scss',
})
export class IterativoCalculadora {
  readonly servicio = inject(IterativoService);
  readonly campos = CAMPOS_ITERATIVOS;
  readonly numero = numero;
  readonly vector = vector;
  readonly pagina = signal(0);
  readonly tamanoPagina = 50;
  readonly columnas = computed(() => columnasIterativas(this.servicio.datos()?.A.length ?? 0));
  readonly filasPagina = computed(() => this.servicio.filas().slice(this.pagina() * this.tamanoPagina, (this.pagina() + 1) * this.tamanoPagina));
  readonly inicioPagina = computed(() => this.pagina() * this.tamanoPagina);
  readonly finalPagina = computed(() => this.inicioPagina() + this.filasPagina().length);
  readonly ultima = computed(() => this.finalDe(this.servicio.resultado()));
  readonly finalDe = (r: ResultadoIterativo | null) => r?.iteracionesDetalle.at(-1) ?? r?.inicial;
  readonly matricesOriginales = computed<MatrizPresentada[]>(() => {
    const d = this.servicio.datos();
    return d ? [{ titulo: 'A', valores: d.A }, { titulo: 'b', valores: d.b.map(v => [v]) },
      { titulo: 'x⁽⁰⁾', valores: (d.x0 ?? d.b.map(() => 0)).map(v => [v]) }] : [];
  });
  readonly matricesPaso = computed<MatrizPresentada[]>(() => {
    const i = this.servicio.paso(), estados = this.servicio.estados();
    const actual = estados[i];
    if (!actual) return [];
    return [...(i > 0 ? [{ titulo: `x anterior (k = ${i - 1})`, valores: estados[i - 1].x.map(v => [v]) }] : []),
      { titulo: i === 0 ? 'Vector inicial x⁽⁰⁾' : `x nuevo (k = ${i})`, valores: actual.x.map(v => [v]) }];
  });
  readonly cuentas = computed(() => {
    const d = this.servicio.datos(), i = this.servicio.paso(), estados = this.servicio.estados();
    return d && i > 0 && estados[i] ? cuentasIteracion(d.A, d.b, estados[i - 1].x, estados[i].x, this.servicio.metodo) : [];
  });
  readonly textoPaso = computed(() => {
    const f = this.servicio.actual();
    if (!f) return '';
    return f.k === 0 ? `Vector inicial. Residuo relativo η = ${numero(f.residuoRelativo)}.` :
      `Iteración ${f.k}: cambio escalado δ = ${numero(f.cambioRelativo)}; residuo relativo η = ${numero(f.residuoRelativo)}.`;
  });
  calcular(entrada: Record<string, string>): void { this.servicio.calcular(entrada); this.pagina.set(0); }
  limpiar(): void { this.servicio.reiniciar(); this.pagina.set(0); }
  probarDivergencia(): void { this.servicio.probarDivergencia(); this.pagina.set(0); }
  cambiarPaso(paso: number): void {
    const indice = Math.max(0, Math.min(paso, this.servicio.estados().length - 1));
    this.servicio.paso.set(indice); this.pagina.set(Math.floor(indice / this.tamanoPagina));
  }
}
