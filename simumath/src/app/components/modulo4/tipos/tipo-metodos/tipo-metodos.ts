import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Breadcrumb, type TramoBreadcrumb } from '../../../../shared/layout/breadcrumb/breadcrumb';
import { Badge } from '../../../../shared/ui/badge/badge';
import { Btn } from '../../../../shared/ui/btn/btn';
import { MathFormula } from '../../../../shared/math/math';
import {
  FAMILIAS_MODULO4,
  metodosDeFamiliaModulo4,
  rutaDeMetodoModulo4,
  type FamiliaModulo4,
  type FamiliaModulo4Key,
  type MetodoModulo4,
} from '../../registro-modulo4';

/**
 * PANTALLA B — lista de métodos de la familia del Módulo 4.
 * `/modulo4/tipos/newton-cotes`
 *
 * Es el mismo patrón del Módulo 3, con los tipos del Módulo 4. La
 * familia se lee del parámetro de la URL, no de un estado interno: así
 * el enlace se puede compartir y el botón "atrás" funciona. Si el
 * parámetro no existe, se vuelve a la Pantalla A en vez de mostrar una
 * lista vacía.
 */
@Component({
  selector: 'app-tipo-metodos-modulo4',
  standalone: true,
  imports: [RouterLink, Breadcrumb, Badge, Btn, MathFormula],
  templateUrl: './tipo-metodos.html',
  styleUrl: './tipo-metodos.scss',
})
export class TipoMetodosModulo4 {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  /** La familia pedida en la URL. */
  private readonly _familia = signal<FamiliaModulo4 | null>(null);
  readonly familia = this._familia.asReadonly();

  /** Los métodos de la familia, en el orden del registro. */
  readonly metodos = computed<MetodoModulo4[]>(() => {
    const f = this.familia();
    return f ? metodosDeFamiliaModulo4(f.key) : [];
  });

  readonly miga = computed<TramoBreadcrumb[]>(() => [
    { texto: 'Portal', ruta: '/home' },
    { texto: 'Módulo 4', ruta: '/modulo4' },
    { texto: this.familia()?.nombre ?? 'Tipo de método' },
  ]);

  /** Enlace a la pestaña de entrada de cada método. */
  readonly rutaDe = rutaDeMetodoModulo4;

  constructor() {
    this.route.paramMap.subscribe((params) => {
      const key = params.get('familia') as FamiliaModulo4Key | null;
      const encontrada = FAMILIAS_MODULO4.find((f) => f.key === key) ?? null;

      if (!encontrada) {
        void this.router.navigate(['/modulo4']);
        return;
      }
      this._familia.set(encontrada);
    });
  }

  /** Nombre legible de la familia de un método, para la tarjeta. */
  familiaDe(m: MetodoModulo4): string {
    return FAMILIAS_MODULO4.find((f) => f.key === m.familia)?.nombre ?? '';
  }
}
