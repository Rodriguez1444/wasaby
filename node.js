const WebSocket = require('ws');
const url = require('url');

const wss = new WebSocket.Server({ port: 8080 });

wss.on('connection', (ws, req) => {
    const parameters = url.parse(req.url, true);
    const roomId = parameters.query.room;

    console.log('Cliente conectado a la sala:', roomId);

    ws.on('message', message => {
        console.log('Mensaje recibido:', message);

        const parsedMessage = JSON.parse(message);
        const room = parsedMessage.room;

        // Reenvía el mensaje a todos los clientes conectados a la misma sala
        wss.clients.forEach(client => {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
                const clientParameters = url.parse(client.upgradeReq.url, true);
                const clientRoomId = clientParameters.query.room;

                if (clientRoomId === room) {
                    client.send(message.toString());
                }
            }
        });
    });

    ws.on('close', () => {
        console.log('Cliente desconectado de la sala:', roomId);
    });

    ws.on('error', error => {
        console.error('Error en WebSocket:', error);
    });
});

console.log('Servidor WebSocket escuchando en el puerto 8080');