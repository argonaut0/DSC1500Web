const express = require('express');
const path = require('path');
const pc1500socket = require('./pc1500-socket');
const websocket = require('ws');

const app = express();
const webport = 8080;
const port = 1111;

const pcsocket = new pc1500socket.pc1500();
const wss = new websocket.Server({port: 8081});


app.use(express.static(path.join(__dirname, "../frontend/")));


app.listen(webport, () => {
    console.log(`Listening on port ${8080}`);
});


wss.on("connection", function connection(ws) {
    ws.on("message", function incoming(message) {

    });

    function printmsg(msg) {
        ws.send(msg.toString('utf-8'));
    }
    pcsocket.register(printmsg);    
});


