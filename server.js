const express = require('express');
const { Server } = require('ws');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static('public'));

const server = app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

const wss = new Server({ server });

let users = {};

wss.on('connection', (ws) => {
    ws.on('message', (message) => {
        const data = JSON.parse(message);

        switch (data.type) {
            case 'login':
                users[data.nickname] = ws;
                broadcast({ type: 'updateUsers', users: Object.keys(users) });
                break;
            case 'message':
                broadcast({ type: 'message', nickname: data.nickname, message: data.message });
                break;
            case 'privateMessage':
                if (users[data.to]) {
                    users[data.to].send(JSON.stringify({ type: 'privateMessage', from: data.nickname, message: data.message }));
                }
                break;
            case 'disconnect':
                delete users[data.nickname];
                broadcast({ type: 'updateUsers', users: Object.keys(users) });
                break;
        }
    });

    ws.on('close', () => {
        for (let nickname in users) {
            if (users[nickname] === ws) {
                delete users[nickname];
                broadcast({ type: 'updateUsers', users: Object.keys(users) });
                break;
            }
        }
    });
});

function broadcast(data) {
    wss.clients.forEach((client) => {
        if (client.readyState === client.OPEN) {
            client.send(JSON.stringify(data));
        }
    });
}
