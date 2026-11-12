import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Breadcrumb, type TramoBreadcrumb } from '../../../../shared/layout/breadcrumb/breadcrumb';
import { Badge } from '../../../../shared/ui/badge/badge';
import { Btn } from '../../../../shared/ui/btn/btn';
import {
  FAMILIAS_MODULO0,
  metodosDeFamiliaModulo0,
  rutaDeMetodoModulo0,
  type FamiliaModulo0,
  type FamiliaModulo0Key,
  type MetodoModulo0,
} from '../../registro-modulo0';

/**
 * PANTALLA B — lista de métodos de UNA familia del Módulo 0.
 * `/modulo0/tipos/aritmetica` · `/modulo0/tipos/medicion` · …
 *
 * La familia se lee del parámetro de la URL, no de un estado interno:
 * el enlace se puede compartir y "atrás" funciona. Si la familia no
 * existe, se vuelve a la portada en vez de mostrar una lista vacía.
 */
@Component({
  selector: 'app-m0-tipo-metodos',
  standalone: true,
  imports: [RouterLink, Breadcrumb, Badge, Btn],
  templateUrl: './tipo-metodos.html',
  // Misma hoja que la pantalla B del M3: un solo lenguaje visual.
  styleUrl: '../../../modulo3/tipos/tipo-metodos/tipo-metodos.scss',
})
export class TipoMetodosModulo0 {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  private readonly _familia = signal<FamiliaModulo0 | null>(null);
  readonly familia = this._familia.asReadonly();

  readonly metodos = computed<MetodoModulo0[]>(() => {
    const f = this.familia();
    return f ? metodosDeFamiliaModulo0(f.key) : [];
  });

  readonly miga = computed<TramoBreadcrumb[]>(() => [
    { texto: 'Portal', ruta: '/home' },
    { texto: 'Módulo 0', ruta: '/modulo0' },
    { texto: this.familia()?.nombre ?? 'Tipo de método' },
  ]);

  readonly rutaDe = rutaDeMetodoModulo0;

  constructor() {
    this.route.paramMap.subscribe((params) => {
      const key = params.get('familia') as FamiliaModulo0Key | null;
      const encontrada = FAMILIAS_MODULO0.find((f) => f.key === key) ?? null;

      if (!encontrada) {
        void this.router.navigate(['/modulo0']);
        return;
      }
      this._familia.set(encontrada);
    });
  }

  familiaDe(m: MetodoModulo0): string {
    return FAMILIAS_MODULO0.find((f) => f.key === m.familia)?.nombre ?? '';
  }
}
