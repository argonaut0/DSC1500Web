const ws = new WebSocket("ws://localhost:8081/websocket");
ws.onmessage = (event) => {
    console.debug("Websocket event:", event);
}