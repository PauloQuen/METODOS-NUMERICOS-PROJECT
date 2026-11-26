import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Breadcrumb, type TramoBreadcrumb } from '../../../shared/layout/breadcrumb/breadcrumb';
import { Badge } from '../../../shared/ui/badge/badge';
import { Btn } from '../../../shared/ui/btn/btn';
import { MathFormula } from '../../../shared/math/math';
import {
  FAMILIAS_MODULO5,
  METODOS_MODULO5,
  metodosDeFamiliaModulo5,
  rutaDeFamiliaModulo5,
  rutaDeMetodoModulo5,
} from '../registro-modulo5';

/** PANTALLA A — entrada al Módulo 5. */
@Component({
  selector: 'app-inicio-modulo5',
  standalone: true,
  imports: [RouterLink, Breadcrumb, Badge, Btn, MathFormula],
  templateUrl: './inicio.html',
  styleUrl: './inicio.scss',
})
export class InicioModulo5 {
  readonly rutaFamilia = rutaDeFamiliaModulo5;
  readonly rutaDe = rutaDeMetodoModulo5;

  readonly miga: TramoBreadcrumb[] = [
    { texto: 'Portal', ruta: '/home' },
    { texto: 'Módulo 5' },
  ];

  readonly familias = FAMILIAS_MODULO5.map((familia) => ({
    ...familia,
    metodos: metodosDeFamiliaModulo5(familia.key),
  }));

  readonly metodos = METODOS_MODULO5;
}
