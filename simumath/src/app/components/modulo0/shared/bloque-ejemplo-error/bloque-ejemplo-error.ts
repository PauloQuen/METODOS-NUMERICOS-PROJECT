import { Component, computed, input } from '@angular/core';
import { UiCard } from '../../../../shared/ui/ui-card/ui-card';
import { IterationTable } from '../../../../shared/domain/iteration-table/iteration-table';
import type { Columna } from '../../../../shared/models/metodo.model';
import type { EjemploError } from '../../modelos/modulo0.model';

/**
 * TARJETA DE UN EJEMPLO DEL MÓDULO 0.
 *
 * ── Por qué no se reutiliza `app-bloque-ejemplo` ─────────────────────
 * Ese bloque dibuja un gráfico de función y una tabla de iteraciones:
 * las dos cosas tienen sentido cuando se busca una raíz. Un error es un
 * escalar, no una curva; poner un gráfico vacío sería peor que no
 * ponerlo. Lo que sí se reutiliza es todo lo genérico: `ui-card`, la
 * tabla de iteraciones y el patrón visual de "Planteamiento".
 *
 * La tabla NO se calcula acá: viene resuelta en el contenido del método
 * y está verificada por separado. El componente solo la muestra.
 */
@Component({
  selector: 'app-m0-bloque-ejemplo-error',
  standalone: true,
  imports: [UiCard, IterationTable],
  templateUrl: './bloque-ejemplo-error.html',
  styleUrl: './bloque-ejemplo-error.scss',
})
export class BloqueEjemploError {
  readonly ejemplo = input.required<EjemploError>();

  /** Columnas de la tabla de cuentas, definidas por el método. */
  readonly columnas = input<Columna[]>([]);

  readonly esCasuistica = computed(() => this.ejemplo().tipo === 'casuistica');

  /** Filas ya resueltas del ejemplo. */
  readonly filas = computed(() => this.ejemplo().tabla.filas);
}
