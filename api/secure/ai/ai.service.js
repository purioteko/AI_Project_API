import SystemPrompt from "../../shared/models/SystemPrompt/SystemPrompt.js";
import * as ollamaService from "../../shared/services/ollama/ollama.service.js";

export const getSystemPrompts = async (userId) => {
  const systemPrompts = await SystemPrompt.find({ user: userId });

  return systemPrompts;
};

export const createSystemPrompt = async (description, text, userId) => {
  const systemPrompt = new SystemPrompt({
    description,
    text,
    user: userId,
  });

  await systemPrompt.save();

  return systemPrompt;
};

export const updateSystemPrompt = async (
  description,
  text,
  systemPromptId,
  userId
) => {
  const systemPrompt = await SystemPrompt.findOne({
    _id: systemPromptId,
    user: userId,
  });

  if (!systemPrompt) {
    return false;
  }

  systemPrompt.description = description;
  systemPrompt.text = text;

  await systemPrompt.save();

  return systemPrompt;
};

export const deleteSystemPrompt = async (systemPromptId, userId) => {
  try {
    const systemPrompt = await SystemPrompt.findOne({
      _id: systemPromptId,
      user: userId,
    });

    if (!systemPrompt) {
      throw new Error("System Prompt not found");
    }

    await SystemPrompt.deleteOne({
      _id: systemPromptId,
      user: userId,
    });

    return true;
  } catch (err) {
    throw new Error(err.message);
  }
};

export const getSystemPrompt = async (systemPromptId, userId) => {
  const systemPrompt = await SystemPrompt.findOne({
    _id: systemPromptId,
    user: userId,
  });

  return systemPrompt;
};

export const processShortcut = async (imageText, userPrompt) => {
  const response = await ollamaService.shortcutGenerate(userPrompt, imageText);
  return response;
};
