const dgram = require('dgram');





exports.pc1500 =  class PC1500Socket {
    constructor () {
        this._server = dgram.createSocket('udp4');
        this._onMessage = [];
        this._server.on("message", (msg, rinfo) => {
            console.log(`Received Message from ${rinfo.address}:${rinfo.port}:`);
            console.log(msg.toString('utf-8'));
            for (const f of this._onMessage) {
                f(msg);
            }
        })
        this._server.bind(1111);
    }

    register(fn) {
        this._onMessage.push(fn);
    }

}