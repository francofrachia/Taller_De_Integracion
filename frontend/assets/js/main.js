let todosLosProductos = []; // Creamos esta variable global como "memoria"

// 1. Función para pedir los productos al Backend
async function obtenerProductos() {
    try {
        const response = await fetch(`${API_URL}/productos`);
        todosLosProductos = await response.json();
        renderizarProductos(todosLosProductos);
    } catch (error) {
        console.error("Error conectando con la API:", error);
        document.getElementById('contenedor-productos').innerHTML = "<p>Error al cargar productos.</p>";
    }
}

// 2. Funcion para dibujar los productos en el HTML

// 2. FUNCION para dibujar los productos en el HTML

// 2. FUNCION para dibujar los productos en el HTML
function renderizarProductos(lista) {
    const contenedor = document.getElementById('contenedor-productos');

    // Si no encuentra el contenedor (ej: estás en otra página), que no explote
    if (!contenedor) return;

    contenedor.innerHTML = "";

    lista.forEach(prod => {
        const card = document.createElement('div');
        card.classList.add('producto-card');

        // --- ADAPTACIÓN DE VARIABLES ---
        // 1. Buscamos el ID (si no existe id_producto, usamos id)
        const idFinal = prod.id_producto || prod.id;

        // 2. Buscamos la Imagen (si no existe imagen_url, usamos url)
        const imagenGenerica = 'https://images.unsplash.com/photo-1585366119957-e9730b6d0f60?auto=format&fit=crop&w=300&q=80';
        const srcFinal = prod.imagen_url || prod.url || imagenGenerica;

        // 3. Estructura de Agus con tus datos reales
        card.innerHTML = `
            <div class="card-image">
                <img src="${srcFinal}" alt="${prod.nombre}" onerror="this.src='${imagenGenerica}'">
            </div>
            <div class="card-content">
                <h3>${prod.nombre}</h3>
                <span class="precio-actual">$${prod.precio}</span>
                <button class="btn-add" onclick="agregarAlCarrito(${idFinal})">Añadir al carrito</button>
            </div>
        `;

        contenedor.appendChild(card);
    });
}

// Arrancamos la carga al abrir la página
obtenerProductos();

// 3. Lógica de la barra de búsqueda en tiempo real
const inputBusqueda = document.getElementById('input-busqueda');

inputBusqueda.addEventListener('input', (e) => {
    // Agarramos lo que el usuario escribió y lo pasamos a minúsculas
    const textoBuscado = e.target.value.toLowerCase();

    // Filtramos nuestra "memoria" de productos
    const productosFiltrados = todosLosProductos.filter(prod =>
        prod.nombre.toLowerCase().includes(textoBuscado)
    );

    // Volvemos a dibujar las tarjetas solo con los que coinciden
    renderizarProductos(productosFiltrados);
});