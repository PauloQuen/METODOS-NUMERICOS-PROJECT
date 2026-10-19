import { Component, computed, signal } from '@angular/core';
import { ActivatedRoute, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { NEWTON_RAPHSON } from './newton-raphson.config';
import { familiaDe, rutaDeFamilia } from '../../../../../shared/domain/numerico/registro';
import { Breadcrumb, type TramoBreadcrumb } from '../../../../../shared/layout/breadcrumb/breadcrumb';

@Component({
  selector: 'app-metodo-newton-raphson',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, RouterOutlet, Breadcrumb],
  templateUrl: './newton-raphson.html',
  styleUrl: './newton-raphson.scss',
})
export class MetodoNewtonRaphson {
  readonly metodo = NEWTON_RAPHSON;
  readonly rutaActual = signal<string>('teoria');
  readonly pestanas = [
    { texto: 'Teoría', icono: 'menu_book', ruta: 'teoria' },
    { texto: 'Ejemplos', icono: 'science', ruta: 'ejemplos' },
    { texto: 'Autoevaluación', icono: 'quiz', ruta: 'autoevaluacion' },
    { texto: 'Calculadora', icono: 'calculate', ruta: 'calculadora' },
  ] as const;
  constructor(route: ActivatedRoute){
    route.url.subscribe(u=>{
      const ultimo=u.at(-1)?.toString()??'teoria';
      this.rutaActual.set(this.pestanas.some(p=>p.ruta===ultimo)?ultimo:'teoria');
    });
  }
  readonly estilo = computed(()=>({ '--color-metodo': this.metodo.color }));
  readonly miga = computed<TramoBreadcrumb[]>(() => {
    const familia = familiaDe(this.metodo.key);
    return [
      { texto: 'Portal', ruta: '/home' },
      { texto: 'Módulo 1', ruta: '/modulo1' },
      { texto: familia.nombre, ruta: rutaDeFamilia(familia.key) },
      { texto: this.metodo.nombre },
    ];
  });
}
