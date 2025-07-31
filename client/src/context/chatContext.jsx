import { createContext, useEffect } from "react";
import { useState } from "react";
import { AuthContext, useAuthContext } from "../context/AuthContext";
import { toast } from "react-hot-toast";

export const ChatContext = createContext();

export const ChatContextProvider = ({ children }) => {
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [unseenMessages, setUnseenMessages] = useState({});

  const { socket, axios } = useAuthContext(AuthContext);

  const getUsers = async () => {
    try {
      const { data } = await axios.get("/api/messages/users");
      if (data.status) {
        setUsers(data.users);
        setUnseenMessages(data.unseenMessages);
      }
    } catch (error) {
      toast.error(error.message);
      console.log(error);
    }
  };

  //function to get messages from selected user
  const getMessages = async (userId) => {
    try {
      const { data } = await axios.get(`/api/messages/${userId}`);
      if (data.status) {
        setMessages(data.messages);
      }
    } catch (error) {
      toast.error(error.message);
      console.log(error);
    }
  };

  //function to send message to selected user
  const sendMessage = async (messageData) => {
    try {
      const { data } = await axios.post(
        `/api/messages/send/${selectedUser._id}`,
        messageData
      );
      if (data.status) {
        setMessages((prev) => [...prev, data.newMessage]);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
      console.log(error);
    }
  };

  // function to subscribe to message selected user
  const subscribeToMessage = async () => {
    if (!socket) return;
    socket.on("newMessage", (newMessage) => {
      if (selectedUser && newMessage.senderId === selectedUser._id) {
        newMessage.seen = true;
        setMessages((prev) => [...prev, newMessage]);
        axios.put(`/api/messages/mark/${newMessage._id}`);
      } else {
        setUnseenMessages((prev) => ({
          ...prev,
          [newMessage.senderId]: prev[newMessage.senderId]
            ? prev[newMessage.senderId] + 1
            : 1,
        }));
      }
    });
  };

  // function to unsubscribe from message selected user
  const unsubscribeFromMessage = async () => {
    if (!socket) return;
    socket.off("newMessage");
  };

  useEffect(() => {
    subscribeToMessage();
    return () => {
      unsubscribeFromMessage();
    };
  }, [socket, selectedUser]);

  return (
    <ChatContext.Provider
      value={{
        messages,
        setMessages,
        users,
        setUsers,
        selectedUser,
        setSelectedUser,
        unseenMessages,
        setUnseenMessages,
        getUsers,
        getMessages,
        sendMessage,
        subscribeToMessage,
        unsubscribeFromMessage,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};
