import { Component, inject } from '@angular/core';
import { EJEMPLOS_SECANTE } from '../secante.contenido';
import { SecanteService } from '../secante.service';
import { SecanteEjemplo } from '../secante-ejemplo';

@Component({
  selector: 'app-secante-ejemplos',
  standalone: true,
  imports: [SecanteEjemplo],
  templateUrl: './secante-ejemplos.html',
  styleUrl: './secante-ejemplos.scss',
})
export class SecanteEjemplos {
  readonly ejemplos = EJEMPLOS_SECANTE;

  private readonly servicio = inject(SecanteService);


  protected readonly funciones = this.ejemplos.map((e) =>
    this.servicio.funcionDeEjemplo(e),
  );

}
