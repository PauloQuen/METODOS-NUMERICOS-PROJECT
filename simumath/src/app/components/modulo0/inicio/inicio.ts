import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Breadcrumb, type TramoBreadcrumb } from '../../../shared/layout/breadcrumb/breadcrumb';
import { Badge } from '../../../shared/ui/badge/badge';
import { Btn } from '../../../shared/ui/btn/btn';
import {
  FAMILIAS_MODULO0,
  METODOS_MODULO0,
  metodosDeFamiliaModulo0,
  rutaDeFamiliaModulo0,
  rutaDeMetodoModulo0,
} from '../registro-modulo0';

/**
 * PANTALLA A — entrada al Módulo 0.
 *
 * Presenta los cuatro submódulos por su PRINCIPIO, que es la decisión
 * que el alumno toma antes de elegir un método, y después los métodos
 * con su fórmula. Todo sale del registro: agregar una familia o un
 * método lo hace aparecer acá sin tocar esta plantilla.
 *
 * La hoja de estilos es la del M3 a propósito: el portal tiene un solo
 * lenguaje visual para las portadas de módulo.
 */
@Component({
  selector: 'app-inicio-modulo0',
  standalone: true,
  imports: [RouterLink, Breadcrumb, Badge, Btn],
  templateUrl: './inicio.html',
  styleUrl: '../../modulo3/inicio/inicio.scss',
})
export class InicioModulo0 {
  readonly rutaFamilia = rutaDeFamiliaModulo0;
  readonly rutaDe = rutaDeMetodoModulo0;

  readonly miga: TramoBreadcrumb[] = [
    { texto: 'Portal', ruta: '/home' },
    { texto: 'Módulo 0', ruta: '/modulo0' },
  ];

  readonly familias = FAMILIAS_MODULO0.map((familia) => ({
    ...familia,
    metodos: metodosDeFamiliaModulo0(familia.key),
  }));

  readonly metodos = METODOS_MODULO0;
}
