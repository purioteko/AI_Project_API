import jwt from "jsonwebtoken";
import config from "config";

export const decodeToken = (token) => {
  const decoded = jwt.verify(token, config.get("jwtSecret"));
  return decoded;
};
