import React, { useState } from "react";
import assets from "../assets/assets";
import { useAuthContext } from "../context/AuthContext";

const Login = () => {
  const [currState, setCurrentState] = useState("Sign Up");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [bio, setBio] = useState("");
  const [isDataSubmitted, setIsDataSubmitted] = useState(false);

  const { login } = useAuthContext();

  const handleSubmit = (e) => {
    e.preventDefault();
    // console.log(name, email, password, bio);

    if (currState === "Sign Up" && !isDataSubmitted) {
      setIsDataSubmitted(true);
      return;
    }

    login(currState === "Sign Up" ? "signup" : "login", {
      name,
      email,
      password,
      bio,
    });
  };
  return (
    <div className="min-h-screen bg-cover bg-center flex items-center justify-center gap-8 sm:justify-evenly max-sm:flex-col backdrop-blur-2xl">
      {/* left */}

      <img src={assets.logo_big} alt="" className="w-[min(30vw,250px)]" />
      {/* right */}

      <form
        onSubmit={handleSubmit}
        className="border-2 bg-white/8 text-white border-gray-500 p-6 flex flex-col gap-6 rounded-lg shadow-lg"
      >
        <h2 className="text-2xl font-medium flex justify-between items-center">
          {currState}
          {isDataSubmitted && (
            <img
              className="w-5 cursor-pointer"
              src={assets.arrow_icon}
              alt=""
              onClick={() => setIsDataSubmitted(false)}
            />
          )}
        </h2>
        {currState === "Sign Up" && !isDataSubmitted && (
          <input
            onChange={(e) => setName(e.target.value)}
            value={name}
            type="text"
            placeholder="Full Name"
            className="p-2 border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            required
          />
        )}
        {!isDataSubmitted && (
          <>
            <input
              onChange={(e) => setEmail(e.target.value)}
              value={email}
              type="text"
              placeholder="Email"
              className="p-2 border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
            <input
              onChange={(e) => setPassword(e.target.value)}
              value={password}
              type="text"
              placeholder="Password"
              className="p-2 border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </>
        )}

        {currState === "Sign Up" && isDataSubmitted && (
          <textarea
            onChange={(e) => setBio(e.target.value)}
            rows={4}
            value={bio}
            placeholder="Provide a short bio..."
            className="p-2 border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            required
          ></textarea>
        )}
        <button
          type="submit"
          className="w-full bg-gradient-to-r from-purple-400 to-violet-600 text-white border-none text-sm font-light py-3 px-20 rounded-full cursor-pointer"
        >
          {currState === "Sign Up" ? "Create Account" : "Login Now"}
        </button>

        <div className="flex items-center gap-2 text-sm text-gray-500">
          <input type="checkbox" />
          <p>Agree to our terms and conditions</p>
        </div>

        <div className="flex items-center gap-2 text-sm text-gray-500">
          {currState === "Sign Up" ? (
            <>
              <p>Already have an account?</p>
              <button
                type="button"
                onClick={() => {
                  setCurrentState("Login");
                }}
              >
                Login
              </button>
            </>
          ) : (
            <>
              <p>Don't have an account?</p>
              <button
                type="button"
                onClick={() => {
                  setCurrentState("Sign Up");
                  setIsDataSubmitted(false);
                }}
              >
                Sign Up
              </button>
            </>
          )}
        </div>
      </form>
    </div>
  );
};

export default Login;
