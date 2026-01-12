import jwt from "jsonwebtoken";
import { env } from "./env.js";

export function requireAuth(req, res, next) {
  const token = req.headers.authorization;
  
  if (!token) return res.status(401).json({ error: "No token" });
  try {
    const decoded = jwt.verify(token, env.jwtAccess);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid token" });
  }
}
