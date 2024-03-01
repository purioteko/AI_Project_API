import express from "express";

import * as validator from "./file.validator.js";
import * as controller from "./file.controller.js";
import authMiddleware from "../../shared/middleware/auth.middleware.js";

const router = express.Router();

// Route for uploading a file
router.post(
  "/upload",
  authMiddleware,
  validator.uploadFileValidator,
  controller.createFile
);

router.delete("/:id", authMiddleware, controller.deleteFile);

export default router;
