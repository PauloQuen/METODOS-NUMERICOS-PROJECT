import type { ActivatedRoute } from '@angular/router';

/**
 * Datos de la ruta del método, visibles desde una pestaña hija.
 *
 * Las pestañas cuelgan de una ruta con componente y segmento propio
 * (`…/taylor/teoria`). Con la estrategia de herencia por defecto de
 * Angular, `route.snapshot.data` de la hija NO incluye los datos del
 * padre. Acá se combinan explícitamente: primero el padre, después la
 * hija, para que una pestaña pueda sobrescribir un valor si algún día
 * lo necesita.
 */
export function datosDeRuta(route: ActivatedRoute): Record<string, unknown> {
  return {
    ...(route.parent?.snapshot.data ?? {}),
    ...(route.snapshot.data ?? {}),
  };
}
