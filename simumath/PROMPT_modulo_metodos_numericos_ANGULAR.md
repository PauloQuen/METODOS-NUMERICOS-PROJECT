# PROMPT — Implementar el MÓDULO 1 del Portal de Métodos Numéricos (Angular)

> Pásale este documento completo a la IA que va a programar. Se trabaja **un método a la vez**, empezando por **Bisección** como plantilla. Los otros módulos del curso (2–5) se harán después con la misma lógica.

---

## 0. Forma de trabajo (OBLIGATORIO)

1. **Primero lee el proyecto.** Antes de proponer nada, revisa los archivos existentes (`methods.ts`, `criterio.ts`, `registro.ts`, `data.ejemplos.ts`, `data.casuisticas.ts`, `api-calculadoras.service.ts`, `tab-nav`, `registro-nav`, `iteration-table`, componentes `ui/`). **Reutiliza lo que ya sirve. No borres ni muevas nada sin avisar.**
2. **Después PROPÓN, no programes.** Respóndeme en lenguaje simple (sin jerga) con:
   - el árbol de carpetas final que vas a crear,
   - qué archivos actuales se mueven, se parten o se quedan,
   - cómo se va a ver cada pantalla,
   - cómo funcionarán el gráfico con pasos y la calculadora.
3. **Espera mi confirmación** ("dale") antes de implementar.
4. **Implementa solo Bisección completo.** Cuando yo lo apruebe, replicas con los demás métodos.
5. **Código simple y explicable.** Soy estudiante y tengo que presentarlo y defenderlo: nombres claros en español, comentarios cortos, nada de trucos raros.
6. **Sin paquetes nuevos.** Nada de mathjs, chart.js, KaTeX, etc. Solo Angular + TypeScript + SCSS. Gráficos con `<canvas>` o SVG propio; funciones escritas por el alumno leídas con un evaluador propio.
7. Si algo no está claro, haz **máximo una pregunta** y sigue con lo demás.

---

## 1. Contexto

Portal educativo del curso **Métodos Numéricos** (EPIS — UNSA, 2026-B). 5 fases:

| Fase | Módulo | Estado |
|------|--------|--------|
| 1 | Ecuaciones no lineales y errores | **Disponible (lo que se hace ahora)** |
| 2 | Sistemas de ecuaciones lineales | Próximamente |
| 3 | Interpolación y ajuste de curvas | Próximamente |
| 4 | Diferenciación e integración numérica | Próximamente |
| 5 | Ecuaciones diferenciales ordinarias | Próximamente |

Solo se trabaja la sección **"Módulos del curso"** del home. La sección "¿Qué quieres estudiar hoy?" NO se toca.

**Estilo visual** (el del home que ya existe): cabecera azul marino (`#0B2447` aprox.), fondo claro azulado, acento dorado/ámbar, títulos serif, texto sans-serif, tarjetas blancas con borde fino y esquinas redondeadas, "pills" pequeñas. Usar los componentes de `shared/ui` que ya existen (`ui-card`, `btn`, `badge`, `form-field`) y las variables de `styles.scss`.

---

## 2. REGLA DE ORO: separación por TIPO → MÉTODO → CONTENIDO ÚNICO

```
Módulo 1
 └── Tipo de método   (Cerrados | Abiertos | Raíces y polinomios)
      └── Método      (Bisección, Regla Falsa, Newton, ...)
           └── Contenido ÚNICO del método:
               teoría · ejemplos · autoevaluación · calculadora · algoritmo · gráfico
```

- **Cada método vive en su propia carpeta** y tiene su propia teoría, ejemplos, ejercicios, calculadora, algoritmo y forma de dibujar su gráfico.
- **Prohibido** que un método importe algo de otro método. Si se borra la carpeta `newton-raphson`, todo lo demás debe compilar y funcionar igual.
- Lo único que se comparte está en `shared/` y son **componentes de presentación genéricos** (gráfico, botones de pasos, tabla, tarjeta de ejemplo...). Estos componentes **no saben qué método es**: reciben datos por `input()` y listo.
- **Los datos NO se comparten ni se combinan:** cada método tiene su propio archivo de contenido.

---

## 3. Estructura de carpetas propuesta

> Esto es la propuesta base; en tu respuesta del punto 0.2 puedes ajustarla si ves algo mejor, explicando por qué.

```
src/app/
├── components/
│   ├── home/                              (ya existe, no se toca)
│   └── modulo1/
│       ├── modulo1.ts/html/scss           → pantalla "¿Qué quieres aprender hoy?" (3 tipos)
│       ├── modulo1.routes.ts              → rutas hijas del módulo
│       ├── integrantes/                   (ya existe, se queda igual)
│       └── tipos/
│           ├── cerrados/
│           │   ├── cerrados.ts/html/scss          → lista de métodos de este tipo
│           │   ├── biseccion/
│           │   │   ├── biseccion.routes.ts        → rutas de las 4 pestañas
│           │   │   ├── biseccion.ts/html/scss     → página del método (cabecera + tab-nav + router-outlet)
│           │   │   ├── biseccion.config.ts        → metadatos: nombre, fórmula, descripción corta, video, campos de la calculadora, columnas de la tabla
│           │   │   ├── biseccion.algoritmo.ts     → función pura: entradas → lista de iteraciones
│           │   │   ├── biseccion.grafico.ts       → cómo se dibuja ESTE método sobre el gráfico (intervalo, punto medio...)
│           │   │   ├── biseccion.contenido.ts     → teoría + ejemplos + ejercicios (solo datos)
│           │   │   ├── teoria/        teoria.ts/html/scss
│           │   │   ├── ejemplos/      ejemplos.ts/html/scss
│           │   │   ├── autoevaluacion/ autoevaluacion.ts/html/scss
│           │   │   └── calculadora/   calculadora.ts/html/scss
│           │   └── regla-falsa/       (misma estructura)
│           ├── abiertos/
│           │   ├── abiertos.ts/html/scss
│           │   ├── newton-raphson/    (misma estructura)
│           │   ├── secante/           (misma estructura)
│           │   └── punto-fijo/        (misma estructura)
│           └── raices-polinomios/     → por ahora solo pantalla "Próximamente"
│
└── shared/
    ├── models/
    │   └── metodo.model.ts            → interfaces: MetodoConfig, Iteracion, Ejemplo, Casuistica, Ejercicio, ContenidoTeoria
    ├── domain/
    │   ├── numerico/
    │   │   ├── criterio.ts            (ya existe)
    │   │   ├── errores.ts             → error absoluto, relativo, porcentual
    │   │   └── evaluador-funciones.ts → convierte texto "x^3 - x - 2" en función (sin librerías)
    │   ├── iteration-table/           (ya existe)
    │   ├── grafico-metodo/            → NUEVO: canvas genérico (ejes, cuadrícula, curva f(x), zoom)
    │   ├── pasos-control/             → NUEVO: ⏮ ◀ ▶ ⏭ ▶/⏸ + "Iteración k de N"
    │   ├── bloque-ejemplo/            → NUEVO: tarjeta 2 columnas (texto | gráfico+pasos) + conclusión + tabla
    │   ├── bloque-ejercicio/          → NUEVO: enunciado + "Ver solución" que despliega un bloque-ejemplo
    │   ├── calculadora-shell/         → NUEVO: panel de inputs + Calcular/Limpiar + respuesta + conclusión
    │   └── stat-chip/                 (ya existe)
    ├── layout/                        (tab-nav, registro-nav, app-footer ya existen; agregar breadcrumb si no hay)
    └── ui/                            (ya existe)
```

### Cómo encaja lo anterior (idea simple)
- Las páginas por pestaña de cada método (`teoria.ts`, `ejemplos.ts`, ...) son **delgadas**: leen el `*.contenido.ts` y el `*.config.ts` de SU método y se lo pasan a los componentes compartidos.
- El gráfico compartido dibuja lo común (ejes, curva). Lo propio de cada método (el intervalo de Bisección, la tangente de Newton, la telaraña de Punto Fijo) lo dibuja la función de `*.grafico.ts` de ese método.
- Si los componentes actuales `modulo1/teoria`, `ejemplos`, `autoevaluacion`, `calculadoras`, `graficos` mezclan métodos, propón cómo **partirlos y moverlos** a las carpetas de cada método (y a `shared` lo genérico). El contenido que ya está en `data.ejemplos.ts` / `data.casuisticas.ts` y `methods.ts` se **reparte por método**, no se tira.

### Convenciones de Angular
- Usar el estilo que ya tiene el proyecto: componentes **standalone**, `input()`/`output()`, `signal()`/`computed()`, control de flujo `@if` / `@for`, `templateUrl` y `styleUrl` separados (como los archivos actuales).
- **Rutas con carga perezosa** (`loadComponent` / `loadChildren`):
  ```
  /modulo1                                     → ¿Qué quieres aprender hoy?
  /modulo1/cerrados                            → lista de métodos cerrados
  /modulo1/cerrados/biseccion                  → redirige a …/teoria
  /modulo1/cerrados/biseccion/teoria
  /modulo1/cerrados/biseccion/ejemplos
  /modulo1/cerrados/biseccion/autoevaluacion
  /modulo1/cerrados/biseccion/calculadora
  ```
- Las pestañas deben ser **rutas hijas** (así funciona el botón "atrás" del navegador y se puede compartir el enlace).
- Selectores únicos por método (ej. `app-biseccion-teoria`) y clases con nombre del método (`BiseccionTeoria`).
- Los algoritmos son **funciones puras de TypeScript** (sin Angular adentro) para poder probarlas con un `.spec.ts` simple y explicarlas fácil.

---

## 4. Flujo de navegación

```
HOME → tarjeta "Módulo 1" → "Ingresar al Módulo"
  ↓
PANTALLA A  "¿Qué quieres aprender hoy?"   [Métodos cerrados] [Métodos abiertos] [Raíces y polinomios]
  ↓
PANTALLA B  lista de métodos del tipo elegido   (tarjetas con nombre, descripción corta, botón "Entrar")
  ↓
PANTALLA C  página del método con 4 pestañas
            [Teoría] [Ejemplos] [Autoevaluación] [Calculadora-Gráficos]
```

- **Agrupación del Módulo 1:** Cerrados = Bisección, Regla Falsa · Abiertos = Newton-Raphson, Secante, Punto Fijo · Raíces y polinomios = *[PENDIENTE: yo te digo qué métodos]*, por ahora tarjeta "Próximamente".
- Breadcrumb arriba (Inicio › Módulo 1 › Métodos cerrados › Bisección) y botón "Volver" en cada pantalla.
- Las 4 pestañas siempre visibles; la activa resaltada. Cambiar de pestaña **no pierde** lo que el alumno escribió en la calculadora (guardar el estado en un signal dentro del componente de la página del método).
- Módulos 2–5 en el home: etiqueta "En desarrollo" y botón deshabilitado.

---

## 5. Contenido de cada PESTAÑA

### 5.1 TEORÍA
**Bloque 1 — Concepto + mini demo (2 columnas)**
- Izquierda: *concepto teórico*, *criterio de convergencia*, botón **"Ver video"** (el enlace se define en `*.config.ts`).
- Derecha (tarjeta): ejemplo corto + **gráfico del método** + **botones de pasos**.

**Bloque 2 — Información del algoritmo (tarjeta ancha)**, siempre en este orden:
1. Fórmula (grande y visible) · 2. Interpretación de criterios · 3. Pasos del algoritmo (lista numerada) · 4. Ventajas · 5. Limitaciones · 6. Recomendaciones de uso.

**Bloque 3 — Ejemplo normal (fórmula).** Pasos: planteamiento → **criterio de convergencia** → **algoritmo** → **2 iteraciones a mano** (cuentas visibles) → **tabla de iteraciones**. Con tarjeta de algoritmo + gráfico + botones de pasos.

**Bloque 4 — Ejemplo de casuística (con enunciado).** Pasos: **extracción de datos del enunciado** → convertir a ecuación → criterio de convergencia → algoritmo → 2 iteraciones a mano → tabla de iteraciones. Con tarjeta de algoritmo + gráfico + botones de pasos.

### 5.2 EJEMPLOS ("Ejemplos / Ejercicios resueltos")
- Filtros: `Todos` · `Numéricos` · `Casuísticas`.
- Cada ejemplo = tarjeta de 2 columnas:
  - Izquierda: *numérico* → planteamiento de la ecuación y parámetros, interpretación inicial, pasos (1.ª y 2.ª iteración). *Casuística* → enunciado, interpretación inicial, extracción de datos y formulación del algoritmo según el método, pasos (1.ª y 2.ª iteración).
  - Derecha: gráfico del método + botones de pasos.
- Debajo: **conclusión/respuesta** (según criterio de convergencia, iteraciones, error final) y **tabla de iteraciones**.
- Mínimo **2 numéricos y 2 casuísticas** por método.

### 5.3 AUTOEVALUACIÓN
- Mismos filtros. Cada ejercicio muestra primero SOLO el planteamiento (fórmula y parámetros / enunciado) y un botón **"Ver solución"**.
- Al presionarlo se despliega (animación suave) la solución con la **misma estructura de Ejemplos** (interpretación, extracción de datos si es casuística, pasos, gráfico + botones, conclusión, tabla). El botón pasa a "Ocultar solución".
- Mínimo **3 numéricos y 3 casuísticas** por método, distintos a los de Ejemplos.

### 5.4 CALCULADORA-GRÁFICOS
- Izquierda (tarjeta): **parámetros del problema**, **función f(x)**, **condiciones según el método**, **tolerancia (opcional, con valor por defecto)**, botones **Calcular** y **Limpiar**.
- Derecha: gráfico del método + botones de pasos.
- Debajo: **[Respuesta]** (raíz aproximada, iteraciones, error final), **tabla de iteraciones**, **conclusión** según convergencia e iteraciones.
- Validar entradas con mensajes claros en español (ej. "f(a) y f(b) deben tener signos opuestos"). Límite máximo de iteraciones (ej. 100) con aviso. Función de ejemplo precargada.
- Funciones aceptadas: `x^3 - x - 2`, `sin(x)`, `cos(x)`, `exp(-x) - x`, `ln(x)`, `sqrt(x)`, `pi`, `e`. `^` = potencia; `2x` = `2*x` si es fácil. **Evaluador propio y seguro: PROHIBIDO usar `eval()` o `new Function()` con el texto del usuario.**
- Cada método tiene **su propia calculadora** (sus propios campos y resultado). Nada de estado compartido entre métodos.
- Revisa `api-calculadoras.service.ts`: si hoy la calculadora depende de un backend, dime en tu propuesta si conviene mantenerlo o calcular todo en el navegador con los algoritmos locales.

---

## 6. Componente "Gráfico + Botones de pasos" (el más importante)

**Gráfico (`shared/domain/grafico-metodo`)**
- Ejes con cuadrícula y números legibles; curva f(x) en azul marino; raíz aproximada en dorado.
- Nítido (ajustar a `devicePixelRatio`) y que se redimensione sin deformarse.
- Recibe: la función, el rango visible, la lista de iteraciones, el paso actual y la **función de dibujo propia del método** (`*.grafico.ts`).
- Lo propio de cada método:
  - *Bisección / Regla Falsa:* intervalo [a, b] sombreado y punto medio (o corte de la secante); el intervalo se achica.
  - *Newton-Raphson:* tangente en cada xₙ y su corte con el eje x.
  - *Secante:* recta secante entre los dos últimos puntos.
  - *Punto Fijo:* y = x y y = g(x) con la "telaraña".

**Botones de pasos (`shared/domain/pasos-control`)**
`⏮ Inicio` · `◀ Anterior` · `▶ Siguiente` · `⏭ Final` · `▶ Reproducir / ⏸ Pausar` (velocidad simple). Muestra "Iteración k de N". Se deshabilitan en los extremos. Al avanzar: el gráfico se actualiza, **se resalta la fila de la tabla** y se muestra el texto del paso (qué se calculó y por qué).

**Tabla de iteraciones (`iteration-table`, ya existe)**
Columnas definidas por cada método (ver sección 7), 6 decimales, encabezado fijo, scroll horizontal en móvil, fila actual resaltada y fila final (cumple criterio) en dorado.

---

## 7. Datos específicos de CADA método (cada uno en su carpeta)

| Método | Entradas de calculadora | Validación | Criterio de parada | Columnas de tabla |
|--------|------------------------|-----------|--------------------|-------------------|
| **Bisección** | f(x), a, b, tol | f(a)·f(b) < 0 | \|b−a\|/2 < tol o error relativo < tol | n, a, b, c, f(c), error |
| **Regla Falsa** | f(x), a, b, tol | f(a)·f(b) < 0 | \|f(c)\| < tol o error relativo < tol | n, a, b, c, f(c), error |
| **Newton-Raphson** | f(x), f'(x) (si queda vacío: derivada numérica y avisar), x₀, tol | f'(x₀) ≠ 0 | \|xₙ₊₁ − xₙ\| < tol | n, xₙ, f(xₙ), f'(xₙ), xₙ₊₁, error |
| **Secante** | f(x), x₀, x₁, tol | f(x₁) ≠ f(x₀) | \|xₙ₊₁ − xₙ\| < tol | n, xₙ₋₁, xₙ, f(xₙ₋₁), f(xₙ), xₙ₊₁, error |
| **Punto Fijo** | g(x), x₀, tol | \|g'(x)\| < 1 cerca de la raíz (advertencia si no) | \|xₙ₊₁ − xₙ\| < tol | n, xₙ, g(xₙ), error |

Cada método explica en su teoría: su **fórmula**, **cuándo falla** (Newton con derivada cero, Punto Fijo que diverge, Bisección sin cambio de signo) y el **orden de convergencia en palabras simples**.

**Errores** (en `shared/domain/numerico/errores.ts`): absoluto `|xₙ₊₁ − xₙ|`, relativo `|xₙ₊₁ − xₙ| / |xₙ₊₁|`, porcentual `× 100 %`. Mostrar cuál se usa como criterio.

---

## 8. Qué necesita el alumno para APRENDER

Recorrido natural en cada método: **entender → ver → practicar → experimentar → interpretar.**

1. **Entender** (Teoría): idea intuitiva primero, fórmula después.
2. **Ver** (Teoría/Ejemplos): ejemplos paso a paso con cuentas a mano, gráfico animado y tabla.
3. **Practicar** (Autoevaluación): resolver solo y luego "Ver solución".
4. **Experimentar** (Calculadora): sus propias funciones, cambiar tolerancia y valores iniciales.
5. **Interpretar:** todo resultado termina con una **conclusión en palabras** (¿converge?, ¿en cuántas iteraciones?, ¿qué error final?, ¿qué significa la raíz en el problema real?).

Reglas de contenido:
- Lenguaje claro, frases cortas, términos técnicos explicados la primera vez.
- **Todos los números de los ejemplos deben salir del propio algoritmo** (no escritos a mano): calcula con `*.algoritmo.ts` y verifica que coincidan con las cuentas del texto.
- Las casuísticas son realistas (ingeniería, física, finanzas simples) y muestran **cómo se pasa del enunciado a la ecuación**.
- Errores amigables: nunca pantalla en blanco.

---

## 9. Checklist de calidad (que TODO se vea bien)

- [ ] Responsive real: celular, tablet y laptop (2 columnas → 1 en pantallas chicas).
- [ ] Texto legible (mín. 15–16 px), buen contraste, jerarquía clara.
- [ ] Gráficos nítidos y redimensionables.
- [ ] Fórmulas bien presentadas con HTML/CSS (subíndices, fracciones simples), sin librerías.
- [ ] Tablas con scroll horizontal en móvil.
- [ ] Animaciones suaves y cortas.
- [ ] Estados vacíos y de error cuidados (campo vacío, función inválida, no converge).
- [ ] Botones con hover / activo / deshabilitado y accesibles con teclado.
- [ ] Mismo estilo que el home (colores, tipografías, tarjetas).
- [ ] Sin "lorem ipsum": lo que falte se marca `[PENDIENTE]`.
- [ ] `ng build` sin errores ni warnings; sin imports cruzados entre métodos.
- [ ] Algoritmos con un `.spec.ts` básico (ej. Bisección de `x^3 - x - 2` en [1, 2] da ≈ 1.5214).

---

## 10. Primera respuesta que espero de ti

Responde **solo con esto** (sin código todavía):

1. Qué archivos del proyecto actual revisaste y qué piensas hacer con cada uno (mover, partir, dejar).
2. El árbol de carpetas final (puedes ajustar el de la sección 3 explicando por qué).
3. Cómo vas a organizar las pantallas y las rutas, en lenguaje simple.
4. Cómo vas a hacer el gráfico con botones de pasos y el evaluador de funciones sin librerías.
5. Qué ejemplos y ejercicios propones para **Bisección** (2 + 2 de ejemplos, 3 + 3 de autoevaluación) con una línea cada uno.
6. Tu orden de pasos para implementar y qué dudas tienes (máximo 1 pregunta).

Cuando yo confirme, implementas **solo Bisección completo** como plantilla. Luego seguimos con los demás métodos.
