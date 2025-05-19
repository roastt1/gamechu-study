'use client';

import { useRef, useEffect, useState } from 'react';
import { socket } from '../../../socket';
import { useParams } from 'next/navigation';

interface Message {
    id: number;
    text: string;
    sender: 'me' | 'other';
}

export default function SocketTest() {
    const { id } = useParams();
    const [isConnected, setIsConnected] = useState(false);
    const [transport, setTransport] = useState('N/A');
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [nickname, setNickname] = useState<string>('');
    const [sentCount, setSentCount] = useState<number>(0);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const name = prompt('Enter your nickname') || `User${Math.floor(Math.random() * 1000)}`;
        setNickname(name);
    }, []);
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);
    useEffect(() => {
        function onConnect() {
            setIsConnected(true);
            setTransport(socket.io.engine.transport.name);
            socket.emit('join room', id);
        }

        function onDisconnect() {
            setIsConnected(false);
            setTransport('N/A');
        }

        function onMessage(msg: { roomId: string; nickname: string; text: string }) {
            if (msg.roomId !== id) return;
            setMessages((prev) => [
                ...prev,
                {
                    id: prev.length,
                    text: `${msg.nickname}: ${msg.text}`,
                    sender: 'other',
                },
            ]);
        }

        if (socket.connected) onConnect();
        socket.on('connect', onConnect);
        socket.on('disconnect', onDisconnect);
        socket.on('chat message', onMessage);

        return () => {
            socket.off('connect', onConnect);
            socket.off('disconnect', onDisconnect);
            socket.off('chat message', onMessage);
        };
    }, [id]);

    const sendMessage = () => {
        if (!input.trim() || sentCount >= 5) return;
        const msg = { roomId: id, nickname, text: input };
        socket.emit('chat message', msg);
        setMessages((prev) => [...prev, { id: prev.length, text: `${nickname}: ${input}`, sender: 'me' }]);
        setSentCount((count) => count + 1);
        setInput('');
    };

    return (
        <div className="p-6 max-w-lg mx-auto">
            <h2 className="text-xl font-semibold mb-2">Room: {id}</h2>
            <p className="text-sm text-gray-600 mb-1">Status: {isConnected ? 'Connected' : 'Disconnected'}</p>
            <p className="text-sm text-gray-600 mb-4">Transport: {transport}</p>

            <div className="border rounded-lg h-72 overflow-y-auto p-4 flex flex-col gap-2 bg-white shadow-sm">
                {messages.map(({ id, text, sender }) => (
                    <div
                        key={id}
                        className={`max-w-[70%] px-4 py-2 rounded-lg text-sm break-words ${
                            sender === 'me' ? 'bg-blue-500 text-white self-end' : 'bg-gray-200 text-gray-900 self-start'
                        }`}
                    >
                        {text}
                    </div>
                ))}

                <div ref={messagesEndRef} />
            </div>

            <div className="mt-4 flex gap-2 items-center">
                <input
                    type="text"
                    maxLength={100}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') sendMessage();
                    }}
                    className="flex-1 border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:bg-gray-100"
                    placeholder="100자 이내로 입력 (최대 5회)"
                    disabled={sentCount >= 5}
                />
                <button
                    onClick={sendMessage}
                    disabled={sentCount >= 5}
                    className="px-4 py-2 bg-blue-500 text-white text-sm rounded-md hover:bg-blue-600 disabled:bg-gray-300"
                >
                    Send
                </button>
            </div>
            <div className="mt-1 flex justify-between text-xs text-gray-500">
                <span className={input.length > 100 ? 'text-red-500' : ''}>{input.length} / 100</span>
                <span className={sentCount >= 5 ? 'text-red-500' : ''}>
                    남은 채팅: {Math.max(5 - sentCount, 0)} / 5
                </span>
            </div>
        </div>
    );
}
