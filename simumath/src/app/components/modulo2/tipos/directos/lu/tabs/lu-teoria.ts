import { Component, computed, inject, signal } from '@angular/core';
import { TEORIA_LU } from '../lu.contenido';
import { COLUMNAS_LU } from '../lu.config';
import { LuService } from '../lu.service';
import { dibujarLu } from '../lu.grafico';
import { BloqueEjemplo } from '../../../../../../shared/domain/bloque-ejemplo/bloque-ejemplo';
import { GraficoSistema } from '../../../../../../shared/domain/grafico-sistema/grafico-sistema';
import { TeoriaContenido } from '../../../../../../shared/domain/teoria-contenido/teoria-contenido';

/**
 * Pestaña de TEORÍA de la factorización LU.
 *
 * ── Cómo se arma la pantalla ──────────────────────────────────────────
 * Son dos bloques de ejemplo: el numérico y el de casuística. Cada uno
 * muestra el texto de arriba, el gráfico de las rectas y la tabla de
 * pasos.
 *
 * Los pasos, el residuo y la solución NO están escritos en el contenido:
 * se calculan con el motor (`ejecutarLu`) a través del servicio. Es lo
 * que garantiza que el texto y la tabla no puedan contradecirse: si
 * cambia el algoritmo, cambian los dos juntos.
 *
 * ── El gráfico y el paso actual ───────────────────────────────────────
 * Cada bloque tiene su propio índice de paso. El bloque de ejemplo es
 * el que lo maneja (lo mueven sus botones) y avisa con `pasoCambiado`;
 * acá se guarda para pasárselo al gráfico, que dibuja las rectas
 * auxiliares a medida que se despeja la solución.
 *
 * ── El sistema triangular ─────────────────────────────────────────────
 * Es lo que LU tiene y Gauss no: durante la descomposición, el gráfico
 * muestra ADEMÁS el sistema triangular U·x = y, con trazo atenuado. Se
 * ve cómo la segunda recta se aplana y se vuelve horizontal. Después de
 * la descomposición desaparece: a partir de ahí lo que se construye es
 * la solución, no las rectas.
 */
@Component({
  selector: 'app-lu-teoria',
  standalone: true,
  imports: [BloqueEjemplo, GraficoSistema, TeoriaContenido],
  templateUrl: './lu-teoria.html',
  styleUrl: './lu-teoria.scss',
})
export class LuTeoria {
  readonly teoria = TEORIA_LU;
  readonly columnas = COLUMNAS_LU;
  readonly dibujar = dibujarLu;

  private readonly servicio = inject(LuService);

  /** El estado del ejemplo numérico, ya calculado por el motor. */
  readonly ejemploNumerico = signal(
    this.servicio.calcularEjemplo(TEORIA_LU.ejemploNormal),
  );

  /** El estado del ejemplo de casuística. */
  readonly ejemploCasuistica = signal(
    this.servicio.calcularEjemplo(TEORIA_LU.ejemploCasuistica),
  );

  /** En qué paso va el bloque numérico. */
  readonly pasoNumerico = signal(0);
  /** En qué paso va el bloque de casuística. */
  readonly pasoCasuistica = signal(0);

  /** Rango del gráfico del ejemplo numérico. */
  readonly rangoNumerico = computed(() =>
    this.servicio.rangoPara(
      this.ejemploNumerico().sistema,
      this.ejemploNumerico().solucion,
    ),
  );

  /** Rango del gráfico del ejemplo de casuística. */
  readonly rangoCasuistica = computed(() =>
    this.servicio.rangoPara(
      this.ejemploCasuistica().sistema,
      this.ejemploCasuistica().solucion,
    ),
  );

  /**
   * El sistema triangular que se dibuja de apoyo durante la
   * descomposición del ejemplo numérico.
   */
  readonly extraNumerico = computed(() =>
    this.servicio.sistemasExtraDe(this.ejemploNumerico(), this.pasoNumerico()),
  );

  /** Ídem, para el ejemplo de casuística. */
  readonly extraCasuistica = computed(() =>
    this.servicio.sistemasExtraDe(this.ejemploCasuistica(), this.pasoCasuistica()),
  );

}
