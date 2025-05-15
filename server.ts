import { createServer } from 'node:http';
import next from 'next';
import { Server } from 'socket.io';
import type { Socket } from 'socket.io';

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = 8000;

const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();
const server = createServer(handler);
const io = new Server(server);

app.prepare().then(() => {
    io.on('connection', (socket: Socket) => {
        console.log('a user connected');

        socket.on('chat message', (msg: { nickname: string; text: string }) => {
            console.log(`${msg.nickname}: ${msg.text}`);
            socket.broadcast.emit('chat message', msg);
        });

        socket.on('disconnect', () => {
            console.log('user disconnected');
        });
    });

    server.listen(port, () => {
        console.log(`> Ready on http://${hostname}:${port}`);
    });
});
