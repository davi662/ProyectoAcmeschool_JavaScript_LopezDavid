class EditorPreguntas extends HTMLElement {

  connectedCallback() {
    this.codigo = this.getAttribute("codigo"); 
    this.render();
  }

  get examen() {
    return buscar("exams", "codigo", this.codigo);
  }

  render() {
    const examen = this.examen;

    const listaHTML = examen.preguntas.length === 0
      ? `<p class="vacio">Este examen aún no tiene preguntas.</p>`
      : `<ol>
          ${examen.preguntas.map(p => `
            <li>
              <div class="pregunta-fila">
                <strong>${p.texto}</strong>
                <button class="icono eliminar-pregunta" data-id="${p.id}" title="Eliminar pregunta">🗑️</button>
              </div>
              <ul>
                ${p.respuestas.map(r => `
                  <li class="${r.correcta ? "correcta" : ""}">${r.descripcion} ${r.correcta ? "✔" : ""}</li>
                `).join("")}
              </ul>
            </li>
          `).join("")}
        </ol>`;

    this.innerHTML = `
      <section class="tarjeta editor-preguntas">
        <div class="editor-encabezado">
          <h3>Preguntas de: ${examen.titulo}</h3>
          <button class="icono cerrar" title="Cerrar">✖</button>
        </div>

        <div class="lista-preguntas">${listaHTML}</div>

        <form class="form-pregunta">
          <h4>Nueva pregunta</h4>
          <input name="texto" placeholder="Texto de la pregunta" required>
          <p class="ayuda">Escriba las respuestas y marque el círculo de la correcta</p>
          <div class="respuestas"></div>
          <button type="button" class="btn-secundario agregar-respuesta">+ Respuesta</button>
          <p class="error"></p>
          <button type="submit" class="btn">Guardar pregunta</button>
        </form>
      </section>
    `;

    this.agregarFilaRespuesta();
    this.agregarFilaRespuesta();
    this.conectarEventos();
  }

  agregarFilaRespuesta() {
    const fila = document.createElement("div");
    fila.className = "fila-respuesta";
    fila.innerHTML = `
      <input type="radio" name="correcta" title="Marcar como correcta">
      <input type="text" class="texto-respuesta" placeholder="Respuesta">
      <button type="button" class="icono quitar-respuesta" title="Quitar">✖</button>
    `;
    this.querySelector(".respuestas").appendChild(fila);
  }

  conectarEventos() {
    this.querySelector(".cerrar").addEventListener("click", () => this.remove());

    this.querySelector(".agregar-respuesta").addEventListener("click", () => this.agregarFilaRespuesta());

    this.querySelector(".respuestas").addEventListener("click", (e) => {
      if (e.target.classList.contains("quitar-respuesta")) {
        e.target.closest(".fila-respuesta").remove();
      }
    });

    this.querySelector(".lista-preguntas").addEventListener("click", (e) => {
      const boton = e.target.closest(".eliminar-pregunta");
      if (!boton) return;
      if (!confirm("¿Eliminar esta pregunta?")) return;

      const examen = this.examen;
      examen.preguntas = examen.preguntas.filter(p => p.id !== Number(boton.dataset.id));
      actualizar("exams", "codigo", examen);
      this.avisarCambio();
      this.render();
    });

    this.querySelector(".form-pregunta").addEventListener("submit", (e) => {
      e.preventDefault();
      this.guardarPregunta();
    });
  }

  guardarPregunta() {
    const error = this.querySelector(".form-pregunta .error");
    const texto = this.querySelector("[name=texto]").value.trim();

    const respuestas = [...this.querySelectorAll(".fila-respuesta")].map(fila => ({
      descripcion: fila.querySelector(".texto-respuesta").value.trim(),
      correcta: fila.querySelector("[type=radio]").checked
    }));

    if (respuestas.length < 2) {
      error.textContent = "La pregunta debe tener al menos 2 respuestas";
      return;
    }
    if (respuestas.some(r => r.descripcion === "")) {
      error.textContent = "Ninguna respuesta puede quedar vacía";
      return;
    }
    if (!respuestas.some(r => r.correcta)) {
      error.textContent = "Marque cuál es la respuesta correcta";
      return;
    }

    const examen = this.examen;
    examen.preguntas.push({ id: Date.now(), texto, respuestas });
    actualizar("exams", "codigo", examen);
    this.avisarCambio();
    this.render();
  }

  avisarCambio() {
    this.dispatchEvent(new CustomEvent("preguntas-cambiaron", { bubbles: true }));
  }
}

customElements.define("editor-preguntas", EditorPreguntas);