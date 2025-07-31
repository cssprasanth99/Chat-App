import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import http from "http";
import connectDB from "./lib/db.js";
import userRouter from "./routes/userRoutes.js";
import messageRouter from "./routes/messageRoutes.js";
import { Server } from "socket.io";
dotenv.config();

// app config
const app = express();
const server = http.createServer(app);

//socket config
export const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

//Store online users
export const userSocketMap = {}; //{userId:socketId}

//socket connection
io.on("connection", (socket) => {
  const userId = socket.handshake.auth.userId;
  console.log("a user connected");
  if (userId) {
    userSocketMap[userId] = socket.id;
  }

  //emit online users to all clients
  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  //disconnect
  socket.on("disconnect", () => {
    console.log("user disconnected", userId);
    delete userSocketMap[userId];
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

// middleware
app.use(cors());
app.use(express.json({ limit: "4mb" }));

//routes
app.use("/api/status", (req, res) => res.send("Server is running"));
app.use("/api/auth", userRouter);
app.use("/api/messages", messageRouter);

// db config
await connectDB();

if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 5000;
  server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

export default server;
