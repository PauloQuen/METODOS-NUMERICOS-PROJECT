import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { Breadcrumb } from '../../../../../shared/layout/breadcrumb/breadcrumb';
import { IterativoService } from './iterativo.service';

@Component({
  selector: 'app-metodo-iterativo', standalone: true,
  imports: [RouterLink, RouterLinkActive, RouterOutlet, Breadcrumb],
  template: `
    <div class="gauss" [style.--color-metodo]="servicio.config.color">
      <app-breadcrumb class="gauss__miga" [tramos]="miga" />
      <header class="gauss__encabezado">
        <div class="gauss__titulos">
          <p class="gauss__familia">Métodos iterativos</p>
          <h1 class="gauss__nombre">{{ servicio.config.nombre }}</h1>
          <p class="gauss__resumen">{{ servicio.config.resumen }}</p>
        </div>
        <nav class="gauss__pestanas" [attr.aria-label]="'Secciones de ' + servicio.config.nombre">
          @for (p of pestanas; track p.ruta) {
            <a class="gauss__pestana" [routerLink]="[ruta, p.ruta]" routerLinkActive="gauss__pestana--activa"
              [routerLinkActiveOptions]="{ exact: true }" ariaCurrentWhenActive="page">
              <span class="material-symbols-outlined gauss__icono" aria-hidden="true">{{ p.icono }}</span>{{ p.texto }}
            </a>
          }
        </nav>
      </header>
      <div class="gauss__contenido"><router-outlet /></div>
    </div>
  `,
  styleUrl: '../../directos/gauss/gauss.scss',
})
export class MetodoIterativoPagina {
  readonly servicio = inject(IterativoService);
  readonly ruta = `/modulo2/tipos/iterativos/${this.servicio.config.ruta}`;
  readonly miga = [{ texto: 'Portal', ruta: '/home' }, { texto: 'Módulo 2', ruta: '/modulo2/inicio' },
    { texto: 'Métodos iterativos', ruta: '/modulo2/tipos/iterativos' }, { texto: this.servicio.config.nombre }];
  readonly pestanas = [{ texto: 'Teoría', icono: 'menu_book', ruta: 'teoria' },
    { texto: 'Ejemplos', icono: 'science', ruta: 'ejemplos' }, { texto: 'Autoevaluación', icono: 'quiz', ruta: 'autoevaluacion' },
    { texto: 'Calculadora', icono: 'calculate', ruta: 'calculadora' }];
}
