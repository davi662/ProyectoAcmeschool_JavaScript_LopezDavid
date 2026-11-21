function leer(clave) {
  return JSON.parse(localStorage.getItem(clave)) || [];
}

function guardar(clave, datos) {
  localStorage.setItem(clave, JSON.stringify(datos));
}

function agregar(clave, item) {
  const lista = leer(clave);
  lista.push(item);
  guardar(clave, lista);
}

function buscar(clave, campo, valor) {
  return leer(clave).find(item => item[campo] === valor);
}

function eliminar(clave, campo, valor) {
  const nuevaLista = leer(clave).filter(item => item[campo] !== valor);
  guardar(clave, nuevaLista);
}

function actualizar(clave, campo, itemEditado) {
  const nuevaLista = leer(clave).map(item =>
    item[campo] === itemEditado[campo] ? itemEditado : item
  );
  guardar(clave, nuevaLista);
}

function inicializarDatos() {
  if (leer("users").length === 0) {
    agregar("users", {
      id: "0",
      nombre: "Administrador",
      email: "admin@acme.edu",
      telefono: "",
      cargo: "administrativo",
      password: "admin123"
    });
  }
}

inicializarDatos();