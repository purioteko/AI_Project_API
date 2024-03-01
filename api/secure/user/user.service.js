import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import config from "config";

import User from "../../shared/models/User/User.js";

const updateUser = async (name, id) => {
  const user = await User.findById(id);

  if (!user) {
    return false;
  }

  user.name = name;

  await user.save();

  return true;
};

const register = async (name, email, password) => {
  let user = await User.findOne({ email });
  if (user) {
    throw new Error("A user with that email already exists.");
  }

  user = new User({
    name,
    email: email.toLowerCase(),
    password,
  });

  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(user.password, salt);

  await user.save();

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

const getOne = async (userId) => {
  const user = await User.findById(userId, "-password -__v");
  return user;
};

export { updateUser, register, getOne };
