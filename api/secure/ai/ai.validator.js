import { check } from "express-validator";

export const createSystemPrompt = [
  check("description", "Prompt is required").not().isEmpty().isString(),
  check("text", "Text is required").not().isEmpty().isString(),
];

export const updateSystemPrompt = [
  check("description", "Prompt is required").not().isEmpty().isString(),
  check("text", "Text is required").not().isEmpty().isString(),
  check("systemPromptId", "System Prompt ID is required")
    .not()
    .isEmpty()
    .isString(),
];

export const deleteSystemPrompt = [
  check("systemPromptId", "System Prompt ID is required")
    .not()
    .isEmpty()
    .isString(),
];
