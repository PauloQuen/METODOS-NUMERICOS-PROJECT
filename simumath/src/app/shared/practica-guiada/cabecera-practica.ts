import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-cabecera-practica',
  standalone: true,
  template: `
    <p>Banco de {{ total() }} ejercicios. Cada tanda combina tres problemas numéricos y tres
      de aplicación, con cuatro preguntas aleatorias por ejercicio. La tanda y tu progreso se
      conservan al cambiar de pestaña. Al recargar la página se genera una nueva selección.</p>
    <button type="button" (click)="nuevaTanda.emit()">Generar otra tanda</button>
  `,
  styles: [`
    :host { display:block; }
    p { margin:0 0 1rem; max-width:75ch; line-height:1.7; color:var(--c-texto-suave); }
    button { padding:.7rem 1rem; min-height:44px; border:1px solid var(--c-primario);
      border-radius:var(--r-md); background:var(--c-primario); color:var(--c-sobre-primario); font:inherit; font-weight:600; }
    button:hover { background:var(--c-primario-hover); }
  `],
})
export class CabeceraPractica {
  readonly total = input.required<number>();
  readonly nuevaTanda = output<void>();
}
