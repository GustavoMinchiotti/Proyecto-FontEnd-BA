document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("themeSwitcher");

  // Los nombres reales de los temas según styles.css
  const themes = ["theme-arcade-neon", "theme-vaporwave", "theme-tech-noir"];

  // Cargar el tema guardado o usar el primero
  let currentTheme = localStorage.getItem("vintage_theme") || themes[0];

  // Aplicar tema inicial
  document.body.className = currentTheme;

  // Botón tiene que reflejar el tema actual
  btn.dataset.themeIndex = themes.indexOf(currentTheme);

  btn.addEventListener("click", () => {
    let index = parseInt(btn.dataset.themeIndex);
    index = (index + 1) % themes.length;

    const newTheme = themes[index];

    // Quitar todos los temas
    document.body.classList.remove(...themes);

    // Agregar nuevo tema
    document.body.classList.add(newTheme);

    // Guardar en memoria
    localStorage.setItem("vintage_theme", newTheme);

    // Actualizar botón
    btn.dataset.themeIndex = index;
    btn.textContent =
      newTheme === "theme-arcade-neon" ? "Arcade Neon" :
      newTheme === "theme-vaporwave" ? "Vaporwave" :
      "Tech Noir";
  });
});
