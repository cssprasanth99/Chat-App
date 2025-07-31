import Message from "../models/Message.js";
import User from "../models/user.js";
import cloudinary from "../lib/cloudinary.js";
import { io, userSocketMap } from "../server.js";

//get all users except the logged in user
export const getAllUsers = async (req, res) => {
  try {
    const filteredUsers = await User.find({
      _id: { $ne: req.user._id },
    }).select("-password");

    const userId = req.user._id;

    //count the number of unseen messages
    const unseenMessages = {};
    //Step 1: create an array of promises
    const promises = filteredUsers.map((user) =>
      Message.find({
        senderId: user._id,
        receiverId: userId,
        seen: false,
      })
    );

    //Step 2: wait for all promises to resolve
    const result = await Promise.all(promises);

    //Step 3: create object with the unseen messages
    result.forEach((messages, index) => {
      if (messages.length > 0) {
        unseenMessages[filteredUsers[index]._id] = messages.length;
      }
    });

    res.json({ status: true, users: filteredUsers, unseenMessages });
  } catch (error) {
    console.error(error);
    res.json({ status: false, error: error.message });
  }
};

//Get all messages for selected user

export const getMessages = async (req, res) => {
  try {
    const { id: selectedUserId } = req.params;
    const myId = req.user._id;
    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: selectedUserId },
        { senderId: selectedUserId, receiverId: myId },
      ],
    });
    await Message.updateMany(
      { senderId: selectedUserId, receiverId: myId },
      { seen: true }
    );
    res.json({ status: true, messages });
  } catch (error) {
    console.error(error);
    res.json({ status: false, error: error.message });
  }
};

//api to mark message as seen using message id
export const markMessageAsSeen = async (req, res) => {
  try {
    const { id: messageId } = req.params;
    const message = await Message.findByIdAndUpdate(messageId, { seen: true });
    res.json({ status: true, message });
  } catch (error) {
    console.error(error);
    res.json({ status: false, error: error.message });
  }
};

//send message to  selected user
export const sendMessage = async (req, res) => {
  try {
    const { text, image } = req.body;
    const receiverId = req.params.id;
    const myId = req.user._id;

    let imageUrl;
    if (image) {
      const upload = await cloudinary.uploader.upload(image);
      imageUrl = upload.secure_url;
    }
    const newMessage = await Message.create({
      senderId: myId,
      receiverId,
      text,
      image: imageUrl,
    });

    //Emit the new message to the receiver
    const receiverSocketId = userSocketMap[receiverId];
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage);
    }

    res.json({ status: true, newMessage });
  } catch (error) {
    console.error(error);
    res.json({ status: false, error: error.message });
  }
};
