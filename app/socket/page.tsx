'use client';

import { useEffect, useState } from 'react';
import { socket } from '../../socket';

interface Message {
    id: number;
    text: string;
    sender: 'me' | 'other';
}

export default function SocketTest() {
    const [isConnected, setIsConnected] = useState(false);
    const [transport, setTransport] = useState('N/A');
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [nickname, setNickname] = useState<string>('');

    //user 닉네임 받기 나중에 필요 없음
    useEffect(() => {
        const name = prompt('Enter your nickname') || `User${Math.floor(Math.random() * 1000)}`;
        setNickname(name);
    }, []);

    useEffect(() => {
        function onConnect() {
            setIsConnected(true);
            setTransport(socket.io.engine.transport.name);
        }
        function onDisconnect() {
            setIsConnected(false);
            setTransport('N/A');
        }
        function onMessage(msg: { nickname: string; text: string }) {
            console.log('received msg:', msg);
            setMessages((prev) => [
                ...prev,
                {
                    id: prev.length,
                    text: `${msg.nickname}: ${msg.text}`,
                    sender: 'other',
                },
            ]);
        }

        if (socket.connected) {
            onConnect();
        }
        socket.on('connect', onConnect);
        socket.on('disconnect', onDisconnect);
        socket.on('chat message', onMessage);

        return () => {
            socket.off('connect', onConnect);
            socket.off('disconnect', onDisconnect);
            socket.off('chat message', onMessage);
        };
    }, []);

    const sendMessage = () => {
        if (!input.trim()) return;
        const msg = { nickname, text: input };
        console.log('sending msg:', msg);
        socket.emit('chat message', msg);
        setMessages((prev) => [...prev, { id: prev.length, text: `${nickname}: ${input}`, sender: 'me' }]);
        setInput('');
    };

    return (
        <div style={{ padding: 20 }}>
            <p>Status: {isConnected ? 'connected' : 'disconnected'}</p>
            <p>Transport: {transport}</p>

            <div
                style={{
                    border: '1px solid #ccc',
                    height: 300,
                    width: 400,
                    overflowY: 'auto',
                    padding: 10,
                    marginTop: 20,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 8,
                }}
            >
                {messages.map(({ id, text, sender }) => (
                    <div
                        key={id}
                        style={{
                            alignSelf: sender === 'me' ? 'flex-end' : 'flex-start',
                            background: sender === 'me' ? '#0070f3' : '#e5e5ea',
                            color: sender === 'me' ? 'white' : 'black',
                            borderRadius: 12,
                            padding: '8px 12px',
                            maxWidth: '70%',
                            wordBreak: 'break-word',
                        }}
                    >
                        {text}
                    </div>
                ))}
            </div>

            <div style={{ marginTop: 10, display: 'flex', gap: 8 }}>
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') sendMessage();
                    }}
                    style={{ flex: 1, padding: 8, fontSize: 16 }}
                    placeholder="Type your message..."
                />
                <button onClick={sendMessage} style={{ padding: '8px 16px', fontSize: 16 }}>
                    Send
                </button>
            </div>
        </div>
    );
}
