# Práctica guiada de los módulos 1 y 2

Las seis páginas de métodos del módulo 1, las páginas de Gauss y LU del módulo 2 y la autoevaluación general del módulo 1 usan tandas aleatorias. El botón «Generar otra tanda» renueva la selección y recargar la página inicia una sesión nueva. La práctica general conserva un ejercicio por método.

Cada método disponible conserva sus ejercicios anteriores y agrega 21 problemas, para un total de 24. Las tandas seleccionan tres numéricos y tres de aplicación; cada ejercicio recibe cuatro preguntas y alternativas mezcladas. La selección y el avance se conservan en memoria durante la sesión. La tanda siguiente excluye los ejercicios de la anterior.

- Módulo 1: `components/modulo1/autoevaluacion/bancos/crear-banco.ts`. Las funciones y los parámetros se resuelven con los motores existentes. El catálogo también alimenta la práctica transversal.
- Módulo 2: `components/modulo2/autoevaluacion/crear-banco.ts`. Las matrices de las etapas se calculan por operaciones elementales y se contrastan con los motores de Gauss y LU. El problema singular original de Gauss conserva su diagnóstico y no ofrece un vector numérico ficticio.
- `SolucionGuiada` recibe etapas con operaciones, preguntas, gráficos y matrices. El desarrollo completo se crea después de culminar la guía. El bloqueo previo sigue a cargo de `SolutionGateService`.
- `FormulaMatematica` presenta fracciones, potencias, raíces cuadradas y cúbicas y ecuaciones en varias líneas mediante MathML. No evalúa expresiones ni inserta HTML procedente del contenido.

Desde `simumath`, ejecutar:

```sh
npm test -- --watch=false --browsers=ChromeHeadless --ts-config=src/app/shared/practica-guiada/tsconfig.tandas.spec.json --include='src/app/shared/practica-guiada/bancos.spec.ts' --include='src/app/shared/practica-guiada/paginas-practica.spec.ts' --include='src/app/shared/practica-guiada/solucion-guiada.spec.ts' --include='src/app/shared/domain/matriz-vista/*.spec.ts' --include='src/app/shared/autoevaluacion-mejorada/**/*.spec.ts' --include='src/app/components/modulo3/autoevaluacion/practica.spec.ts' --include='src/app/components/modulo3/autoevaluacion/solucion-guiada.spec.ts' --include='src/app/components/modulo1/tipos/**/*.spec.ts' --include='src/app/components/modulo2/tipos/directos/gauss/**/*.spec.ts' --include='src/app/components/modulo2/tipos/directos/lu/**/*.spec.ts'
```

Esta configuración abarca los métodos disponibles, las pantallas integradas y la regresión del módulo 3. No incluye los tests antiguos del registro del módulo 2, que todavía esperan métodos retirados del registro actual.
