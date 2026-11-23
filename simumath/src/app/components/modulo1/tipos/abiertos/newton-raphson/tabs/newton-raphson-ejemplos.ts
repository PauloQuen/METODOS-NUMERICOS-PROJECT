import { Component, inject } from '@angular/core';
import { EJEMPLOS_NEWTON } from '../newton-raphson.contenido';
import { NewtonRaphsonService } from '../newton-raphson.service';
import { NewtonRaphsonEjemplo } from '../newton-raphson-ejemplo';

@Component({
  selector: 'app-newton-raphson-ejemplos',
  standalone: true,
  imports: [NewtonRaphsonEjemplo],
  templateUrl: './newton-raphson-ejemplos.html',
  styleUrl: './newton-raphson-ejemplos.scss',
})
export class NewtonRaphsonEjemplos {
  readonly ejemplos = EJEMPLOS_NEWTON;

  private readonly servicio = inject(NewtonRaphsonService);


  protected readonly funciones = this.ejemplos.map((e) =>
    this.servicio.funcionDeEjemplo(e),
  );

}
