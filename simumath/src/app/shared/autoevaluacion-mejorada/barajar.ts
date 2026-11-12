/**
 * BARAJADO REPRODUCIBLE PARA LAS ACTIVIDADES.
 *
 * Fisher–Yates sobre una copia: no modifica el contenido del método ni
 * usa `sort` con azar. El generador es inyectable para poder probar el
 * resultado sin depender de `Math.random`.
 *
 * El orden se guarda en `ActividadesEjercicioService`, así que una
 * pregunta no cambia de lugar mientras el alumno la está respondiendo,
 * pero sí puede cambiar al reintentar o al generar otra tanda.
 */
export function barajar<T>(valores: readonly T[], azar: () => number = Math.random): T[] {
  const copia = [...valores];
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(azar() * (i + 1));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia;
}

/**
 * Reordena una lista según una lista de ids guardada.
 *
 * Si el orden guardado está incompleto (por ejemplo, porque el contenido
 * cambió), conserva primero los ids conocidos y agrega al final los que
 * falten, sin perder preguntas.
 */
export function ordenarPorIds<T extends { id: string }>(
  valores: readonly T[],
  ids: readonly string[],
): T[] {
  if (ids.length === 0) return [...valores];

  const porId = new Map(valores.map((valor) => [valor.id, valor]));
  const ordenados: T[] = [];
  for (const id of ids) {
    const valor = porId.get(id);
    if (!valor) continue;
    ordenados.push(valor);
    porId.delete(id);
  }
  for (const valor of valores) {
    if (porId.has(valor.id)) {
      ordenados.push(valor);
      porId.delete(valor.id);
    }
  }
  return ordenados;
}

/** Baraja las opciones de una pregunta sin tocar la opción correcta. */
export function barajarOpciones<T extends { id: string }>(
  opciones: readonly T[],
  azar: () => number = Math.random,
): T[] {
  return barajar(opciones, azar);
}
