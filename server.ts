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
        socket.on('join room', (roomId: string) => {
            socket.join(roomId);
            console.log(`user joined room ${roomId}`);
        });

        socket.on('chat message', (msg: { roomId: string; nickname: string; text: string }) => {
            console.log(`${msg.roomId}/${msg.nickname}: ${msg.text}`);
            socket.to(msg.roomId).emit('chat message', msg);
        });

        socket.on('disconnect', () => {
            console.log('user disconnected');
        });
    });

    server.listen(port, () => {
        console.log(`> Ready on http://${hostname}:${port}`);
    });
});
