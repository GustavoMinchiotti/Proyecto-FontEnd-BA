// productos-ui.js
// Render dinámico de productos en la grilla y botón "Ver descripción"

// Esperar a que el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    const grid = document.querySelector('.products-grid');
    if (!grid) return; // Si la página no tiene grid, salir silenciosamente

    // Detectar si estamos en index (mostrar pocos) o en la página de productos (mostrar todos)
    const pathname = window.location.pathname;
    // Ajuste: revisar 'index.html' o la raíz '/'
    const esIndex = pathname.includes('index.html') || pathname === '/' || pathname === '/index.html';

    // Verificar que exista la data global
    if (typeof productosData === 'undefined' || !Array.isArray(productosData)) {
        console.error('productosData no está disponible. Revisa productos-data.js');
        return;
    }

    // Elegir lista a mostrar
    const lista = esIndex ? productosData.slice(0, 4) : productosData.slice(); // copia de array

    // Limpiar contenedor (esto elimina HTML estático anterior si existe)
    grid.innerHTML = '';

    // Usar fragmento para performance
    const fragment = document.createDocumentFragment();

    lista.forEach(producto => {
        const card = document.createElement('article');
        card.className = 'card';

        // Estructura básica de la tarjeta
        // No incluimos la descripción completa por defecto
        const img = document.createElement('img');
        img.src = producto.imagen;
        img.alt = producto.nombre;

        const h3 = document.createElement('h3');
        h3.textContent = producto.nombre;

        const p = document.createElement('p');
        p.textContent = producto.descripcionCorta || producto.nombre;

        const btnVer = document.createElement('button');
        btnVer.className = 'btn btn-desc';
        btnVer.type = 'button';
        btnVer.textContent = 'Ver descripción';

        // Listener para mostrar/ocultar la descripción dentro de la tarjeta
        btnVer.addEventListener('click', (e) => {
            const tarjeta = e.currentTarget.parentElement;
            const existente = tarjeta.querySelector('.desc');

            if (existente) {
                // Si ya existe la descripción -> quitarla
                existente.remove();
                e.currentTarget.textContent = 'Ver descripción';
            } else {
                // Crear descripción completa y agregar
                const pDesc = document.createElement('p');
                pDesc.className = 'desc';
                pDesc.textContent = producto.descripcion;
                tarjeta.appendChild(pDesc);
                e.currentTarget.textContent = 'Ocultar descripción';
            }
        });


        // Armar la tarjeta
        card.appendChild(img);
        card.appendChild(h3);
        card.appendChild(p);
        card.appendChild(btnVer);


        fragment.appendChild(card);
    });

    grid.appendChild(fragment);

    console.log(`Renderizados ${lista.length} productos (${esIndex ? 'index' : 'productos.html'}).`);
});
