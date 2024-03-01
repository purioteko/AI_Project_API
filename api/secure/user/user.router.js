import express from "express";

import * as validator from "./user.validator.js";
import { catchValidationError } from "../../shared/middleware/validator.middleware.js";
import authMiddleware from "../../shared/middleware/auth.middleware.js";
import * as controller from "./user.controller.js";

const router = express.Router();

router.post(
  "/",
  authMiddleware,
  validator.updateUser,
  catchValidationError,
  controller.updateUser
);

router.post(
  "/register",
  validator.registerUser,
  catchValidationError,
  controller.register
);

export default router;
