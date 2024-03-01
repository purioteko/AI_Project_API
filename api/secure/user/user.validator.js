import { check } from "express-validator";

export const updateUser = [
  check("name", "Name is required").not().isEmpty().isString(),
];

export const registerUser = [
  check("name", "Name is required").not().isEmpty().isString(),
  check("email", "Please include a valid email").isEmail(),
  check(
    "password",
    "Please enter a password with 6 or more characters"
  ).isLength({ min: 6 }),
];
