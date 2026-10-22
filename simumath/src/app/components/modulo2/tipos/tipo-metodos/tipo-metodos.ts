import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Breadcrumb, type TramoBreadcrumb } from '../../../../shared/layout/breadcrumb/breadcrumb';
import { Badge } from '../../../../shared/ui/badge/badge';
import { Btn } from '../../../../shared/ui/btn/btn';
import {
  FAMILIAS_MODULO2,
  metodosDeFamiliaModulo2,
  rutaDeMetodoModulo2,
  type FamiliaModulo2,
  type FamiliaModulo2Key,
  type MetodoModulo2,
} from '../../registro-modulo2';

/**
 * PANTALLA B — lista de métodos de una familia del Módulo 2.
 * `/modulo2/tipos/directos` · `/modulo2/tipos/iterativos`
 */
@Component({
  selector: 'app-tipo-metodos-modulo2',
  standalone: true,
  imports: [RouterLink, Breadcrumb, Badge, Btn],
  templateUrl: './tipo-metodos.html',
  styleUrl: './tipo-metodos.scss',
})
export class TipoMetodosModulo2 {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  private readonly _familia = signal<FamiliaModulo2 | null>(null);
  readonly familia = this._familia.asReadonly();

  readonly metodos = computed<MetodoModulo2[]>(() => {
    const f = this.familia();
    return f ? metodosDeFamiliaModulo2(f.key) : [];
  });

  readonly miga = computed<TramoBreadcrumb[]>(() => [
    { texto: 'Portal', ruta: '/home' },
    { texto: 'Módulo 2', ruta: '/modulo2' },
    { texto: this.familia()?.nombre ?? 'Tipo de método' },
  ]);

  readonly rutaDe = rutaDeMetodoModulo2;

  constructor() {
    this.route.paramMap.subscribe((params) => {
      const key = params.get('familia') as FamiliaModulo2Key | null;
      const encontrada = FAMILIAS_MODULO2.find((f) => f.key === key) ?? null;

      if (!encontrada) {
        void this.router.navigate(['/modulo2']);
        return;
      }
      this._familia.set(encontrada);
    });
  }

  familiaDe(m: MetodoModulo2): string {
    return FAMILIAS_MODULO2.find((f) => f.key === m.familia)?.nombre ?? '';
  }
}
