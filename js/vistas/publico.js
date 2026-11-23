let examenActual = null;     
let estudianteActual = null;
let resultadoActual = null;  
let examenTerminado = false;

function vistaInicio() {
  const examenes = leer("exams").filter(ex => ex.preguntas.length > 0);

  const tarjetas = examenes.length === 0
    ? `<p class="vacio">Aún no hay exámenes disponibles.</p>`
    : examenes.map(ex => `
        <article class="tarjeta tarjeta-examen">
          <h3>${ex.titulo}</h3>
          <p class="descripcion">${ex.descripcion}</p>
          <p class="info-examen">
            ⏱ ${ex.tiempo} min · 🎯 Aprueba con ${ex.aprobacion}% · 📝 ${ex.preguntas.length} preguntas
          </p>
          <button class="btn" data-codigo="${ex.codigo}">Presentar</button>
        </article>
      `).join("");

  app.innerHTML = `
    <h2 class="titulo-vista">Exámenes disponibles</h2>
    <div class="grid-examenes">${tarjetas}</div>
  `;

  app.querySelector(".grid-examenes").addEventListener("click", (e) => {
    const boton = e.target.closest("button");
    if (!boton) return;
    examenActual = buscar("exams", "codigo", boton.dataset.codigo);
    location.hash = "#/datos";
  });
}

function vistaDatos() {
  if (!examenActual) { location.hash = "#/examenes"; return; }

  app.innerHTML = `
    <section class="tarjeta datos-estudiante">
      <p class="ayuda">Va a presentar</p>
      <h2>${examenActual.titulo}</h2>
      <p class="info-examen">
        ⏱ ${examenActual.tiempo} min · 🎯 Aprueba con ${examenActual.aprobacion}% · 📝 ${examenActual.preguntas.length} preguntas
      </p>
      <form id="form-datos">
        <input id="est-id" placeholder="Número de identificación" required
               inputmode="numeric" pattern="[0-9]{6,10}"
               title="Solo números, entre 6 y 10 dígitos">
        <input id="est-nombre" placeholder="Nombre completo" required>
        <p class="error" id="error-datos"></p>
        <div class="fila-botones">
          <button type="button" class="btn-secundario" id="btn-volver">Volver</button>
          <button type="submit" class="btn">Comenzar examen</button>
        </div>
      </form>
    </section>
  `;

  document.getElementById("btn-volver").addEventListener("click", () => {
    location.hash = "#/examenes";
  });

  document.getElementById("form-datos").addEventListener("submit", (e) => {
    e.preventDefault();
    const error = document.getElementById("error-datos");
    const id = document.getElementById("est-id").value.trim();
    const nombre = document.getElementById("est-nombre").value.trim();

    // Solo números
    if (!/^[0-9]{6,10}$/.test(id)) {
      error.textContent = "La identificación debe tener solo números (entre 6 y 10 dígitos)";
      return;
    }

    // ¿Ya presentó este examen?
    const yaLoPresento = leer("results").some(
      r => r.codigoExamen === examenActual.codigo && r.idEstudiante === id
    );
    if (yaLoPresento) {
      error.textContent = "Usted ya presentó este examen. Solo se permite un intento.";
      return;
    }

    estudianteActual = { id, nombre };
    location.hash = "#/presentar";
  });
}
function vistaPresentar() {
  if (!examenActual || !estudianteActual) { location.hash = "#/examenes"; return; }
  examenTerminado = false;

  const total = examenActual.preguntas.length;

  const preguntasHTML = examenActual.preguntas.map((p, i) => `
    <fieldset class="pregunta">
      <legend>${i + 1}. ${p.texto}</legend>
      ${p.respuestas.map((r, j) => `
        <label class="opcion">
          <input type="radio" name="p-${p.id}" value="${j}">
          <span>${r.descripcion}</span>
        </label>
      `).join("")}
    </fieldset>
  `).join("");

  app.innerHTML = `
    <div class="encabezado-examen">
      <div>
        <h2>${examenActual.titulo}</h2>
        <p class="info-examen">${total} preguntas · Aprueba con ${examenActual.aprobacion}% · ${estudianteActual.nombre}</p>
      </div>
      <reloj-examen minutos="${examenActual.tiempo}"></reloj-examen>
    </div>

    <form id="form-examen-estudiante" class="tarjeta">
      ${preguntasHTML}
      <div class="pie-examen">
        <span id="progreso">0 de ${total} respondidas</span>
        <button type="submit" class="btn">Terminar examen</button>
      </div>
    </form>
  `;

  const form = document.getElementById("form-examen-estudiante");

  form.addEventListener("change", () => {
    const respondidas = form.querySelectorAll("input[type=radio]:checked").length;
    document.getElementById("progreso").textContent = `${respondidas} de ${total} respondidas`;
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const respondidas = form.querySelectorAll("input[type=radio]:checked").length;
    if (respondidas < total) {
      const ok = confirm(`Tiene ${total - respondidas} pregunta(s) sin responder. ¿Desea terminar de todas formas?`);
      if (!ok) return;
    }
    finalizarExamen();
  });

  app.querySelector("reloj-examen").addEventListener("tiempo-agotado", () => {
    alert("Se acabó el tiempo. Su examen se entregará automáticamente.");
    finalizarExamen();
  });
}

function finalizarExamen() {
  if (examenTerminado) return;
  examenTerminado = true;

  const respuestas = {};
  let correctas = 0;

  examenActual.preguntas.forEach(p => {
    const marcada = document.querySelector(`input[name="p-${p.id}"]:checked`);
    const indice = marcada ? Number(marcada.value) : null;
    respuestas[p.id] = indice;
    if (indice !== null && p.respuestas[indice].correcta) correctas++;
  });

  const total = examenActual.preguntas.length;
  const porcentaje = Math.round((correctas / total) * 100);

  resultadoActual = {
    codigoExamen: examenActual.codigo,
    tituloExamen: examenActual.titulo,
    idEstudiante: estudianteActual.id,
    nombreEstudiante: estudianteActual.nombre,
    respuestas,
    correctas,
    total,
    porcentaje,
    aprobacion: examenActual.aprobacion,
    aprobado: porcentaje >= examenActual.aprobacion,
    fecha: new Date().toISOString()
  };

  agregar("results", resultadoActual);
  estudianteActual = null;
  location.hash = "#/resultado";
}

function vistaResultado() {
  if (!resultadoActual) { location.hash = "#/examenes"; return; }
  const r = resultadoActual;

  app.innerHTML = `
    <section class="tarjeta resultado ${r.aprobado ? "aprobado" : "reprobado"}">
      <div class="icono-resultado">${r.aprobado ? "✅" : "❌"}</div>
      <p class="porcentaje">${r.porcentaje}%</p>
      <h2>${r.aprobado ? "¡Aprobado!" : "No aprobado"}</h2>
      <p class="info-examen">${r.correctas} de ${r.total} correctas · Mínimo para aprobar: ${r.aprobacion}%</p>
      <p class="info-examen">${r.tituloExamen} · ${r.nombreEstudiante} · ${new Date(r.fecha).toLocaleString("es-CO")}</p>
      <button class="btn" id="btn-inicio">Volver al inicio</button>
    </section>
  `;

  document.getElementById("btn-inicio").addEventListener("click", () => {
    examenActual = null;
    resultadoActual = null;
    location.hash = "#/examenes";
  });
}

function examenEnCurso() {
  return examenActual !== null && estudianteActual !== null && !examenTerminado;
}

window.addEventListener("beforeunload", (e) => {
  if (examenEnCurso()) e.preventDefault();
});