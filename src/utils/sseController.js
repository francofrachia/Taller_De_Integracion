let clients = [];

const subscribe = (req, res) => {
    // Headers requeridos para SSE
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    
    // Flush the headers
    res.flushHeaders();

    // Guardar el cliente
    clients.push(res);
    console.log(`Cliente SSE conectado. Total: ${clients.length}`);

    // Eliminar el cliente cuando se desconecta
    req.on('close', () => {
        clients = clients.filter(client => client !== res);
        console.log(`Cliente SSE desconectado. Total: ${clients.length}`);
    });
};

const broadcastStockUpdate = (id_producto) => {
    // Disparar a todos los clientes que el producto con 'id_producto' cambió de stock
    const message = `event: stock_update\ndata: ${JSON.stringify({ id_producto })}\n\n`;
    
    console.log(`Enviando actualización de stock por SSE para el producto ${id_producto}`);
    clients.forEach(client => {
        // write the message
        client.write(message);
    });
};

module.exports = {
    subscribe,
    broadcastStockUpdate
};
