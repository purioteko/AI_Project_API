import jwt from "jsonwebtoken";
import config from "config";
import bcrypt from "bcryptjs";

import User from "../../shared/models/User/User.js";

export const getAuthenticatedUser = async (id) => {
  const user = await User.findById(id).select("-password");
  return user;
};

export const login = async (email, password) => {
  const user = await User.findOne({ email: email.toLowerCase() });

  if (!user) {
    throw new Error("Invalid credentials");
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    throw new Error("Invalid credentials");
  }

  const payload = {
    user: {
      id: user.id,
    },
  };

  // @ts-ignore
  const token = jwt.sign(payload, config.get("jwtSecret"), {
    expiresIn: +config.get("tokenExperationTime"),
  });

  return token;
};
