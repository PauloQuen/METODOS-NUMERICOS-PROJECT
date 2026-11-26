import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Breadcrumb, type TramoBreadcrumb } from '../../../shared/layout/breadcrumb/breadcrumb';
import { Badge } from '../../../shared/ui/badge/badge';
import { Btn } from '../../../shared/ui/btn/btn';
import { MathFormula } from '../../../shared/math/math';
import {
  FAMILIAS_MODULO4,
  METODOS_MODULO4,
  metodosDeFamiliaModulo4,
  rutaDeFamiliaModulo4,
  rutaDeMetodoModulo4,
} from '../registro-modulo4';

/**
 * PANTALLA A — entrada al Módulo 4.
 *
 * Presenta la familia por su PRINCIPIO (aproximar el área por trozos) y
 * después los dos métodos con su fórmula y su idea, para que se pueda
 * entrar directo sin pasar por la lista.
 *
 * Todo sale de `registro-modulo4.ts`: agregar un método ahí lo hace
 * aparecer en esta pantalla sin tocar una línea de este componente.
 */
@Component({
  selector: 'app-inicio-modulo4',
  standalone: true,
  imports: [RouterLink, Breadcrumb, Badge, Btn, MathFormula],
  templateUrl: './inicio.html',
  styleUrl: './inicio.scss',
})
export class InicioModulo4 {
  /** Ruta de la lista de métodos de una familia. */
  readonly rutaFamilia = rutaDeFamiliaModulo4;

  /** Ruta de entrada de un método. */
  readonly rutaDe = rutaDeMetodoModulo4;

  readonly miga: TramoBreadcrumb[] = [
    { texto: 'Portal', ruta: '/home' },
    { texto: 'Módulo 4' },
  ];

  /** Las familias, cada una con sus métodos ya resueltos. */
  readonly familias = FAMILIAS_MODULO4.map((familia) => ({
    ...familia,
    metodos: metodosDeFamiliaModulo4(familia.key),
  }));

  /** Todos los métodos del módulo, en el orden del registro. */
  readonly metodos = METODOS_MODULO4;
}
