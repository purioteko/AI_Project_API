import express from "express";

import * as validator from "./ai.validator.js";
import * as aiController from "./ai.controller.js";
import authMiddleware from "../../shared/middleware/auth.middleware.js";

const router = express.Router();

router.get("/contextList", authMiddleware, aiController.getContextList);

router.get("/clearContexts", authMiddleware, aiController.clearContexts);

router.delete(
  "/deleteContext/:contextId",
  authMiddleware,
  aiController.deleteContext
);

router.get("/systemPrompts", authMiddleware, aiController.getSystemPrompts);

router.post(
  "/createSystemPrompt",
  authMiddleware,
  validator.createSystemPrompt,
  aiController.createSystemPrompt
);

router.put(
  "/updateSystemPrompt",
  authMiddleware,
  validator.updateSystemPrompt,
  aiController.updateSystemPrompt
);

router.delete(
  "/deleteSystemPrompt/:systemPromptId",
  authMiddleware,
  validator.deleteSystemPrompt,
  aiController.deleteSystemPrompt
);

export default router;
