import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Breadcrumb, type TramoBreadcrumb } from '../../../shared/layout/breadcrumb/breadcrumb';
import { Badge } from '../../../shared/ui/badge/badge';
import { Btn } from '../../../shared/ui/btn/btn';
import {
  FAMILIAS_MODULO2,
  METODOS_MODULO2,
  metodosDeFamiliaModulo2,
  rutaDeFamiliaModulo2,
  rutaDeMetodoModulo2,
} from '../registro-modulo2';

/**
 * PANTALLA A — entrada al Módulo 2.
 *
 * Presenta las dos familias por su principio:
 * · Directos   → terminan en un número finito de pasos.
 * · Iterativos → mejoran una aproximación hasta converger.
 *
 * Todo se deriva de `registro-modulo2.ts`.
 */
@Component({
  selector: 'app-inicio-modulo2',
  standalone: true,
  imports: [RouterLink, Breadcrumb, Badge, Btn],
  templateUrl: './inicio.html',
  styleUrl: './inicio.scss',
})
export class InicioModulo2 {
  readonly rutaFamilia = rutaDeFamiliaModulo2;
  readonly rutaDe = rutaDeMetodoModulo2;

  readonly miga: TramoBreadcrumb[] = [
    { texto: 'Portal', ruta: '/home' },
    { texto: 'Módulo 2' },
  ];

  readonly familias = FAMILIAS_MODULO2.map((familia) => ({
    ...familia,
    metodos: metodosDeFamiliaModulo2(familia.key),
  }));

  readonly metodos = METODOS_MODULO2;
}
