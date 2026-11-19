import { Component, inject } from '@angular/core';
import { EJEMPLOS_REGLA_FALSA } from '../regla-falsa.contenido';
import { ReglaFalsaService } from '../regla-falsa.service';
import { ReglaFalsaEjemplo } from '../regla-falsa-ejemplo';

@Component({
  selector: 'app-regla-falsa-ejemplos',
  standalone: true,
  imports: [ReglaFalsaEjemplo],
  templateUrl: './regla-falsa-ejemplos.html',
  styleUrl: './regla-falsa-ejemplos.scss',
})
export class ReglaFalsaEjemplos {
  readonly ejemplos = EJEMPLOS_REGLA_FALSA;

  private readonly servicio = inject(ReglaFalsaService);


  protected readonly funciones = this.ejemplos.map((e) => this.servicio.funcionDeEjemplo(e));

  protected readonly rangos = this.ejemplos.map((e) => this.servicio.rangoPara(e.calculo));
}
