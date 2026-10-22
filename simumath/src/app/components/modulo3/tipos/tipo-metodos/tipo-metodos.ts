import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Breadcrumb, type TramoBreadcrumb } from '../../../../shared/layout/breadcrumb/breadcrumb';
import { Badge } from '../../../../shared/ui/badge/badge';
import { Btn } from '../../../../shared/ui/btn/btn';
import {
  FAMILIAS_MODULO3,
  metodosDeFamiliaModulo3,
  rutaDeMetodoModulo3,
  type FamiliaModulo3,
  type FamiliaModulo3Key,
  type MetodoModulo3,
} from '../../registro-modulo3';

/**
 * PANTALLA B — lista de métodos de UNA familia del Módulo 3.
 * `/modulo3/tipos/interpolacion` · `/modulo3/tipos/ajuste`
 *
 * Un solo componente para las dos familias: cambian el nombre, el
 * principio y la lista, y eso ya está en `registro-modulo3.ts`. Si
 * mañana se agrega "Splines cúbicos", aparece acá sin tocar el HTML.
 *
 * La familia se lee del parámetro de la URL, no de un estado interno:
 * así el enlace se puede compartir y el botón "atrás" funciona. Si el
 * parámetro no existe, se vuelve a la Pantalla A en vez de mostrar una
 * lista vacía.
 */
@Component({
  selector: 'app-tipo-metodos-modulo3',
  standalone: true,
  imports: [RouterLink, Breadcrumb, Badge, Btn],
  templateUrl: './tipo-metodos.html',
  styleUrl: './tipo-metodos.scss',
})
export class TipoMetodosModulo3 {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  /** La familia pedida en la URL. */
  private readonly _familia = signal<FamiliaModulo3 | null>(null);
  readonly familia = this._familia.asReadonly();

  /** Los métodos de la familia, en el orden del registro. */
  readonly metodos = computed<MetodoModulo3[]>(() => {
    const f = this.familia();
    return f ? metodosDeFamiliaModulo3(f.key) : [];
  });

  readonly miga = computed<TramoBreadcrumb[]>(() => [
    { texto: 'Portal', ruta: '/home' },
    { texto: 'Módulo 3', ruta: '/modulo3' },
    { texto: this.familia()?.nombre ?? 'Tipo de método' },
  ]);

  /** Enlace a la pestaña de entrada de cada método. */
  readonly rutaDe = rutaDeMetodoModulo3;

  constructor() {
    this.route.paramMap.subscribe((params) => {
      const key = params.get('familia') as FamiliaModulo3Key | null;
      const encontrada = FAMILIAS_MODULO3.find((f) => f.key === key) ?? null;

      if (!encontrada) {
        void this.router.navigate(['/modulo3']);
        return;
      }
      this._familia.set(encontrada);
    });
  }

  /** Nombre legible de la familia de un método, para la tarjeta. */
  familiaDe(m: MetodoModulo3): string {
    return FAMILIAS_MODULO3.find((f) => f.key === m.familia)?.nombre ?? '';
  }
}
