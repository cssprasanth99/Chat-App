import { createContext, useState, useEffect } from "react";
import axios from "axios";
import { io } from "socket.io-client";
import { toast } from "react-hot-toast";
import { useContext } from "react";

const backendUrl = import.meta.env.VITE_BACKEND_URL;
axios.defaults.baseURL = backendUrl;

export const AuthContext = createContext();

// Custom hook to use AuthContext
export const useAuthContext = () => useContext(AuthContext);

export const AuthContextProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem("token"));

  const [authUser, setAuthUser] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [socket, setSocket] = useState(null);

  //check if user is authenticated and if so, set the data and connect the socket
  const checkAuth = async () => {
    try {
      const { data } = await axios.get("/api/auth/checkauth");
      if (data.status) {
        setAuthUser(data.user);
        connectSocket(data.user);
      }
    } catch (error) {
      console.log(error);
    }
  };

  //Login function to handle user authentication and socket connection
  const login = async (state, credentials) => {
    try {
      const { data } = await axios.post("/api/auth/" + state, credentials);
      // console.log(data);
      if (data.status) {
        setAuthUser(data.userData);
        connectSocket(data.userData);
        axios.defaults.headers.common["token"] = data.token;
        localStorage.setItem("token", data.token);
        setToken(data.token);
        toast.success(data.message);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  //Logout function to handle user logout and socket disconnection
  const logout = () => {
    localStorage.removeItem("token");
    setAuthUser(null);
    setToken(null);
    setOnlineUsers([]);
    axios.defaults.headers.common["token"] = null;
    toast.success("Logged out successfully");
    socket?.disconnect();
  };

  //update profile function to handle user profile update
  const updateProfile = async (userData) => {
    try {
      const { data } = await axios.put("/api/auth/updateprofile", userData);
      if (data.status) {
        setAuthUser(data.user);
        toast.success(data.message);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  //check socket function to handle socket connection and online users updates
  const connectSocket = (userData) => {
    if (userData && !socket?.connected) {
      const newSocket = io(backendUrl, {
        auth: {
          userId: userData._id,
        },
      });
      newSocket.connect();
      setSocket(newSocket);

      newSocket.on("getOnlineUsers", (userIds) => {
        setOnlineUsers(userIds);
      });
    }
  };

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common["token"] = token;
    }
    checkAuth();
  }, []);

  const value = {
    axios,
    token,
    setToken,
    authUser,
    setAuthUser,
    onlineUsers,
    setOnlineUsers,
    socket,
    setSocket,
    checkAuth,
    connectSocket,
    login,
    logout,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
