# Lagrange (Mejorado) — método de referencia del Módulo 3

Esta carpeta es la copia viva de la plantilla `templates/modulo3_template/`. Sirve como
ejemplo completo del flujo de autoevaluación con **Ver solución**, **Cuestionario** y
**Resolución**.

## Autoevaluación

Cada tarjeta muestra el planteamiento, la tabla y la pista, y debajo una fila con:

| Botón | Panel | Qué hace |
|---|---|---|
| **Ver solución** | Grande | El desarrollo completo de siempre (pasos, gráfico, tabla y conclusión). |
| **Cuestionario** | Grande | 3 preguntas propias del ejercicio, con corrección, explicación y puntaje. |
| **Resolución** | Compacto | Verifica el resultado numérico con tolerancia y permite revelar la respuesta final. |

- Solo se abre un panel por ejercicio (acordeón).
- El estado se guarda en `ActividadesEjercicioService` (en memoria). Cambiar de pestaña no
  borra las respuestas ni el panel abierto; no se usa `localStorage`.
- El cuestionario y la respuesta verificable están en `lagrange.contenido.ts`. Si un
  ejercicio no los define, solo aparece **Ver solución**.

## Cómo agregar un ejercicio

1. Agregar el objeto a `EJERCICIOS_LAGRANGE` con los campos de siempre (`planteamiento`,
   `calculo`, `pasos`, `conclusion`, etc.).
2. Agregar `cuestionario` con 3 o 4 preguntas:
   - una de cálculo, una conceptual y una de interpretación;
   - opción múltiple con 4 opciones o verdadero/falso con 2;
   - `correcta` debe ser el `id` de una opción;
   - una `explicacion` breve que no revele todo el desarrollo.
3. Agregar `resolucion`:

```ts
resolucion: {
  valorCorrecto: 1.78125, // verificar con el algoritmo
  tolerancia: 0.01,       // opcional
  unidad: 'm',             // opcional
  etiqueta: 'P(2.25)',     // opcional
  respuestaFinalTexto: 'P(x) = −x²/6 + 7x/6; P(2.25) = 1.78125',
}
```

4. Correr los tests: `lagrange.contenido.spec.ts` comprueba que cada `valorCorrecto`
   coincida con `lagrange(calculo).valor`, y que el cuestionario esté bien formado.
5. Ver el detalle completo de la estructura en
   `templates/modulo3_template/README.md`.

## Notas

- La base de las cuatro pestañas está en `LAGRANGE.rutaBase` (`lagrange.config.ts`). Si se
  copia el método, hay que actualizarla; si queda apuntando a otra ruta, cambiar de
  pestaña abandona la página mejorada.
- El bloque, los paneles y el servicio son compartidos con los demás métodos del módulo.
- Los estilos salen de `shared/estilos/lista.scss`, `bloque-ejercicio-datos.scss` y los
  componentes de `shared/actividades-ejercicio/`; no hay estilos duplicados por ejercicio.
- Sin dependencias nuevas.
