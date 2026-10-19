import { Component, computed, inject, signal } from '@angular/core';
import { TEORIA_BISECCION } from '../biseccion.contenido';
import { COLUMNAS_BISECCION, DATOS_POR_DEFECTO } from '../biseccion.config';
import { BiseccionService } from '../biseccion.service';
import { UiCard } from '../../../../../../shared/ui/ui-card/ui-card';
import { BloqueEjemplo } from '../../../../../../shared/domain/bloque-ejemplo/bloque-ejemplo';
import { dibujarBiseccion } from '../biseccion.grafico';

/**
 * PESTAÑA DE TEORÍA de Bisección.
 *
 * ── La estructura que pide el enunciado ──────────────────────────────
 *   1. Concepto          qué se está haciendo y por qué
 *   2. Fundamento        el teorema en el que se apoya
 *   3. Cuándo falla      los tres casos en que no funciona
 *   4. Orden de convergencia  qué tan rápido llega
 *   5. La tarjeta del algoritmo: fórmula, pasos, criterios, ventajas
 *   6. Un ejemplo numérico resuelto
 *   7. Un ejemplo de casuística
 *
 * ── El ejemplo se calcula, no se copia ───────────────────────────────
 * La tabla, el gráfico y la conclusión del ejemplo salen de correr el
 * algoritmo. Si el motor cambia, esta pantalla cambia con él. No hay
 * números escritos a mano acá.
 */
@Component({
  selector: 'app-biseccion-teoria',
  standalone: true,
  imports: [UiCard, BloqueEjemplo],
  templateUrl: './biseccion-teoria.html',
  styleUrl: './biseccion-teoria.scss',
})
export class BiseccionTeoria {
  /** La teoría completa, con las 4 secciones y la tarjeta del algoritmo. */
  readonly teoria = TEORIA_BISECCION;

  /** Las columnas de la tabla de iteraciones. */
  readonly columnas = COLUMNAS_BISECCION;

  /** Cómo dibuja bisección sobre el gráfico genérico. */
  readonly dibujar = dibujarBiseccion;

  private readonly servicio = inject(BiseccionService);

  /**
   * El ejemplo numérico ya calculado.
   *
   * Se calcula una vez al construir el componente y se guarda, porque
   * `computed` no debería tener efectos: si el template lo leyera y
   * escribiera en el servicio, se entraría en bucle.
   */
  readonly ejemploNumerico = signal(this.servicio.calcularEjemplo(TEORIA_BISECCION.ejemploNormal));

  readonly ejemploCasuistica = signal(
    this.servicio.calcularEjemplo(TEORIA_BISECCION.ejemploCasuistica),
  );

  /** La función del ejemplo numérico, ya parseada, para el gráfico. */
  protected readonly funcionNumerico = this.servicio.funcionDeEjemplo(
    TEORIA_BISECCION.ejemploNormal,
  );

  protected readonly funcionCasuistica = this.servicio.funcionDeEjemplo(
    TEORIA_BISECCION.ejemploCasuistica,
  );

  /** El rango del eje X del ejemplo numérico, ajustado a su intervalo. */
  protected readonly rangoNumerico = computed(() =>
    this.servicio.rangoPara(DATOS_POR_DEFECTO),
  );

  protected readonly rangoCasuistica = computed(() =>
    this.servicio.rangoPara(TEORIA_BISECCION.ejemploCasuistica.calculo),
  );

  /** Qué sección de la teoría se está expandiendo (acordeón). */
  protected readonly abierta = signal<'fundamento' | 'falla' | 'orden' | null>(null);

  protected alternar(que: 'fundamento' | 'falla' | 'orden'): void {
    this.abierta.update((actual) => (actual === que ? null : que));
  }
}