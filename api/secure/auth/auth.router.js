import express from "express";

import * as validator from "./auth.validator.js";
import * as controller from "./auth.controller.js";
import { catchValidationError } from "../../shared/middleware/validator.middleware.js";
import authMiddleware from "../../shared/middleware/auth.middleware.js";

const router = express.Router();

router.get("/", authMiddleware, controller.getAuthenticatedUser);

router.post("/login", validator.login, catchValidationError, controller.login);

export default router;
