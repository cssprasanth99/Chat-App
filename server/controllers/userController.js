// signup a new user
import User from "../models/User.js";
import bcrypt from "bcryptjs";
import generateToken from "../lib/utlis.js";
import cloudinary from "../lib/cloudinary.js";
export const signup = async (req, res) => {
  try {
    const { name, email, password, bio } = req.body;
    console.log(req.body);
    if (!name || !email || !password || !bio) {
      return res.json({ status: false, message: "All fields are required" });
    }

    const user = await User.findOne({ email });
    if (user) {
      return res.json({ status: false, message: "User already exists" });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      bio,
    });

    const token = generateToken(newUser._id);
    return res.json({
      status: true,
      userData: newUser,
      token,
      message: "User created successfully",
    });
  } catch (error) {
    console.error(error);
    res.json({ status: false, message: error.message });
  }
};

// login a user
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.json({ status: false, message: "All fields are required" });
    }

    const userData = await User.findOne({ email });
    if (!userData) {
      return res.json({ status: false, message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, userData.password);
    if (!isMatch) {
      return res.json({ status: false, message: "Incorrect password" });
    }

    const token = generateToken(userData._id);
    return res.json({
      status: true,
      userData,
      token,
      message: "User logged in successfully",
    });
  } catch (error) {
    console.error(error);
    res.json({ status: false, message: error.message });
  }
};

//controller to check the user is authenticated
export const checkAuth = (req, res) => {
  res.json({ status: true, user: req.user });
};

//controller to update the user profile details
export const updateProfile = async (req, res) => {
  try {
    const { profilePic, bio, fullName } = req.body;

    const userId = req.user._id;
    let updatedUser;
    if (!profilePic) {
      updatedUser = await User.findByIdAndUpdate(
        userId,
        { bio, fullName },
        { new: true }
      );
    } else {
      const upload = await cloudinary.uploader.upload(profilePic);
      updatedUser = await User.findByIdAndUpdate(
        userId,
        { bio, fullName, profilePic: upload.secure_url },
        { new: true }
      );
    }

    return res.json({
      status: true,
      user: updatedUser,
      message: "User profile updated successfully",
    });
  } catch (error) {
    console.error(error);
    res.json({ status: false, message: error.message });
  }
};
