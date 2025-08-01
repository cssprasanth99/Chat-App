//Middleware for authentication
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const protectedRoute = async (req, res, next) => {
  try {
    const token = req.headers.token;

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.userId).select("-password");

    if (!token) {
      return res.json({ status: false, error: "Unauthorized" });
    }

    if (!user) {
      return res.json({ status: false, error: "User not found" });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error(error);
    res.json({ status: false, error: error.message });
  }
};

export default protectedRoute;
