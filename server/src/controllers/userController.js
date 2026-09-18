import jwt from "jsonwebtoken";
import { User } from "../models/User.js";

function createToken(user) {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not configured.");
  }

  return jwt.sign(
    { role: user.role },
    process.env.JWT_SECRET,
    { subject: user.id, expiresIn: process.env.JWT_EXPIRES_IN ?? "7d" },
  );
}

export async function register(req, res) {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ message: "Username, email and password are required." });
  }

  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    return res.status(409).json({ message: "An account with that email already exists." });
  }

  const user = await User.create({ username, email, password, role: "user" });
  res.status(201).json({ token: createToken(user), user: user.toSafeObject() });
}

export async function login(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required." });
  }

  const user = await User.findOne({ email: email.toLowerCase() }).select("+password");
  if (!user || !(await user.comparePassword(password))) {
    return res.status(401).json({ message: "Email or password is incorrect." });
  }

  res.json({ token: createToken(user), user: user.toSafeObject() });
}

export async function getCurrentUser(req, res) {
  res.json({ user: req.user.toSafeObject() });
}
