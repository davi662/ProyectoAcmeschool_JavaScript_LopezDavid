function iniciarSesion(email, password) {
  const usuario = leer("users").find(u => u.email === email && u.password === password);
  if (!usuario) return false;

  const sesion = { id: usuario.id, nombre: usuario.nombre, cargo: usuario.cargo };
  sessionStorage.setItem("sesion", JSON.stringify(sesion));
  return true;
}

function cerrarSesion() {
  sessionStorage.removeItem("sesion");
}

function usuarioActual() {
  return JSON.parse(sessionStorage.getItem("sesion"));
}

function estaAutenticado() {
  return usuarioActual() !== null;
}