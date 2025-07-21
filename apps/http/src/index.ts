import express from "express";
import { Server, Socket } from "socket.io";
import { createServer } from "node:http";
import z from "zod";
import { justatype } from "@repo/mynewpackage/types";
const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

const User = z.object({
  username: z.string().min(5).max(24),
  password: z.string().min(5),
});

const JoinRoomSchema = z.object({
  room: z.string().min(5),
});

const roomMessage = z.object({
  room: z.string().min(5),
  message: z.string().min(1),
});
app.use(express.json());
app.get("/", (req, res) => {
  res.send("Hello World");
});

app.post("/signup", (req, res) => {
  const data = User.parse(req.body);

  res.send({
    username: data.username,
    message: "You are signed up!",
  });
});
const rooms = new Map<string, Socket[]>();

app.post("/signin", (req, res) => {
  const data = User.parse(req.body);

  res.send({
    username: data.username,
    message: "You are signed in!",
  });
});

io.on("connection", (socket) => {
  socket.on("joinRoom", (message) => {
    const data = JoinRoomSchema.parse(message);
    if (!rooms.has(data.room)) {
      rooms.set(data.room, []);
    }
    if (!rooms.get(data.room)?.includes(socket)) {
      rooms.get(data.room)!.push(socket);
    }

    console.log(JSON.stringify(message));
  });
  socket.on("message", (message) => {
    const data = roomMessage.parse(message);
    rooms.get(data.room)!.forEach((sock) => {
      sock.emit("message", data.message);
    });
  });
  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);

    rooms.forEach((sockets, roomName) => {
      const index = sockets.indexOf(socket);
      if (index !== -1) {
        sockets.splice(index, 1);
        console.log(`Removed ${socket.id} from room: ${roomName}`);

        if (sockets.length === 0) {
          rooms.delete(roomName);
          console.log(`Deleted empty room: ${roomName}`);
        }
      }
    });
  });
  console.log("Yayyy");
});

server.listen(3001, () => {
  console.log("http server running at 3001");
});
