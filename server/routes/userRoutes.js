import express from "express";
import protectedRoute from "../middleware/auth.js";
import {
  signup,
  login,
  updateProfile,
  checkAuth,
} from "../controllers/userController.js";
const userRouter = express.Router();

userRouter.post("/signup", signup);
userRouter.post("/login", login);
userRouter.put("/updateprofile", protectedRoute, updateProfile);
userRouter.get("/checkauth", protectedRoute, checkAuth);

export default userRouter;
