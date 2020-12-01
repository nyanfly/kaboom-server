const express = require('express')
const app = express()
const url = require('url')

const WebSocket = require('ws');

const port = 3000

const clients = [];
const debugClients = [];    // for debug information

app.use(express.static('static'))

const debugServer = new WebSocket.Server({ noServer: true });

const debugBroadcast = message => {
    debugServer.clients.forEach(ws => {
        if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ data: message }));
        }
    })
};

debugServer.on('connection', ws => {
    ws.on('message', message => {
        switch (message) {
            case "debuginit":
                const clients = [...clientServer.clients].map(client =>
                    ({ remoteAddress: client.remoteAddress }));

                debugBroadcast({ clients });
                break;
        
            case "start":
                clientServer.clients.forEach(ws => {
                    ws.send("start");
                });
                break;

            default:
                break;
        }
    })
})

const clientServer = new WebSocket.Server({ noServer: true });
clientServer.on('connection', (ws, req) => {
    console.log("client connected!");

    ws.isAlive = true;
    ws.on('pong', heartbeat);

    ws.remoteAddress = req.socket.remoteAddress;

    // tell debug servers about connection
    const clients = [...clientServer.clients].map(client => 
            ({ remoteAddress: client.remoteAddress }));

    debugBroadcast({ clients });
});

function heartbeat() {
    this.isAlive = true;
}

const interval = setInterval(function ping() {
    clientServer.clients.forEach(ws => {
        if (ws.isAlive === false) {
            ws.terminate();

        }

        ws.isAlive = false;
        ws.ping(() => {});
    });

    // tell debug servers about removals
    const clients = [...clientServer.clients].map(client =>
        ({ remoteAddress: client.remoteAddress }));

    debugBroadcast({ clients });
// TODO change this interval?
}, 10000);

clientServer.on('close', function close() {
    clearInterval(interval);
});

const server = app.listen(port, () => {
    console.log(`Listening at http://localhost:${port}`)
})

server.on('upgrade', (request, socket, head) => {
    const pathname = url.parse(request.url).pathname;

    if (pathname === '/client') {
        clientServer.handleUpgrade(request, socket, head, ws => {
            clientServer.emit('connection', ws, request);
        });
    } else if (pathname === '/debug') {
        debugServer.handleUpgrade(request, socket, head, ws => {
            debugServer.emit('connection', ws, request);
        });
    } else {
        socket.destroy();
    }
});
