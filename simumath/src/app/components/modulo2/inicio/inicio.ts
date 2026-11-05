import { Component, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { UiCard } from '../../../shared/ui/ui-card/ui-card';
import {
  FAMILIAS_MODULO2,
  REGISTRO_MODULO2,
  metodosDeFamiliaModulo2,
  rutaDeFamiliaModulo2,
  rutaDeMetodoModulo2,
  type FamiliaModulo2,
  type MetodoModulo2,
} from '../registro-modulo2';

/**
 * Pantalla de entrada del Módulo 2.
 *
 * ── Qué hace y qué NO hace ───────────────────────────────────────────
 * Presenta el módulo: qué es un sistema lineal, cómo se clasifican los
 * métodos y cuál conviene en cada caso. NO calcula nada.
 *
 * Todos los datos salen del REGISTRO (`registro-modulo2.ts`). Si mañana
 * se agrega un método, esta pantalla no se toca: aparece solo. Ese es
 * el motivo de que el registro sea la fuente única de verdad y no un
 * simple listado de constantes en la vista.
 */
interface TarjetaMetodo {
  metodo: MetodoModulo2;
  ruta: string;
  /** La frase corta que resume si itera o no. */
  resumen: string;
}

interface BloqueFamilia {
  familia: FamiliaModulo2;
  ruta: string;
  metodos: TarjetaMetodo[];
}

@Component({
  selector: 'app-modulo2-inicio',
  standalone: true,
  imports: [RouterLink, UiCard],
  templateUrl: './inicio.html',
  styleUrl: './inicio.scss',
})
export class InicioModulo2 {
  readonly familias = FAMILIAS_MODULO2;

  /** Un bloque por familia, con sus métodos ya resueltos. */
  readonly bloques = computed<BloqueFamilia[]>(() =>
    FAMILIAS_MODULO2.map((familia) => ({
      familia,
      ruta: rutaDeFamiliaModulo2(familia.key),
      metodos: metodosDeFamiliaModulo2(familia.key).map((metodo) => ({
        metodo,
        ruta: rutaDeMetodoModulo2(metodo),
        resumen: metodo.iterativo
          ? 'Itera: tabla de iteraciones y criterio de parada.'
          : 'Pasos fijos: no itera y no tiene criterio de parada.',
      })),
    })),
  );

  /** Cuántos métodos hay en total, para el resumen de arriba. */
  readonly total = REGISTRO_MODULO2.length;

  /** Cuántos de ellos están listos para usarse. */
  readonly listos = REGISTRO_MODULO2.filter((m) => m.estado === 'implementado').length;
}
