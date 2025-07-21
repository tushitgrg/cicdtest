"use client";

import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";

export default function App() {
  const [joined, setJoined] = useState(false);
  const socket = useRef<Socket | null>(null);

  useEffect(() => {
    socket.current = io("http://localhost:3001");

    return () => {
      socket.current?.disconnect();
    };
  }, []);

  const [room, setRoom] = useState<string>("");

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      this is a test1
      {!joined ? (
        <JoinRoom
          onJoin={(roomName: string) => {
            socket.current!.emit("joinRoom", {
              room: roomName,
            });
            setRoom(roomName);
            setJoined(true);
          }}
        />
      ) : (
        <ChatRoom room={room} socket={socket.current!} />
      )}
    </div>
  );
}

interface JoinRoomProps {
  onJoin: (roomName: string) => void;
}

function JoinRoom({ onJoin }: JoinRoomProps) {
  const [room, setRoom] = useState<string>("");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (room) {
      onJoin(room);
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg w-80">
      <h2 className="text-2xl font-bold mb-4 text-center">Join a Room</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Room Name"
          value={room}
          onChange={(e) => setRoom(e.target.value)}
          className="w-full p-2 border rounded"
          required
        />
        <button
          type="submit"
          className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
        >
          Join
        </button>
      </form>
    </div>
  );
}

interface ChatRoomProps {
  room: string;
  socket: Socket;
}

interface Message {
  text: string;
}

function ChatRoom({ room, socket }: ChatRoomProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState<string>("");
  useEffect(() => {
    const handleMessage = (msg: string) => {
      console.log("Received:", msg);
      setMessages((prev) => [...prev, { text: msg }]);
    };

    socket.on("message", handleMessage);

    return () => {
      socket.off("message", handleMessage);
    };
  }, [socket]);

  const handleSend = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (input.trim()) {
      socket.emit("message", {
        room: room,
        message: input,
      });

      setInput("");
    }
  };

  return (
    <div className="bg-white w-full max-w-md p-6 rounded-xl shadow-lg">
      <h2 className="text-xl font-bold mb-2">
        Room: <span className="text-blue-600">{room}</span>
      </h2>
      <div className="border p-4 h-60 overflow-y-auto mb-4 rounded">
        {messages.length === 0 && (
          <p className="text-gray-500 text-center">No messages yet.</p>
        )}
        {messages.map((msg, idx) => (
          <div key={idx} className="mb-2">
            <span>{msg.text}</span>
          </div>
        ))}
      </div>
      <form onSubmit={handleSend} className="flex gap-2">
        <input
          type="text"
          placeholder="Type a message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 p-2 border rounded"
        />
        <button
          type="submit"
          className="bg-green-500 text-white px-4 rounded hover:bg-green-600"
        >
          Send
        </button>
      </form>
    </div>
  );
}
