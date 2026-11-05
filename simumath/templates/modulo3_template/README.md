# Plantilla Módulo 3 — método con autoevaluación de 3 actividades

Esta plantilla está basada en `lagrange-nuevo/` y trae el flujo de autoevaluación con
**Ver solución**, **Cuestionario** y **Resolución** en cada tarjeta.

## Estructura

Copiar toda esta carpeta a:

`src/app/components/modulo3/tipos/<familia>/<nombre-metodo>/`

donde:

- `<familia>`: `interpolacion` o `ajuste` (ver `registro-modulo3.ts`)
- `<nombre-metodo>`: nombre en kebab-case (ej. `newton-formas`)

## Cambios necesarios al copiar

1. Renombrar los archivos `lagrange-*` por el nombre del método.
2. Reemplazar los datos de Lagrange en `*.config.ts`, `*.contenido.ts`, `*.grafico.ts`,
   `*.service.ts` y `*.algoritmo.ts`.
3. Cambiar `rutaBase` en `*.config.ts` por la ruta real del método (por ejemplo,
   `/modulo3/tipos/interpolacion/lagrange-nuevo`). Es la base de las cuatro pestañas;
   si queda mal, los enlaces llevan a otra página.
4. Actualizar `registro-modulo3.ts` con el nuevo método.
5. Actualizar `app.routes.ts`: la ruta concreta va **antes** de `tipos/:familia` y usa
   `loadChildren`.
6. Implementar el algoritmo puro en `*.algoritmo.ts` (sin Angular).
7. Completar los textos y los datos de `*.contenido.ts`.
8. Mantener el `id` único de cada ejercicio: es la clave con la que se guarda su estado.

## Autoevaluación incluida

Cada tarjeta muestra el planteamiento, la tabla y la pista, y debajo una fila con:

| Botón | Panel | Qué hace |
|---|---|---|
| **Ver solución** | Grande | El desarrollo completo de siempre (pasos, gráfico, tabla y conclusión). |
| **Cuestionario** | Grande | 3 o 4 preguntas del ejercicio, con corrección, explicación y puntaje. |
| **Resolución** | Compacto | Verifica el resultado numérico con tolerancia y permite revelar la respuesta final. |

- Solo se abre un panel por ejercicio (acordeón); el botón activo queda presionado y con
  `aria-expanded="true"`.
- El estado (panel abierto, respuestas, resultado y si se reveló la respuesta) vive en
  `ActividadesEjercicioService`, en memoria. Cambiar de pestaña no lo borra; no se usa
  `localStorage`.
- Si un ejercicio no define `cuestionario` o `resolucion`, el bloque compartido muestra
  únicamente **Ver solución**, como antes.

## Cómo agregar un ejercicio nuevo

Agregar el objeto a `EJERCICIOS_<METODO>` como siempre y sumarle dos campos opcionales:

```ts
{
  id: 'metodo-ej-num-4',          // único en todo el Módulo 3
  titulo: 'Ejercicio 7 · …',
  tipo: 'numerico',               // 'numerico' | 'casuistica'
  planteamiento: '…',
  parametros: [...],
  interpretacion: '…',
  pasos: [...],
  algoritmo: '…',
  criterio: '…',
  conclusion: '…',
  calculo: { puntos: [...], evaluarEn: 2.25, etiqueta: '…' },

  cuestionario: [
    {
      id: 'base-central',         // único dentro del ejercicio
      tipo: 'opcion-multiple',    // 'opcion-multiple' | 'verdadero-falso'
      enunciado: '…',
      opciones: [
        { id: 'a', texto: '…' },
        { id: 'b', texto: '…' },
        { id: 'c', texto: '…' },
        { id: 'd', texto: '…' },
      ],
      correcta: 'b',              // debe ser un id de las opciones
      explicacion: '…',           // 1 o 2 líneas
    },
    // 2 o 3 preguntas más (total: 3 o 4)
  ],

  resolucion: {
    valorCorrecto: 1.78125,       // VERIFICAR con el algoritmo
    tolerancia: 0.01,             // opcional; por defecto 0.01
    unidad: 'm',                  // opcional
    etiqueta: 'P(2.25)',          // opcional
    respuestaFinalTexto:
      'P(x) = −x²/6 + 7x/6; P(2.25) = 1.78125',
  },
}
```

Reglas del cuestionario:

- Mezclar **una pregunta de cálculo**, **una conceptual** y **una de interpretación**.
- No preguntar el resultado final completo: eso lo revela el panel de resolución.
- Las preguntas de opción múltiple llevan 4 opciones; las de verdadero/falso, 2.
- La explicación debe decir **por qué** la correcta es correcta.

Reglas de la resolución:

- `valorCorrecto` se compara con `lagrange(calculo).valor` en
  `lagrange.contenido.spec.ts`. Si no coincide, el test falla.
- `respuestaFinalTexto` es una sola línea: valor final y polinomio simplificado. El paso a
  paso no se repite: sigue en **Ver solución**.
- El panel acepta coma o punto decimal y no revela la cifra hasta pulsar
  **Mostrar respuesta final**.

## Componentes compartidos que usa

- `shared/actividades-ejercicio/panel-ejercicio.*` — caja del panel.
- `shared/actividades-ejercicio/cuestionario-ejercicio.*` — preguntas y corrección.
- `shared/actividades-ejercicio/resolucion-ejercicio.*` — entrada numérica y feedback.
- `shared/actividades-ejercicio/actividades-ejercicio.service.ts` — estado compartido y
  verificador numérico.
- `shared/bloque-ejercicio-datos/*` — tarjeta que compone las tres actividades.

## Notas

- No agregar dependencias: todo se resuelve con Angular y CSS existentes.
- El servicio es `providedIn: 'root'` y guarda por `id` de ejercicio.
- Los estilos reutilizan los tokens de `src/styles.scss` (colores, radios, tipografía y
  transiciones). El movimiento se desactiva con `prefers-reduced-motion`.
- Comandos de verificación:

```bash
npm run build
CHROME_BIN=/usr/bin/chromium npx ng test --watch=false --browsers=ChromeHeadless
```
