// Guarda el id del usuario que se está editando. null = estamos creando uno nuevo.
let usuarioEditando = null;

function vistaUsuarios() {
  usuarioEditando = null;

  app.innerHTML = `
    <h2 class="titulo-vista">Gestión de usuarios</h2>
    <div class="gestion">

      <section class="tarjeta">
        <h3 id="titulo-form-usuario">Crear nuevo usuario</h3>
        <form id="form-usuario">
          <input id="u-id" placeholder="Número de identificación" required>
          <input id="u-nombre" placeholder="Nombre completo" required>
          <input id="u-email" type="email" placeholder="Email" required>
          <input id="u-telefono" type="tel" placeholder="Teléfono" required>
          <select id="u-cargo" required>
            <option value="">Seleccione el cargo</option>
            <option value="administrativo">Administrativo</option>
            <option value="docente">Docente</option>
          </select>
          <input id="u-password" type="password" placeholder="Contraseña" required>
          <p class="error" id="error-usuario"></p>
          <button class="btn" type="submit" id="btn-guardar-usuario">Guardar</button>
          <button class="btn-secundario" type="button" id="btn-cancelar-usuario" hidden>Cancelar</button>
        </form>
      </section>

      <section class="tarjeta">
        <h3>Lista de usuarios</h3>
        <div class="tabla-contenedor">
          <table>
            <thead>
              <tr><th>ID</th><th>Nombre</th><th>Email</th><th>Teléfono</th><th>Cargo</th><th>Acciones</th></tr>
            </thead>
            <tbody id="tabla-usuarios"></tbody>
          </table>
        </div>
      </section>

    </div>
  `;

  pintarTablaUsuarios();

  document.getElementById("form-usuario").addEventListener("submit", guardarUsuario);
  document.getElementById("btn-cancelar-usuario").addEventListener("click", limpiarFormularioUsuario);

  // UN solo listener para todos los botones de la tabla (delegación de eventos)
  document.getElementById("tabla-usuarios").addEventListener("click", (e) => {
    const boton = e.target.closest("button");
    if (!boton) return;

    const id = boton.dataset.id;
    if (boton.classList.contains("editar")) cargarUsuarioEnFormulario(id);
    if (boton.classList.contains("eliminar")) borrarUsuario(id);
  });
}

// ===== Pintar la tabla =====
function pintarTablaUsuarios() {
  const usuarios = leer("users");

  document.getElementById("tabla-usuarios").innerHTML = usuarios.map(u => `
    <tr>
      <td>${u.id}</td>
      <td>${u.nombre}</td>
      <td>${u.email}</td>
      <td>${u.telefono}</td>
      <td>${u.cargo}</td>
      <td>
        <button class="icono editar" data-id="${u.id}" title="Editar">✏️</button>
        <button class="icono eliminar" data-id="${u.id}" title="Eliminar">🗑️</button>
      </td>
    </tr>
  `).join("");
}

// ===== Crear o actualizar =====
function guardarUsuario(e) {
  e.preventDefault();
  const error = document.getElementById("error-usuario");

  const usuario = {
    id: document.getElementById("u-id").value.trim(),
    nombre: document.getElementById("u-nombre").value.trim(),
    email: document.getElementById("u-email").value.trim(),
    telefono: document.getElementById("u-telefono").value.trim(),
    cargo: document.getElementById("u-cargo").value,
    password: document.getElementById("u-password").value
  };

  // El email no puede estar repetido (salvo que sea el mismo usuario que estamos editando)
  const conEseEmail = buscar("users", "email", usuario.email);
  if (conEseEmail && conEseEmail.id !== usuarioEditando) {
    error.textContent = "Ya existe un usuario con ese email";
    return;
  }

  if (usuarioEditando === null) {
    // CREANDO
    if (buscar("users", "id", usuario.id)) {
      error.textContent = "Ya existe un usuario con esa identificación";
      return;
    }
    agregar("users", usuario);
  } else {
    // EDITANDO
    actualizar("users", "id", usuario);
  }

  limpiarFormularioUsuario();
  pintarTablaUsuarios();
}

// ===== Pasar los datos de una fila al formulario =====
function cargarUsuarioEnFormulario(id) {
  const u = buscar("users", "id", id);
  usuarioEditando = id;

  document.getElementById("u-id").value = u.id;
  document.getElementById("u-id").disabled = true; // la identificación no se cambia
  document.getElementById("u-nombre").value = u.nombre;
  document.getElementById("u-email").value = u.email;
  document.getElementById("u-telefono").value = u.telefono;
  document.getElementById("u-cargo").value = u.cargo;
  document.getElementById("u-password").value = u.password;

  document.getElementById("titulo-form-usuario").textContent = "Editar usuario";
  document.getElementById("btn-guardar-usuario").textContent = "Actualizar";
  document.getElementById("btn-cancelar-usuario").hidden = false;
  document.getElementById("error-usuario").textContent = "";
}

// ===== Volver el formulario a modo "crear" =====
function limpiarFormularioUsuario() {
  usuarioEditando = null;
  document.getElementById("form-usuario").reset();
  document.getElementById("u-id").disabled = false;
  document.getElementById("titulo-form-usuario").textContent = "Crear nuevo usuario";
  document.getElementById("btn-guardar-usuario").textContent = "Guardar";
  document.getElementById("btn-cancelar-usuario").hidden = true;
  document.getElementById("error-usuario").textContent = "";
}

// ===== Eliminar =====
function borrarUsuario(id) {
  if (id === usuarioActual().id) {
    alert("No puede eliminar su propio usuario mientras tiene la sesión abierta");
    return;
  }
  if (!confirm("¿Seguro que desea eliminar este usuario?")) return;

  eliminar("users", "id", id);
  if (usuarioEditando === id) limpiarFormularioUsuario();
  pintarTablaUsuarios();
}