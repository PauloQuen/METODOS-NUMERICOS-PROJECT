# Jacobi y Gauss-Seidel

Ambos métodos están disponibles en `/modulo2/tipos/iterativos/{jacobi,gauss-seidel}` con teoría, cuatro ejemplos, calculadora y autoevaluación. Cada banco tiene 24 ejercicios; las tandas de seis combinan tres numéricos y tres de aplicación, con cuatro preguntas por ejercicio.

- `shared/iterativo.algoritmo.ts`: motor puro. Jacobi usa exclusivamente el vector anterior; Gauss-Seidel utiliza las componentes nuevas para los índices menores que el actual.
- Se exige cambio escalado δ ≤ tol **y** residuo relativo η ≤ tol. δ = ‖x nuevo − x anterior‖∞ / max(1, ‖x nuevo‖∞); η = ‖Ax − b‖∞ / ‖b‖∞, utilizando ‖A‖∞ como denominador si b = 0. Un vector inicial que ya cumple el criterio del residuo termina sin barridas.
- No se redondea durante el cálculo. El límite, el estancamiento y los valores no finitos son estados distintos de la convergencia. Se conserva la última aproximación finita, pero solo se expone `solucion` si se satisfacen los criterios.
- La calculadora acepta hasta 20 ecuaciones y 5000 iteraciones; pagina el historial de 50 en 50. El gráfico usa escala logarítmica y permite comparar métodos con los mismos parámetros.
- `IterativoService` se proporciona por ruta: los datos y el resultado sobreviven al cambio de pestaña y quedan separados entre ambos métodos. `SesionPracticaService` conserva las tandas y el progreso de las soluciones durante la sesión.
- Las matrices relacionadas se presentan juntas mediante `GrupoMatrices`, también en las soluciones completas. Las operaciones de las guías y del visor proceden de la misma función.

Validación desde `simumath/`:

```sh
npm test -- --watch=false --browsers=ChromeHeadless --ts-config=src/app/components/modulo2/tsconfig.iterativos.spec.json --include='src/app/components/modulo2/registro-modulo2.spec.ts' --include='src/app/components/modulo2/tipos/iterativos/shared/*.spec.ts'
npm run build
```

Las pruebas cubren las primeras barridas, resultados conocidos, entradas inválidas, escalado, ausencia de convergencia, bancos y preguntas, navegación real de las cuatro pestañas, persistencia y desbloqueo de las soluciones.

Referencias de la teoría: [Jacobi](https://netlib.org/linalg/html_templates/node12.html), [Gauss-Seidel](https://netlib.org/linalg/html_templates/node14.html) y [criterios de parada](https://netlib.org/linalg/html_templates/node83.html), en *Templates for the Solution of Linear Systems*.
