const app = document.getElementById("app");

const rutas = {
  "#/examenes":         { vista: vistaInicio,          privada: false },
  "#/login":            { vista: vistaLogin,           privada: false },
  "#/usuarios":         { vista: vistaUsuarios,        privada: true  },
  "#/gestion-examenes": { vista: vistaGestionExamenes, privada: true  },
};

function navegar() {
  const hash = location.hash || "#/examenes";
  const ruta = rutas[hash] || rutas["#/examenes"];

  if (ruta.privada && !estaAutenticado()) {
    location.hash = "#/login";
    return;
  }

  actualizarHeader();
  ruta.vista();
}

window.addEventListener("hashchange", navegar);
navegar();

function actualizarHeader() {
  const menu = document.getElementById("menu");

  if (estaAutenticado()) {
    menu.innerHTML = `
      <a href="#/usuarios">Usuarios</a>
      <a href="#/gestion-examenes">Exámenes</a>
      <a href="#" id="salir">Salir (${usuarioActual().nombre})</a>
    `;
    document.getElementById("salir").addEventListener("click", (e) => {
      e.preventDefault();
      cerrarSesion();
      location.hash = "#/examenes";
    });
  } else {
    menu.innerHTML = `
      <a href="#/examenes">Exámenes</a>
      <a href="#/login">Ingresar</a>
    `;
  }
}

function vistaLogin() {
  
  if (estaAutenticado()) {
    location.hash = "#/usuarios";
    return;
  }

  app.innerHTML = `
    <section class="tarjeta login">
      <h2>Iniciar sesión</h2>
      <form id="form-login">
        <input type="email" id="email" placeholder="Correo electrónico" required>
        <input type="password" id="password" placeholder="Contraseña" required>
        <p class="error" id="error-login"></p>
        <button class="btn" type="submit">Continuar</button>
      </form>
    </section>
  `;

  document.getElementById("form-login").addEventListener("submit", (e) => {
    e.preventDefault(); 
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    if (iniciarSesion(email, password)) {
      location.hash = "#/usuarios";
    } else {
      document.getElementById("error-login").textContent = "Correo o contraseña incorrectos";
    }
  });
}


function vistaInicio() {
  app.innerHTML = `<section class="tarjeta"><h2>Exámenes disponibles</h2><p>Próximamente…</p></section>`;
}


