import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Breadcrumb, type TramoBreadcrumb } from '../../../../shared/layout/breadcrumb/breadcrumb';
import { Badge } from '../../../../shared/ui/badge/badge';
import { Btn } from '../../../../shared/ui/btn/btn';
import { MathFormula } from '../../../../shared/math/math';
import {
  FAMILIAS_MODULO5,
  metodosDeFamiliaModulo5,
  rutaDeMetodoModulo5,
  type FamiliaModulo5,
  type FamiliaModulo5Key,
  type MetodoModulo5,
} from '../../registro-modulo5';

/** PANTALLA B — lista de métodos de la familia del Módulo 5. */
@Component({
  selector: 'app-tipo-metodos-modulo5',
  standalone: true,
  imports: [RouterLink, Breadcrumb, Badge, Btn, MathFormula],
  templateUrl: './tipo-metodos.html',
  styleUrl: './tipo-metodos.scss',
})
export class TipoMetodosModulo5 {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  private readonly _familia = signal<FamiliaModulo5 | null>(null);
  readonly familia = this._familia.asReadonly();

  readonly metodos = computed<MetodoModulo5[]>(() => {
    const f = this.familia();
    return f ? metodosDeFamiliaModulo5(f.key) : [];
  });

  readonly miga = computed<TramoBreadcrumb[]>(() => [
    { texto: 'Portal', ruta: '/home' },
    { texto: 'Módulo 5', ruta: '/modulo5' },
    { texto: this.familia()?.nombre ?? 'Tipo de método' },
  ]);

  readonly rutaDe = rutaDeMetodoModulo5;

  constructor() {
    this.route.paramMap.subscribe((params) => {
      const key = params.get('familia') as FamiliaModulo5Key | null;
      const encontrada = FAMILIAS_MODULO5.find((f) => f.key === key) ?? null;

      if (!encontrada) {
        void this.router.navigate(['/modulo5']);
        return;
      }
      this._familia.set(encontrada);
    });
  }

  familiaDe(m: MetodoModulo5): string {
    return FAMILIAS_MODULO5.find((f) => f.key === m.familia)?.nombre ?? '';
  }
}
