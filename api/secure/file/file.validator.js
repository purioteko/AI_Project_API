import { body } from "express-validator";

export const uploadFileValidator = [
  body("file").notEmpty().withMessage("File is required"),
];
