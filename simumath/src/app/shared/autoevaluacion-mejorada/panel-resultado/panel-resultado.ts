import { Component, computed, inject, input } from '@angular/core';
import { ResultadoEjercicioService } from '../resultado-ejercicio.service';

/** Apartado para escribir y/o subir el resultado antes de ver la solución. */
@Component({
  selector: 'app-panel-resultado',
  standalone: true,
  templateUrl: './panel-resultado.html',
  styleUrl: './panel-resultado.scss',
})
export class PanelResultado {
  readonly clave = input.required<string>();

  private readonly servicio = inject(ResultadoEjercicioService);

  protected readonly estado = computed(() => this.servicio.estado(this.clave()));

  protected readonly tituloId = computed(() => `resultado-${this.clave().replace(/\//g, '-')}`);

  protected readonly puedeMarcar = computed(() => {
    const estado = this.estado();
    return estado.texto.trim() !== '' || estado.archivoNombre !== null;
  });

  protected enTexto(evento: Event): void {
    this.servicio.cambiarTexto(this.clave(), (evento.target as HTMLTextAreaElement).value);
  }

  protected enArchivo(evento: Event): void {
    const archivo = (evento.target as HTMLInputElement).files?.[0] ?? null;
    this.servicio.cambiarArchivo(this.clave(), archivo);
  }

  protected marcar(): void {
    this.servicio.marcarEnviado(this.clave());
  }
}
