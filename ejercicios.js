// ejercicios.js
// ================================
// Ejercicio 1: Preferencias de Usuario
// ================================

// 1. Tomamos elementos del DOM
const form = document.getElementById("form-preferencias");
const inputNombre = document.getElementById("nombre");
const inputColor = document.getElementById("color");
const saludo = document.getElementById("saludo");

// 2. Cargar preferencias al iniciar
window.addEventListener("DOMContentLoaded", () => {
  const nombreGuardado = localStorage.getItem("nombreUsuario");
  const colorGuardado = localStorage.getItem("colorFondo");

  if (nombreGuardado) {
    saludo.textContent = `Bienvenido nuevamente, ${nombreGuardado}!`;
  }

  if (colorGuardado) {
    document.body.style.backgroundColor = colorGuardado;
  }
});

// 3. Guardar preferencias con submit
form.addEventListener("submit", (e) => {
  e.preventDefault(); // Evita recargar la página

  const nombre = inputNombre.value;
  const color = inputColor.value;

  // Guardamos en LocalStorage
  localStorage.setItem("nombreUsuario", nombre);
  localStorage.setItem("colorFondo", color);

  saludo.textContent = `Guardado! Hola, ${nombre}.`;
  document.body.style.backgroundColor = color;
});


// ================================
// Ejercicio 2: Carrito con Contador
// ================================

const botonesAgregar = document.querySelectorAll(".btn-agregar");
const spanCantidad = document.getElementById("cantidad");

// Recuperar cantidad guardada
let cantidadCarrito = parseInt(localStorage.getItem("cantidadCarrito")) || 0;
spanCantidad.textContent = cantidadCarrito;

// Agregar al carrito
botonesAgregar.forEach((btn) => {
  btn.addEventListener("click", () => {
    cantidadCarrito++;
    spanCantidad.textContent = cantidadCarrito;

    // Guardar en LocalStorage
    localStorage.setItem("cantidadCarrito", cantidadCarrito);
  });
});
