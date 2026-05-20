# Requisitos del Proyecto: Bloque Mundo 🧱

## Entrega 1: Priorización de Requerimientos

### Prioridad 1 – Esenciales (Debe tener)
1. **[Funcional]** El sistema debe permitir la venta a consumidor final de productos LEGO.
2. **[Funcional]** El sistema debe permitir al usuario registrarse ingresando nombre, apellido, correo y dirección, o utilizando una red social.
3. **[Funcional]** El sistema debe mostrar el stock disponible de cada producto (sin stock, últimas unidades).
4. **[Funcional]** El sistema debe permitir gestionar un carrito de compras.
5. **[Funcional]** El sistema debe ofrecer métodos de pago mediante Mercado Pago.
6. **[No funcional]** La app debe ser responsive para adaptarse a diferentes dispositivos.
7. **[Funcional]** El sistema debe permitir envíos a nivel nacional, indicando proveedor y calculando costo por código postal.

### Prioridad 2 – Alta (Debería tener)
1. **[Funcional - Admin]** El administrador debe poder gestionar productos, compras y stock, así como actualizar precios y crear promociones.
2. **[Funcional]** El sistema debería permitir aplicar promociones y cupones de descuento en las compras.
3. **[Funcional]** El sistema debería permitir al usuario guardar productos en favoritos.
4. **[Funcional]** El sistema debería mostrar un historial de compras del usuario.
5. **[Funcional]** El sistema debería enviar notificaciones de confirmación de compra por correo electrónico.

### Prioridad 3 – Media (Podría tener)
1. **[Funcional]** El sistema podría permitir seguimiento de envío con código de seguimiento.
2. **[Funcional]** El sistema podría permitir que los usuarios que compraron dejen comentarios visibles de forma anónima.
3. **[No funcional]** La app podría implementar un diseño con colores primarios definidos por el administrador.
4. **[Funcional]** El sistema podría mostrar una sección de “Quiénes somos” describiendo el local.

---

## Entrega 2: Casos de Uso (CU)

* **CU01 – Registrarse en el sistema:** Registro manual con datos o mediante red social.
* **CU02 – Iniciar sesión:** Login tradicional o con red social, validación de credenciales.
* **CU03 – Buscar productos:** Búsqueda por texto y filtros (edad, color, colección, categoría). Resultados paginados y ordenables.
* **CU04 – Visualizar producto:** Ficha detallada con descripción, imágenes, stock, reseñas y productos relacionados.
* **CU05 – Agregar producto al carrito:** Validación de stock al momento de agregar.
* **CU06 – Gestionar carrito:** Modificar cantidades, eliminar ítems, ver subtotales y aplicar promociones.
* **CU07 – Comprar Producto:** Checkout, selección de Mercado Pago, procesamiento y generación de orden.
* **CU08 – Consultar Historial de compras:** Listado de órdenes pasadas y estados.
* **CU09 – Marcar Producto como Favorito:** Guardar para compra futura.
* **CU10 – Comentar Producto:** Dejar reseña post-compra con validación de políticas.
* **CU11 – Consultar Promociones:** Listado de ofertas vigentes y reglas.
* **CU12 – Consultar Estado del Envío:** Tracking logístico (preparación, tránsito, entregado).
* **CU13 – Enviar email de confirmación de compra:** Emisión de comprobante y resumen vía correo.
