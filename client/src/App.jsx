import React from "react";
import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import { Toaster } from "react-hot-toast";
import { useAuthContext } from "./context/AuthContext";
import { Navigate } from "react-router-dom";

const App = () => {
  const { authUser } = useAuthContext();
  // console.log(authUser);
  return (
    <div className="bg-[url('./bgImage.svg')] bg-contain">
      <Toaster position="bottom-center" reverseOrder={false} />
      <Routes>
        <Route
          path="/"
          element={authUser ? <Home /> : <Navigate to="/login" />}
        />
        <Route
          path="/login"
          element={!authUser ? <Login /> : <Navigate to="/" />}
        />
        <Route
          path="/profile"
          element={
            authUser ? <Profile authUser={authUser} /> : <Navigate to="/" />
          }
        />
      </Routes>
    </div>
  );
};

export default App;
