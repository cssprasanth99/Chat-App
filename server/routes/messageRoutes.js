import express from "express";
import protectedRoute from "../middleware/auth.js";
import {
  markMessageAsSeen,
  getAllUsers,
  getMessages,
  sendMessage,
} from "../controllers/messageController.js";

const messageRouter = express.Router();

messageRouter.get("/users", protectedRoute, getAllUsers);
messageRouter.get("/:id", protectedRoute, getMessages);
messageRouter.post("/mark/:id", protectedRoute, markMessageAsSeen);
messageRouter.post("/send/:id", protectedRoute, sendMessage);

export default messageRouter;
