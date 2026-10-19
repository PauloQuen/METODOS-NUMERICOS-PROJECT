import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Breadcrumb, type TramoBreadcrumb } from '../../../../shared/layout/breadcrumb/breadcrumb';
import { Badge } from '../../../../shared/ui/badge/badge';
import { Btn } from '../../../../shared/ui/btn/btn';
import {
  FAMILIAS,
  metodosDeFamilia,
  resumenDeMetodo,
  rutaDeMetodo,
  type FamiliaKey,
  type FamiliaRegistrada,
  type MetodoRegistrado,
} from '../../../../shared/domain/numerico/registro';

/**
 * PANTALLA B — la lista de métodos de UNA familia.
 * `/modulo1/tipos/cerrados` · `/modulo1/tipos/abiertos` · `/modulo1/tipos/polinomios`
 *
 * ── Por qué UN componente y no tres ──────────────────────────────────
 * Las tres pantallas son idénticas: cambian el nombre, el principio y la
 * lista de métodos, y eso ya está escrito en `registro.ts`. Con un
 * componente por familia se copia el mismo HTML tres veces, y el día que
 * cambie un botón hay que acordarse de tres lugares. Con `:familia` en la
 * ruta se escribe una vez y se prueba una vez.
 *
 * ── La familia viene de la URL, no de un estado interno ──────────────
 * El alumno puede pegar el link `/tipos/abiertos` en el navegador o
 * mandárselo a un compañero. Por eso el componente LEE el parámetro: la
 * URL es la fuente de verdad. Si el parámetro no corresponde a ninguna
 * familia (`/tipos/xyz`), en vez de mostrar una pantalla vacía se manda a
 * la Pantalla A, que es donde se elige.
 *
 * ── Estado "planificado" ─────────────────────────────────────────────
 * Cardano está declarado en el registro pero no implementado. Se muestra
 * igual (para que la taxonomía se vea completa y se note qué falta), con
 * un badge "Próximamente" y sin enlace: no se puede entrar a una página
 * que todavía no existe.
 */
@Component({
  selector: 'app-tipo-metodos',
  standalone: true,
  imports: [RouterLink, Breadcrumb, Badge, Btn],
  templateUrl: './tipo-metodos.html',
  styleUrl: './tipo-metodos.scss',
})
export class TipoMetodos {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  /** La familia pedida en la URL. `null` si la URL no corresponde. */
  private readonly _familia = signal<FamiliaRegistrada | null>(null);
  readonly familia = this._familia.asReadonly();

  /** Los métodos de esa familia, en el orden en que se registraron. */
  readonly metodos = computed<MetodoRegistrado[]>(() => {
    const f = this.familia();
    return f ? metodosDeFamilia(f.key) : [];
  });

  /** Cuántos se pueden abrir hoy. */
  readonly disponibles = computed(
    () => this.metodos().filter((m) => m.estado === 'implementado').length,
  );

  readonly miga = computed<TramoBreadcrumb[]>(() => [
    { texto: 'Portal', ruta: '/home' },
    { texto: 'Módulo 1', ruta: '/modulo1' },
    { texto: this.familia()?.nombre ?? 'Tipo de método' },
  ]);

  /** Enlace a la pestaña de entrada del método, o `null` si no existe aún. */
  readonly rutaDe = rutaDeMetodo;
  readonly resumenDe = resumenDeMetodo;

  constructor() {
    // Suscripción única: el parámetro de la ruta gobierna el contenido.
    this.route.paramMap.subscribe((params) => {
      const key = params.get('familia') as FamiliaKey | null;
      const encontrada = FAMILIAS.find((f) => f.key === key) ?? null;

      if (!encontrada) {
        // Ruta desconocida: sin pantalla en blanco. Volvemos a donde se
        // elige el tipo, que es el único lugar desde el que se llega acá.
        void this.router.navigate(['/modulo1']);
        return;
      }
      this._familia.set(encontrada);
    });
  }
}
