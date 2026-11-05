import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { map } from 'rxjs';
import {
  FAMILIAS_MODULO2,
  metodosDeFamiliaModulo2,
  rutaDeFamiliaModulo2,
  rutaDeMetodoModulo2,
  type FamiliaModulo2Key,
  type MetodoModulo2,
} from '../../registro-modulo2';

/**
 * Pantalla de una familia de métodos ("Métodos directos" / "Métodos
 * iterativos").
 *
 * ── Un solo componente para las dos familias ──────────────────────────
 * Las dos familias se muestran IGUAL: misma lista de métodos, misma
 * ficha. Lo único que cambia es el nombre y la explicación. Si hubiera
 * un componente por familia, el próximo método obligaría a duplicar la
 * ficha entera. Acá la familia se resuelve con un parámetro de ruta y
 * todo lo demás sale del registro.
 *
 * Ojo: si la ruta trae una familia que no existe, se manda al inicio
 * del módulo en vez de dejar una pantalla vacía.
 */
@Component({
  selector: 'app-modulo2-tipo-metodos',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './tipo-metodos.html',
  styleUrl: './tipo-metodos.scss',
})
export class TipoMetodosModulo2 {
  private readonly route = inject(ActivatedRoute);

  /**
   * La familia, leída de la ruta.
   *
   * Se lee del parámetro y NO se guarda en un signal propio: si el
   * alumno navega de "directos" a "iterativos" sin salir del componente,
   * el signal propio quedaría desactualizado. Con `toSignal` del
   * observable de la ruta, el valor se recalcula solo.
   */
  private readonly familiaActual = toSignal(
    this.route.paramMap.pipe(map((p) => p.get('familia') as FamiliaModulo2Key | null)),
    { initialValue: null },
  );

  /** La familia válida de la ruta, o la primera si la ruta no sirve. */
  readonly familia = computed(() => {
    const clave = this.familiaActual();
    return (
      FAMILIAS_MODULO2.find((f) => f.key === clave) ?? FAMILIAS_MODULO2[0]
    );
  });

  /** Los métodos de esa familia, con su ruta ya armada. */
  readonly metodos = computed<{ metodo: MetodoModulo2; ruta: string }[]>(() =>
    metodosDeFamiliaModulo2(this.familia().key).map((metodo) => ({
      metodo,
      ruta: rutaDeMetodoModulo2(metodo),
    })),
  );

  /** Ruta de la otra familia, para saltar de una a otra. */
  readonly otraFamilia = computed(() => {
    const actual = this.familia().key;
    return FAMILIAS_MODULO2.find((f) => f.key !== actual) ?? FAMILIAS_MODULO2[0];
  });

  readonly rutaInicio = '/modulo2/inicio';
  readonly rutaFamilia = computed(() => rutaDeFamiliaModulo2(this.familia().key));
  readonly rutaOtraFamilia = computed(() => rutaDeFamiliaModulo2(this.otraFamilia().key));
}
