/* script.js
   - Validación de formulario (contacto)
   - Consumo de API (fakestoreapi) con fallback a productosData
   - Render / Hook sobre tarjetas .card existentes
   - Carrito dinámico: add, editar cantidad, eliminar, persistencia en localStorage
   - Contador en header y drawer de carrito
   - Mensajes tipo "toast" en pantalla (no alert bloqueante)
*/

/* -------------------------
   CONFIG
   ------------------------- */
const API_URL = 'https://fakestoreapi.com/products';
const STORAGE_KEY = 'miCarritoVintage_v1'; // key en localStorage

/* -------------------------
   UTIL: crear elemento con clases
   ------------------------- */
function el(tag, { className = '', attrs = {}, text = '' } = {}) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    for (const k in attrs) node.setAttribute(k, attrs[k]);
    if (text) node.textContent = text;
    return node;
}

/* -------------------------
   TOAST (mensajes no bloqueantes)
   ------------------------- */
function showToast(message, timeout = 2000) {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = el('div', { attrs: { id: 'toast-container' } });
        Object.assign(container.style, {
            position: 'fixed',
            right: '16px',
            bottom: '16px',
            zIndex: 9999,
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            alignItems: 'flex-end'
        });
        document.body.appendChild(container);
    }
    const t = el('div', { className: 'toast', text: message });
    Object.assign(t.style, {
        background: 'rgba(0,0,0,0.8)',
        color: 'white',
        padding: '0.6rem 0.9rem',
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
        fontSize: '14px'
    });
    container.appendChild(t);
    setTimeout(() => {
        t.style.transition = 'opacity 300ms, transform 300ms';
        t.style.opacity = '0';
        t.style.transform = 'translateY(8px)';
        setTimeout(() => t.remove(), 350);
    }, timeout);
}

/* -------------------------
   CART: funciones de persistencia y manipulación
   estructura item: { id, title, price, image, quantity }
   ------------------------- */
function loadCart() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch (e) {
        console.error('Error leyendo carrito de localStorage', e);
        return [];
    }
}

function saveCart(cart) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
    } catch (e) {
        console.error('Error guardando carrito en localStorage', e);
    }
}

function findCartItem(cart, id) {
    return cart.find(item => Number(item.id) === Number(id));
}

/* -------------------------
   UI: contador en header y drawer de carrito
   ------------------------- */
function ensureCartUI() {


    // Drawer (sidebar) del carrito
    if (!document.getElementById('cart-drawer')) {
        const drawer = el('aside', { attrs: { id: 'cart-drawer', 'aria-hidden': 'true' } });
        Object.assign(drawer.style, {
            position: 'fixed',
            right: '0',
            top: '0',
            height: '100vh',
            width: '360px',
            maxWidth: '95%',
            background: 'var(--card-bg, #fff)',
            boxShadow: '-8px 0 20px rgba(0,0,0,0.2)',
            transform: 'translateX(100%)',
            transition: 'transform 300ms ease',
            zIndex: 2000,
            padding: '1rem',
            overflowY: 'auto'
        });

        // Header del drawer
        const header = el('div', { className: 'cart-header' });

        const title = el('h3', { text: 'Tu carrito' });

        const close = el('button', { className: 'btn btn-close-cart', text: 'Cerrar' });
        close.addEventListener('click', () => toggleDrawer(false));

        // Armamos el header
        header.appendChild(title);
        header.appendChild(close);


        const list = el('div', { attrs: { id: 'cart-list' } });
        const footer = el('div', { attrs: { id: 'cart-footer' } });
        Object.assign(footer.style, { marginTop: '1rem' });

        drawer.appendChild(header);
        drawer.appendChild(list);
        drawer.appendChild(footer);
        document.body.appendChild(drawer);
    }
}

function toggleDrawer(open = true) {
    const drawer = document.getElementById('cart-drawer');
    if (!drawer) return;
    drawer.style.transform = open ? 'translateX(0)' : 'translateX(100%)';
    drawer.setAttribute('aria-hidden', String(!open));
}

/* -------------------------
   Actualizar contador (header)
   ------------------------- */
function updateCounterUI() {
    const counterSpan = document.getElementById('cart-count');
    if (!counterSpan) return;
    const cart = loadCart();
    let totalQty = 0;
    cart.forEach(i => totalQty += Number(i.quantity || 0));
    counterSpan.textContent = totalQty;
}


/* -------------------------
   Render del carrito dentro del drawer
   ------------------------- */
function renderCart() {
    const list = document.getElementById('cart-list');
    const footer = document.getElementById('cart-footer');
    if (!list || !footer) return;

    const cart = loadCart();
    list.innerHTML = '';

    if (cart.length === 0) {
        list.innerHTML = '<p>Tu carrito está vacío.</p>';
        footer.innerHTML = '';
        updateCounterUI();
        return;
    }

    let total = 0;
    cart.forEach(item => {
        const row = el('div', { className: 'cart-item' });
        Object.assign(row.style, {
            display: 'grid',
            gridTemplateColumns: '64px 1fr auto',
            gap: '0.6rem',
            paddingBottom: '0.8rem',
            borderBottom: '1px solid #ddd'
        });

        // Imagen
        const img = el('img', { attrs: { src: item.image, alt: item.title } });
        Object.assign(img.style, {
            width: '64px',
            height: '64px',
            objectFit: 'cover',
            borderRadius: '6px',
            gridRow: '1 / span 2'
        });

        // Título
        const title = el('div', { text: item.title });
        title.className = "cart-item-title";

        // Contenedor Cant / Precios
        const info = el('div', {});
        info.className = "cart-item-info";


        // Input cantidad
        const inputQty = el('input', { attrs: { type: 'number', min: 1, value: item.quantity } });
        Object.assign(inputQty.style, {
            width: '50px',
            padding: '4px'
        });

        inputQty.addEventListener('change', (e) => {
            let v = Number(e.target.value);
            if (!v || v < 1) v = 1;
            e.target.value = v;
            item.quantity = v;
            saveCart(cart);
            renderCart();
            updateCounterUI();
        });

        // Precios
        const unit = Number(item.price);
        const totalItem = unit * item.quantity;

        const priceInfo = el('div', {
            text: `$${unit.toFixed(2)} • Total: $${totalItem.toFixed(2)}`
        });

        // Botón eliminar
        const btnRemove = el('button', { className: 'btn btn-remove', text: 'Eliminar' });

        btnRemove.addEventListener('click', () => {
            const idx = cart.findIndex(ci => Number(ci.id) === Number(item.id));
            if (idx > -1) cart.splice(idx, 1);
            saveCart(cart);
            renderCart();
            updateCounterUI();
            showToast(`"${item.title}" eliminado del carrito`);
        });

        // Armado final
        info.appendChild(inputQty);
        info.appendChild(priceInfo);

        row.appendChild(img);
        row.appendChild(title);
        row.appendChild(btnRemove);
        row.appendChild(info);

        list.appendChild(row);
        total += totalItem;
    });


    footer.innerHTML = '';
    const totalDiv = el('div', { text: `Total: $${total.toFixed(2)}` });
    totalDiv.style.fontWeight = '700';
    const limpiarBtn = el('button', { className: 'btn', text: 'Vaciar carrito' });
    limpiarBtn.addEventListener('click', () => {
        if (!confirm('¿Vaciar todo el carrito?')) return;
        saveCart([]);
        renderCart();
        updateCounterUI();
    });

    footer.appendChild(totalDiv);
    footer.appendChild(limpiarBtn);
}

/* -------------------------
   Añadir producto al carrito
   ------------------------- */
function addToCart(product) {
    if (!product || !product.id) return;
    const cart = loadCart();
    const existing = findCartItem(cart, product.id);
    if (existing) {
        existing.quantity = Number(existing.quantity || 1) + 1;
    } else {
        cart.push({
            id: product.id,
            title: product.title || product.nombre || 'Producto',
            price: Number(product.price ?? product.precio ?? 0),
            image: product.image || product.imagen || '',
            quantity: 1
        });
    }
    saveCart(cart);
    updateCounterUI();
    renderCart();
    showToast(`"${product.title || product.nombre}" agregado ✔`);
}

/* -------------------------
   Render productos: si hay .card existentes, solo agregamos botón Add;
   si no, intentamos consumir API y crear cards.
   ------------------------- */
async function ensureProductsRenderedAndHook() {
    const grid = document.querySelector('.products-grid');
    if (!grid) return;

    // If cards already present (productos-ui.js ran), hook add buttons
    const existingCards = grid.querySelectorAll('.card');
    if (existingCards.length > 0) {
        // Añadir botón "Agregar al carrito" a cada tarjeta si no existe
        existingCards.forEach((card, idx) => {
            if (card.querySelector('.btn-add')) return; // ya tiene
            // Extraer información disponible de la card
            const titleEl = card.querySelector('h3');
            const priceEl = card.querySelector('p strong') || card.querySelector('p');
            const imgEl = card.querySelector('img');

            const productStub = {
                id: card.dataset.productId || (`local-${idx}`),
                title: titleEl ? titleEl.textContent.trim() : `Producto ${idx + 1}`,
                price: priceEl ? Number(priceEl.textContent.replace(/[^0-9\.,]/g, '').replace(',', '.')) || 0 : 0,
                image: imgEl ? imgEl.src : ''
            };

            const btn = el('button', { className: 'btn btn-add', text: 'Agregar al carrito' });
            btn.addEventListener('click', () => addToCart(productStub));
            card.appendChild(btn);
        });
        return;
    }

    // Si no hay tarjetas, intentamos traer de API y renderizar
    let products = null;
    try {
        const res = await fetch(API_URL);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        products = await res.json();
    } catch (err) {
        console.warn('Fallo fetch API, uso fallback local si existe productosData', err);
        // fallback: productosData global (si existe)
        if (typeof productosData !== 'undefined' && Array.isArray(productosData)) {
            // Adaptar estructura a la esperada por API fakeStore
            products = productosData.map(p => ({
                id: p.id,
                title: p.nombre,
                price: p.precio,
                image: p.imagen,
                description: p.descripcion
            }));
        } else {
            // no hay data para mostrar
            grid.innerHTML = '<p>No se pudieron cargar los productos.</p>';
            return;
        }
    }

    // Render desde 'products'
    const fragment = document.createDocumentFragment();
    products.forEach(prod => {
        const card = el('article', { className: 'card' });
        // img
        const img = el('img', { attrs: { src: prod.image || '', alt: prod.title || '' } });
        img.loading = 'lazy';
        // title
        const h3 = el('h3', { text: prod.title || 'Producto' });
        // price
        const p = el('p');
        p.innerHTML = `<strong>$${Number(prod.price).toFixed(2)}</strong>`;
        // add button
        const btn = el('button', { className: 'btn btn-add', text: 'Agregar al carrito' });
        btn.addEventListener('click', () => addToCart(prod));
        // description button (opcional)
        const btnDesc = el('button', { className: 'btn btn-desc', text: 'Ver descripción' });
        btnDesc.addEventListener('click', () => {
            const existing = card.querySelector('.desc');
            if (existing) {
                existing.remove();
                btnDesc.textContent = 'Ver descripción';
            } else {
                const pDesc = el('p', { className: 'desc', text: prod.description || '' });
                card.appendChild(pDesc);
                btnDesc.textContent = 'Ocultar descripción';
            }
        });

        card.appendChild(img);
        card.appendChild(h3);
        card.appendChild(p);
        card.appendChild(btnDesc);
        card.appendChild(btn);
        fragment.appendChild(card);
    });

    grid.innerHTML = '';
    grid.appendChild(fragment);
}

/* -------------------------
   Validación de formulario (Contact)
   ------------------------- */
function setupContactValidation() {
    const form = document.querySelector('.contact-form');
    if (!form) return;

    // Mensaje inline
    const feedback = el('div', { attrs: { id: 'form-feedback' } });
    Object.assign(feedback.style, { marginTop: '8px', color: '#b00020' });
    form.appendChild(feedback);

    form.addEventListener('submit', (e) => {
        feedback.textContent = '';
        const nombre = form.querySelector('#name');
        const email = form.querySelector('#email');
        const message = form.querySelector('#message');

        let ok = true;
        if (!nombre || !nombre.value.trim()) {
            ok = false;
            feedback.textContent = 'Completa el campo Nombre.';
            nombre.focus();
            return e.preventDefault();
        }

        if (!email || !email.value.trim()) {
            ok = false;
            feedback.textContent = 'Completa el campo Correo.';
            email.focus();
            return e.preventDefault();
        }

        // validación simple de email
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!re.test(email.value.trim())) {
            ok = false;
            feedback.textContent = 'El correo no tiene un formato válido.';
            email.focus();
            return e.preventDefault();
        }

        if (!message || !message.value.trim()) {
            ok = false;
            feedback.textContent = 'Completa el mensaje.';
            message.focus();
            return e.preventDefault();
        }

        // Si todo ok, dejamos que el formulario se envíe (Formspree)
        // Mostrar un toast y permitir envío
        showToast('Enviando mensaje…');
        // No prevenimos el envío: Formspree se encargará
    });
}

/* -------------------------
   INIT: al cargar DOM
   ------------------------- */
document.addEventListener('DOMContentLoaded', async () => {
    ensureCartUI();
    updateCounterUI();
    renderCart(); // en caso que haya items previamente
    setupContactValidation();

    // Hook / render productos luego de un tick
    await ensureProductsRenderedAndHook();

    // Si no hay tarjetas creadas por otros scripts, ensureProductsRenderedAndHook se encargó
    // Aseguramos que los botones "Agregar" existan y actualizamos contador.
    updateCounterUI();

    // Añadimos evento para abrir carrito cuando clickeen el contador
    const btn = document.getElementById('cart-btn');
    if (btn) {
        btn.addEventListener('click', () => {
            toggleDrawer(true);
            renderCart();
        });
    }

});
