import { Component, computed, inject, signal } from '@angular/core';
import { TEORIA_GAUSS } from '../gauss.contenido';
import { COLUMNAS_GAUSS } from '../gauss.config';
import { GaussService } from '../gauss.service';
import { dibujarGauss } from '../gauss.grafico';
import { BloqueEjemplo } from '../../../../../../shared/domain/bloque-ejemplo/bloque-ejemplo';
import { GraficoSistema } from '../../../../../../shared/domain/grafico-sistema/grafico-sistema';
import { TeoriaContenido } from '../../../../../../shared/domain/teoria-contenido/teoria-contenido';

/**
 * Pestaña de TEORÍA de la eliminación gaussiana.
 *
 * ── Cómo se arma la pantalla ──────────────────────────────────────────
 * Son dos bloques de ejemplo: el numérico y el de casuística. Cada uno
 * muestra el texto de arriba, el gráfico de las rectas y la tabla de
 * pasos.
 *
 * Los pasos, el residuo y la solución NO están escritos en el contenido:
 * se calculan con el motor (`ejecutarGauss`) a través del servicio. Es
 * lo que garantiza que el texto y la tabla no puedan contradecirse: si
 * cambia el algoritmo, cambian los dos juntos.
 *
 * ── El gráfico y el paso actual ───────────────────────────────────────
 * Cada bloque tiene su propio índice de paso. El bloque de ejemplo es
 * el que lo maneja (lo mueven sus botones) y avisa con `pasoCambiado`;
 * acá se guarda para pasárselo al gráfico, que dibuja las rectas
 * auxiliares a medida que se despeja la solución.
 */
@Component({
  selector: 'app-gauss-teoria',
  standalone: true,
  imports: [BloqueEjemplo, GraficoSistema, TeoriaContenido],
  templateUrl: './gauss-teoria.html',
  styleUrl: './gauss-teoria.scss',
})
export class GaussTeoria {
  readonly teoria = TEORIA_GAUSS;
  readonly columnas = COLUMNAS_GAUSS;
  readonly dibujar = dibujarGauss;

  private readonly servicio = inject(GaussService);

  /** El estado del ejemplo numérico, ya calculado por el motor. */
  readonly ejemploNumerico = signal(
    this.servicio.calcularEjemplo(TEORIA_GAUSS.ejemploNormal),
  );

  /** El estado del ejemplo de casuística. */
  readonly ejemploCasuistica = signal(
    this.servicio.calcularEjemplo(TEORIA_GAUSS.ejemploCasuistica),
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

}
