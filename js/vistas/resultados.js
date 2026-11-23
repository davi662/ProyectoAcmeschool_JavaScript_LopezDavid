function vistaResultados() {
  const examenes = leer("exams");

  app.innerHTML = `
    <h2 class="titulo-vista">Resultados de los estudiantes</h2>
    <section class="tarjeta">
      <div class="filtro">
        <label for="filtro-examen">Examen:</label>
        <select id="filtro-examen">
          <option value="">Todos</option>
          ${examenes.map(ex => `<option value="${ex.codigo}">${ex.titulo}</option>`).join("")}
        </select>
      </div>
      <div class="tabla-contenedor">
        <table>
          <thead>
            <tr><th>Fecha</th><th>Examen</th><th>Identificación</th><th>Estudiante</th><th>Resultado</th><th></th></tr>
          </thead>
          <tbody id="tabla-resultados"></tbody>
        </table>
      </div>
    </section>
  `;

  pintarTablaResultados("");

  document.getElementById("filtro-examen").addEventListener("change", (e) => {
    pintarTablaResultados(e.target.value);
  });

  document.getElementById("tabla-resultados").addEventListener("click", (e) => {
    const boton = e.target.closest(".ver-detalle");
    if (!boton) return;
    mostrarDetalle(Number(boton.dataset.indice), boton);
  });
}

function pintarTablaResultados(codigoFiltro) {
  const tbody = document.getElementById("tabla-resultados");

  // Guardamos la posición original de cada resultado para poder encontrarlo después
  const resultados = leer("results")
    .map((r, indice) => ({ ...r, indice }))
    .filter(r => codigoFiltro === "" || r.codigoExamen === codigoFiltro)
    .reverse(); // los más recientes primero

  if (resultados.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" class="vacio">No hay resultados todavía.</td></tr>`;
    return;
  }

  tbody.innerHTML = resultados.map(r => `
    <tr>
      <td>${new Date(r.fecha).toLocaleString("es-CO")}</td>
      <td>${r.tituloExamen}</td>
      <td>${r.idEstudiante}</td>
      <td>${r.nombreEstudiante}</td>
      <td>
        <span class="etiqueta ${r.aprobado ? "etiqueta-exito" : "etiqueta-error"}">
          ${r.porcentaje}% · ${r.aprobado ? "Aprobado" : "No aprobado"}
        </span>
      </td>
      <td><button class="btn-pequeno ver-detalle" data-indice="${r.indice}">Ver</button></td>
    </tr>
  `).join("");
}

function mostrarDetalle(indice, boton) {
  const fila = boton.closest("tr");

  // Si el detalle ya está abierto, se cierra (funciona como interruptor)
  if (fila.nextElementSibling?.classList.contains("fila-detalle")) {
    fila.nextElementSibling.remove();
    boton.textContent = "Ver";
    return;
  }

  const r = leer("results")[indice];
  const examen = buscar("exams", "codigo", r.codigoExamen);
  let contenido;

  if (!examen) {
    contenido = `<p class="vacio">Este examen fue eliminado, no se puede mostrar el detalle.</p>`;
  } else {
    contenido = `<ol class="detalle-respuestas">
      ${examen.preguntas.map(p => {
        const marcada = r.respuestas[p.id];                 // posición que eligió el estudiante
        const correcta = p.respuestas.findIndex(x => x.correcta);
        const textoMarcada = (marcada === null || marcada === undefined)
          ? "<em>Sin responder</em>"
          : p.respuestas[marcada].descripcion;
        const acerto = marcada === correcta;

        return `
          <li>
            <strong>${p.texto}</strong><br>
            <span class="${acerto ? "texto-exito" : "texto-error"}">
              ${acerto ? "✔" : "✘"} Respondió: ${textoMarcada}
            </span>
            ${acerto ? "" : `<br><span class="ayuda">Correcta: ${p.respuestas[correcta].descripcion}</span>`}
          </li>`;
      }).join("")}
    </ol>`;
  }

  fila.insertAdjacentHTML("afterend", `<tr class="fila-detalle"><td colspan="6">${contenido}</td></tr>`);
  boton.textContent = "Ocultar";
}