const API_URL = "http://localhost:3000/api";

// 1. Función para pedir los productos al Backend
async function obtenerProductos() {
    try {
        const response = await fetch(`${API_URL}/productos`);
        const productos = await response.json();
        renderizarProductos(productos);
    } catch (error) {
        console.error("Error conectando con la API:", error);
        document.getElementById('contenedor-productos').innerHTML = "<p>Error al cargar productos.</p>";
    }
}

// 2. Funcion para dibujar los productos en el HTML
function renderizarProductos(lista) {
    const contenedor = document.getElementById('contenedor-productos');
    contenedor.innerHTML = ""; // Limpiamos el "Cargando..."

    lista.forEach(prod => {
        const card = document.createElement('div');
        card.classList.add('producto-card');

        // Usamos la URL que viene de la base de datos o un placeholder si no hay
        const imagenUrl = prod.url || 'https://via.placeholder.com/200';

        card.innerHTML = `
            <div class="card-image">
                <img src="${imagenUrl}" alt="${prod.nombre}">
                <span class="badge-nuevo">Nuevo</span>
            </div>
            <div class="card-content">
                <h3>${prod.nombre}</h3>
                <div class="precios">
                    <span class="precio-actual">$${prod.precio}</span>
                </div>
                <p class="stock">Disponibles: ${prod.stock}</p>
                <div class="estrellas">⭐⭐⭐⭐⭐</div>
                <button class="btn-add" onclick="agregarAlCarrito(${prod.id_producto})">
                    Agregar al Carrito
                </button>
            </div>
        `;
        contenedor.appendChild(card);
    });
}

// Arrancamos la carga al abrir la página
obtenerProductos();