const socket = new WebSocket('ws://localhost:3000');

socket.onopen = () => {
    console.log('Connected to WS server');
};

socket.onmessage = (event) => {
    const data = JSON.parse(event.data);
    console.log('New message:', data);
};

socket.onclose = () => {
    console.log('Disconnected');
};