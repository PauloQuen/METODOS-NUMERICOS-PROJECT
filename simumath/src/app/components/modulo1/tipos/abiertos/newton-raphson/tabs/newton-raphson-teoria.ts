import { Component, computed, inject, signal } from '@angular/core';
import { TEORIA_NEWTON } from '../newton-raphson.contenido';
import { COLUMNAS_NEWTON } from '../newton-raphson.config';
import { NewtonRaphsonService } from '../newton-raphson.service';
import { UiCard } from '../../../../../../shared/ui/ui-card/ui-card';
import { BloqueEjemplo } from '../../../../../../shared/domain/bloque-ejemplo/bloque-ejemplo';
import { dibujarNewtonRaphson } from '../newton-raphson.grafico';

@Component({
  selector: 'app-newton-raphson-teoria',
  standalone: true,
  imports: [UiCard, BloqueEjemplo],
  templateUrl: './newton-raphson-teoria.html',
  styleUrl: './newton-raphson-teoria.scss',
})
export class NewtonRaphsonTeoria {
  readonly teoria = TEORIA_NEWTON;
  readonly columnas = COLUMNAS_NEWTON;
  readonly dibujar = dibujarNewtonRaphson;

  private readonly servicio = inject(NewtonRaphsonService);

  readonly ejemploNumerico = signal(
    this.servicio.calcularEjemplo(TEORIA_NEWTON.ejemploNormal),
  );

  readonly ejemploCasuistica = signal(
    this.servicio.calcularEjemplo(TEORIA_NEWTON.ejemploCasuistica),
  );

  protected readonly funcionNumerico = this.servicio.funcionDeEjemplo(
    TEORIA_NEWTON.ejemploNormal,
  );

  protected readonly funcionCasuistica = this.servicio.funcionDeEjemplo(
    TEORIA_NEWTON.ejemploCasuistica,
  );

  protected readonly rangoNumerico = computed(() =>
    this.servicio.rangoPara(
      TEORIA_NEWTON.ejemploNormal.calculo,
      this.ejemploNumerico().raiz,
    ),
  );

  protected readonly rangoCasuistica = computed(() =>
    this.servicio.rangoPara(
      TEORIA_NEWTON.ejemploCasuistica.calculo,
      this.ejemploCasuistica().raiz,
    ),
  );

  protected readonly abierta = signal<'fundamento' | 'falla' | 'orden' | null>(null);

  protected alternar(que: 'fundamento' | 'falla' | 'orden'): void {
    this.abierta.update((actual) => (actual === que ? null : que));
  }
}
