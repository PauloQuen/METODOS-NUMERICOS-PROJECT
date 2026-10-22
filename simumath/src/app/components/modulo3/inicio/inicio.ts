import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Breadcrumb, type TramoBreadcrumb } from '../../../shared/layout/breadcrumb/breadcrumb';
import { Badge } from '../../../shared/ui/badge/badge';
import { Btn } from '../../../shared/ui/btn/btn';
import {
  FAMILIAS_MODULO3,
  METODOS_MODULO3,
  metodosDeFamiliaModulo3,
  rutaDeFamiliaModulo3,
  rutaDeMetodoModulo3,
} from '../registro-modulo3';

/**
 * PANTALLA A — entrada al Módulo 3.
 *
 * Presenta las dos familias por su PRINCIPIO, que es la decisión que el
 * alumno tiene que tomar antes de elegir un método:
 *
 * · Interpolación → la curva pasa EXACTO por todos los datos.
 * · Ajuste        → la curva pasa lo más CERCA posible, sin tocar cada dato.
 *
 * Después muestra los dos métodos con su fórmula y su idea, para que se
 * pueda entrar directo sin pasar por la lista de la familia.
 *
 * Todo sale de `registro-modulo3.ts`: agregar un método ahí lo hace
 * aparecer en esta pantalla sin tocar una línea de este componente.
 */
@Component({
  selector: 'app-inicio-modulo3',
  standalone: true,
  imports: [RouterLink, Breadcrumb, Badge, Btn],
  templateUrl: './inicio.html',
  styleUrl: './inicio.scss',
})
export class InicioModulo3 {
  /** Ruta de la lista de métodos de una familia. */
  readonly rutaFamilia = rutaDeFamiliaModulo3;

  /** Ruta de entrada de un método. */
  readonly rutaDe = rutaDeMetodoModulo3;

  readonly miga: TramoBreadcrumb[] = [
    { texto: 'Portal', ruta: '/home' },
    { texto: 'Módulo 3' },
  ];

  /** Las dos familias, cada una con sus métodos ya resueltos. */
  readonly familias = FAMILIAS_MODULO3.map((familia) => ({
    ...familia,
    metodos: metodosDeFamiliaModulo3(familia.key),
  }));

  /** Todos los métodos del módulo, en el orden del registro. */
  readonly metodos = METODOS_MODULO3;
}
