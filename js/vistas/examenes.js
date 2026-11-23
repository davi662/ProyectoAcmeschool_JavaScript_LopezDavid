let examenEditando = null;

function vistaGestionExamenes() {
  examenEditando = null;

  app.innerHTML = `
    <h2 class="titulo-vista">Gestión de exámenes</h2>
    <div class="gestion">

      <section class="tarjeta">
        <h3 id="titulo-form-examen">Nuevo examen</h3>
        <form id="form-examen">
          <input id="e-codigo" placeholder="Código del examen" required>
          <input id="e-titulo" placeholder="Título" required>
          <div class="fila-doble">
            <input id="e-tiempo" type="number" min="1" placeholder="Minutos" required>
            <input id="e-aprobacion" type="number" min="1" max="100" placeholder="% de aprobación" required>
          </div>
          <textarea id="e-descripcion" rows="3" placeholder="Descripción" required></textarea>
          <p class="error" id="error-examen"></p>
          <button class="btn" type="submit" id="btn-guardar-examen">Guardar</button>
          <button class="btn-secundario" type="button" id="btn-cancelar-examen" hidden>Cancelar</button>
        </form>
      </section>

      <section class="tarjeta">
        <h3>Lista de exámenes</h3>
        <div class="tabla-contenedor">
          <table>
            <thead>
              <tr><th>Código</th><th>Título</th><th>Tiempo</th><th>% Aprob.</th><th>Preguntas</th><th>Acciones</th></tr>
            </thead>
            <tbody id="tabla-examenes"></tbody>
          </table>
        </div>
      </section>

    </div>
    <div id="contenedor-editor"></div>
  `;

  pintarTablaExamenes();

  document.getElementById("form-examen").addEventListener("submit", guardarExamen);
  document.getElementById("btn-cancelar-examen").addEventListener("click", limpiarFormularioExamen);

  document.getElementById("tabla-examenes").addEventListener("click", (e) => {
    const boton = e.target.closest("button");
    if (!boton) return;

    const codigo = boton.dataset.codigo;
    if (boton.classList.contains("preguntas")) abrirEditorPreguntas(codigo);
    if (boton.classList.contains("editar")) cargarExamenEnFormulario(codigo);
    if (boton.classList.contains("eliminar")) borrarExamen(codigo);
  });

  document.getElementById("contenedor-editor").addEventListener("preguntas-cambiaron", pintarTablaExamenes);
}

function pintarTablaExamenes() {
  document.getElementById("tabla-examenes").innerHTML = leer("exams").map(ex => `
    <tr>
      <td>${ex.codigo}</td>
      <td>${ex.titulo}</td>
      <td>${ex.tiempo} min</td>
      <td>${ex.aprobacion}%</td>
      <td>${ex.preguntas.length}</td>
      <td class="acciones">
        <button class="btn-pequeno preguntas" data-codigo="${ex.codigo}">Preguntas</button>
        <button class="icono editar" data-codigo="${ex.codigo}" title="Editar">✏️</button>
        <button class="icono eliminar" data-codigo="${ex.codigo}" title="Eliminar">🗑️</button>
      </td>
    </tr>
  `).join("");
}

function guardarExamen(e) {
  e.preventDefault();
  const error = document.getElementById("error-examen");

  const examen = {
    codigo: document.getElementById("e-codigo").value.trim(),
    titulo: document.getElementById("e-titulo").value.trim(),
    tiempo: Number(document.getElementById("e-tiempo").value),
    aprobacion: Number(document.getElementById("e-aprobacion").value),
    descripcion: document.getElementById("e-descripcion").value.trim(),
    preguntas: []
  };

  if (examenEditando === null) {
    if (buscar("exams", "codigo", examen.codigo)) {
      error.textContent = "Ya existe un examen con ese código";
      return;
    }
    agregar("exams", examen);
  } else {
    examen.preguntas = buscar("exams", "codigo", examenEditando).preguntas;
    actualizar("exams", "codigo", examen);
  }

  limpiarFormularioExamen();
  pintarTablaExamenes();
}

function cargarExamenEnFormulario(codigo) {
  const ex = buscar("exams", "codigo", codigo);
  examenEditando = codigo;

  document.getElementById("e-codigo").value = ex.codigo;
  document.getElementById("e-codigo").disabled = true;
  document.getElementById("e-titulo").value = ex.titulo;
  document.getElementById("e-tiempo").value = ex.tiempo;
  document.getElementById("e-aprobacion").value = ex.aprobacion;
  document.getElementById("e-descripcion").value = ex.descripcion;

  document.getElementById("titulo-form-examen").textContent = "Editar examen";
  document.getElementById("btn-guardar-examen").textContent = "Actualizar";
  document.getElementById("btn-cancelar-examen").hidden = false;
  document.getElementById("error-examen").textContent = "";
}

function limpiarFormularioExamen() {
  examenEditando = null;
  document.getElementById("form-examen").reset();
  document.getElementById("e-codigo").disabled = false;
  document.getElementById("titulo-form-examen").textContent = "Nuevo examen";
  document.getElementById("btn-guardar-examen").textContent = "Guardar";
  document.getElementById("btn-cancelar-examen").hidden = true;
  document.getElementById("error-examen").textContent = "";
}

function borrarExamen(codigo) {
  if (!confirm("¿Seguro que desea eliminar este examen y todas sus preguntas?")) return;

  eliminar("exams", "codigo", codigo);
  if (examenEditando === codigo) limpiarFormularioExamen();

  const editor = document.querySelector("editor-preguntas");
  if (editor && editor.getAttribute("codigo") === codigo) editor.remove();

  pintarTablaExamenes();
}

function abrirEditorPreguntas(codigo) {
  const contenedor = document.getElementById("contenedor-editor");
  contenedor.innerHTML = `<editor-preguntas codigo="${codigo}"></editor-preguntas>`;
  contenedor.scrollIntoView({ behavior: "smooth" });
}