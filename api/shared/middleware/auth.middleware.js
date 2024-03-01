import jwt from "jsonwebtoken";
import config from "config";

const authMiddleware = function (req, res, next) {
  const token = req.header("x-auth-token") || req.header("Authorization");
  if (!token) {
    return res.status(401).json({ message: "No token found" });
  }
  try {
    const decoded = jwt.verify(token, config.get("jwtSecret"));
    // @ts-ignore
    req.user = decoded.user;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
};

export default authMiddleware;
