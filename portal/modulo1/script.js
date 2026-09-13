/* ============================================================
   MÓDULO 1 · ECUACIONES NO LINEALES Y ERRORES — UNSA
   Lógica del módulo: pestañas + prototipos (mocks) de las
   calculadoras de Bisección y Newton-Raphson.
   ============================================================ */

(function () {
  'use strict';

  /* ==========================================================
     SISTEMA DE PESTAÑAS (sin recargar la página)
     ========================================================== */
  const tabButtons = document.querySelectorAll('.tab-btn');
  const tabPanels = document.querySelectorAll('.tab-panel');

  /**
   * Activa una pestaña por su identificador (data-tab / id del panel).
   * @param {string} tabId - Identificador de la pestaña, ej: 'teoria'
   */
  function activateTab(tabId) {
    if (!tabId) return;

    tabButtons.forEach((btn) => {
      const isActive = btn.dataset.tab === tabId;
      btn.classList.toggle('is-active', isActive);
      btn.setAttribute('aria-selected', isActive ? 'true' : 'false');
    });

    tabPanels.forEach((panel) => {
      const isActive = panel.id === tabId;
      panel.classList.toggle('is-active', isActive);
      panel.hidden = !isActive;
    });
  }

  tabButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      activateTab(btn.dataset.tab);
      // Guardamos la sección activa en el hash para poder compartir/enlazar
      history.replaceState(null, '', '#' + btn.dataset.tab);
    });
  });

  // Al cargar la página, si hay un hash válido (#calculadoras, #ejemplos...), lo respeta
  const initialTab = window.location.hash.replace('#', '');
  if (initialTab && document.getElementById(initialTab)) {
    activateTab(initialTab);
  } else {
    activateTab('teoria');
  }

  /* ==========================================================
     UTILIDADES DE VALIDACIÓN
     ========================================================== */

  /**
   * Lee un campo del formulario y lo convierte a número.
   * Devuelve null si el valor no es un número finito.
   * @param {HTMLInputElement} field
   * @returns {number|null}
   */
  function readNumber(field) {
    const value = parseFloat(field.value);
    if (field.value.trim() === '' || Number.isNaN(value) || !Number.isFinite(value)) {
      return null;
    }
    return value;
  }

  /**
   * Muestra un mensaje de error en el área de resultado de una calculadora.
   * @param {HTMLElement} area - Contenedor de resultados
   * @param {string} message - Texto del error
   */
  function showError(area, message) {
    area.innerHTML = '<p class="alert-error"><strong>Entrada inválida:</strong> ' + message + '</p>';
  }

  /**
   * Muestra un mensaje informativo en el área de resultado de una calculadora.
   * @param {HTMLElement} area - Contenedor de resultados
   * @param {string} html - Contenido HTML a insertar
   */
  function showInfo(area, html) {
    area.innerHTML = '<div class="alert-info">' + html + '</div>';
  }

  /**
   * Prepara la estructura base de la tabla de iteraciones dentro del
   * área de resultado. Los valores reales se completarán cuando se
   * conecte el algoritmo en la próxima etapa.
   * @param {HTMLElement} area - Contenedor de resultados
   * @param {string[]} headers - Nombres de las columnas
   */
  function prepareIterationTable(area, headers) {
    const thead = headers.map((h) => '<th>' + h + '</th>').join('');
    area.innerHTML =
      '<strong>Tabla de iteraciones (prototipo — algoritmo pendiente de conectar):</strong>' +
      '<table><thead><tr>' + thead + '</tr></thead>' +
      '<tbody><tr><td colspan="' + headers.length + '">—</td></tr></tbody></table>';
  }

  /* ==========================================================
     PROTOTIPO (MOCK) · CALCULADORA DE BISECCIÓN
     Captura: intervalo [a, b], tol, maxIter.
     ========================================================== */
  const formBiseccion = document.getElementById('form-biseccion');
  const resultadoBiseccion = document.getElementById('resultado-biseccion');

  formBiseccion.addEventListener('submit', function (event) {
    event.preventDefault(); // Evita recargar la página

    const a = readNumber(document.getElementById('bis-a'));
    const b = readNumber(document.getElementById('bis-b'));
    const tol = readNumber(document.getElementById('bis-tol'));
    const maxIter = document.getElementById('bis-maxiter').value;

    /* --- Validaciones de prueba --- */
    if (a === null || b === null || tol === null || maxIter.trim() === '') {
      showError(resultadoBiseccion, 'Todos los campos son obligatorios y deben ser numéricos.');
      return;
    }
    if (a >= b) {
      showError(resultadoBiseccion, 'Debe cumplirse que a &lt; b (extremo izquierdo menor que derecho).');
      return;
    }
    if (tol <= 0) {
      showError(resultadoBiseccion, 'La tolerancia debe ser un número positivo (mayor que 0).');
      return;
    }
    const maxIterNum = parseInt(maxIter, 10);
    if (!Number.isInteger(maxIterNum) || maxIterNum < 1) {
      showError(resultadoBiseccion, 'Las iteraciones máximas deben ser un entero mayor o igual a 1.');
      return;
    }

    /* --- Alerta de prueba (comportamiento mock) --- */
    window.alert(
      'Bisección (prototipo)\n' +
      '  a = ' + a + '\n' +
      '  b = ' + b + '\n' +
      '  tol = ' + tol + '\n' +
      '  maxIter = ' + maxIterNum + '\n' +
      'Los datos se capturaron correctamente. El algoritmo se conectará en la próxima etapa.'
    );

    // Registro en consola para depuración
    console.log('[Bisección] Datos capturados:', { a, b, tol, maxIter: maxIterNum });

    // Prepara la tabla de iteraciones (estructura base vacía)
    prepareIterationTable(
      resultadoBiseccion,
      ['Iteración', 'a', 'b', 'c = (a+b)/2', 'f(c)', '|Δc|']
    );
  });

  /* ==========================================================
     PROTOTIPO (MOCK) · CALCULADORA DE NEWTON-RAPHSON
     Captura: x0, tol, maxIter.
     ========================================================== */
  const formNewton = document.getElementById('form-newton');
  const resultadoNewton = document.getElementById('resultado-newton');

  formNewton.addEventListener('submit', function (event) {
    event.preventDefault(); // Evita recargar la página

    const x0 = readNumber(document.getElementById('newton-x0'));
    const tol = readNumber(document.getElementById('newton-tol'));
    const maxIter = document.getElementById('newton-maxiter').value;

    /* --- Validaciones de prueba --- */
    if (x0 === null || tol === null || maxIter.trim() === '') {
      showError(resultadoNewton, 'Todos los campos son obligatorios y deben ser numéricos.');
      return;
    }
    if (tol <= 0) {
      showError(resultadoNewton, 'La tolerancia debe ser un número positivo (mayor que 0).');
      return;
    }
    const maxIterNum = parseInt(maxIter, 10);
    if (!Number.isInteger(maxIterNum) || maxIterNum < 1) {
      showError(resultadoNewton, 'Las iteraciones máximas deben ser un entero mayor o igual a 1.');
      return;
    }

    /* --- Alerta de prueba (comportamiento mock) --- */
    window.alert(
      'Newton-Raphson (prototipo)\n' +
      '  x0 = ' + x0 + '\n' +
      '  tol = ' + tol + '\n' +
      '  maxIter = ' + maxIterNum + '\n' +
      'Los datos se capturaron correctamente. El algoritmo se conectará en la próxima etapa.'
    );

    // Registro en consola para depuración
    console.log('[Newton-Raphson] Datos capturados:', { x0, tol, maxIter: maxIterNum });

    // Prepara la tabla de iteraciones (estructura base vacía)
    prepareIterationTable(
      resultadoNewton,
      ['Iteración', 'xₙ', 'f(xₙ)', "f'(xₙ)", 'xₙ₊₁', '|Δx|']
    );
  });

})();