import type { Routes } from '@angular/router';
import type { MetodoIterativo } from './iterativo.algoritmo';
import { METODO_ITERATIVO } from './iterativo.config';
import { IterativoService } from './iterativo.service';

export function rutasIterativas(metodo: MetodoIterativo): Routes {
  return [{
    path: '', providers: [{ provide: METODO_ITERATIVO, useValue: metodo }, IterativoService],
    loadComponent: () => import('./iterativo').then(m => m.MetodoIterativoPagina),
    children: [
      { path: '', redirectTo: 'teoria', pathMatch: 'full' },
      { path: 'teoria', loadComponent: () => import('./iterativo-teoria').then(m => m.IterativoTeoria) },
      { path: 'ejemplos', loadComponent: () => import('./iterativo-ejemplos').then(m => m.IterativoEjemplos) },
      { path: 'calculadora', loadComponent: () => import('./iterativo-calculadora').then(m => m.IterativoCalculadora) },
      { path: 'autoevaluacion', loadComponent: () => import('./iterativo-autoevaluacion').then(m => m.IterativoAutoevaluacion) },
    ],
  }];
}
