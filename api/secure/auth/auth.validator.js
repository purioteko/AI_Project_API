import { check } from "express-validator";

export const login = [
  check("email", "Please include a valid email").isEmail(),
  check("password", "Please enter a password").not().isEmpty(),
];
