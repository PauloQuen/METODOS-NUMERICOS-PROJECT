import { Component, inject } from '@angular/core';
import { EJEMPLOS_PUNTO_FIJO } from '../punto-fijo.contenido';
import { PuntoFijoService } from '../punto-fijo.service';
import { PuntoFijoEjemplo } from '../punto-fijo-ejemplo';

@Component({
  selector: 'app-punto-fijo-ejemplos',
  standalone: true,
  imports: [PuntoFijoEjemplo],
  templateUrl: './punto-fijo-ejemplos.html',
  styleUrl: './punto-fijo-ejemplos.scss',
})
export class PuntoFijoEjemplos {
  readonly ejemplos = EJEMPLOS_PUNTO_FIJO;

  private readonly servicio = inject(PuntoFijoService);


  protected readonly funciones = this.ejemplos.map((e) =>
    this.servicio.funcionDeEjemplo(e),
  );

}
