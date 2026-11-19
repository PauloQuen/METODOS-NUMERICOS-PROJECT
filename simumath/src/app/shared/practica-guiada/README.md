# Práctica guiada de los módulos 1 y 2

Las seis páginas de métodos del módulo 1, las cuatro páginas de métodos del módulo 2 y la autoevaluación general del módulo 1 usan tandas aleatorias. El botón «Generar otra tanda» renueva la selección y recargar la página inicia una sesión nueva. La práctica general conserva un ejercicio por método.

Cada método tiene un banco de 24 ejercicios. Los métodos anteriores conservan sus problemas originales y agregan 21; Jacobi y Gauss-Seidel incorporan bancos nuevos de 24 problemas. Las tandas seleccionan tres numéricos y tres de aplicación; cada ejercicio recibe cuatro preguntas y alternativas mezcladas. La selección y el avance se conservan en memoria durante la sesión. La tanda siguiente excluye los ejercicios de la anterior.

- Módulo 1: `components/modulo1/autoevaluacion/bancos/crear-banco.ts`. Las funciones y los parámetros se resuelven con los motores existentes. El catálogo también alimenta la práctica transversal.
- Módulo 2: `components/modulo2/autoevaluacion/crear-banco.ts`. Las matrices de las etapas se calculan por operaciones elementales y se contrastan con los motores de Gauss y LU. El problema singular original de Gauss conserva su diagnóstico y no ofrece un vector numérico ficticio.
- Jacobi y Gauss-Seidel: `components/modulo2/tipos/iterativos/shared/iterativo.contenido.ts`. Las guías y las operaciones del visor comparten la misma función; los vectores se contrastan con los motores y con soluciones conocidas.
- `SolucionGuiada` recibe etapas con operaciones, preguntas, gráficos y matrices. El desarrollo completo se crea después de culminar la guía. El bloqueo previo sigue a cargo de `SolutionGateService`.
- `FormulaMatematica` presenta fracciones, potencias, raíces cuadradas y cúbicas y ecuaciones en varias líneas mediante MathML. No evalúa expresiones ni inserta HTML procedente del contenido.

Desde `simumath`, ejecutar:

```sh
npm test -- --watch=false --browsers=ChromeHeadless --ts-config=src/app/shared/practica-guiada/tsconfig.tandas.spec.json --include='src/app/shared/practica-guiada/bancos.spec.ts' --include='src/app/shared/practica-guiada/paginas-practica.spec.ts' --include='src/app/shared/practica-guiada/solucion-guiada.spec.ts' --include='src/app/shared/domain/matriz-vista/*.spec.ts' --include='src/app/shared/autoevaluacion-mejorada/**/*.spec.ts' --include='src/app/components/modulo3/autoevaluacion/practica.spec.ts' --include='src/app/components/modulo3/autoevaluacion/solucion-guiada.spec.ts' --include='src/app/components/modulo1/tipos/**/*.spec.ts' --include='src/app/components/modulo2/tipos/directos/gauss/**/*.spec.ts' --include='src/app/components/modulo2/tipos/directos/lu/**/*.spec.ts' --include='src/app/components/modulo2/registro-modulo2.spec.ts' --include='src/app/components/modulo2/tipos/iterativos/shared/*.spec.ts'
```

Esta configuración abarca los métodos disponibles, las pantallas integradas y la regresión del módulo 3. Incluye el registro actualizado de los cuatro métodos del módulo 2 y las rutas reales de los iterativos.
