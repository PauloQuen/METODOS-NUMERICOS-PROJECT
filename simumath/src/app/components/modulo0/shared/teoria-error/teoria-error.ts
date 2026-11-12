import { Component, input } from '@angular/core';
import { TeoriaContenido } from '../../../../shared/domain/teoria-contenido/teoria-contenido';
import { BloqueEjemploError } from '../bloque-ejemplo-error/bloque-ejemplo-error';
import type { Columna } from '../../../../shared/models/metodo.model';
import type { TeoriaError } from '../../modelos/modulo0.model';

/**
 * PESTAÑA DE TEORÍA de un método del Módulo 0.
 *
 * Reutiliza el MISMO marco que los once métodos del resto del portal
 * (`app-teoria-contenido`): concepto, video, las tres ideas en
 * acordeón, recursos y la tarjeta del método con fórmula, pasos,
 * criterios, ventajas y límites. Al final proyecta los dos ejemplos de
 * la teoría, resueltos.
 *
 * Así el alumno que ya conoce el Módulo 3 encuentra la misma estructura,
 * y una mejora al marco beneficia a los cuatro módulos a la vez.
 */
@Component({
  selector: 'app-m0-teoria-error',
  standalone: true,
  imports: [TeoriaContenido, BloqueEjemploError],
  templateUrl: './teoria-error.html',
})
export class TeoriaErrorVista {
  readonly teoria = input.required<TeoriaError>();
  readonly columnas = input<Columna[]>([]);
}
