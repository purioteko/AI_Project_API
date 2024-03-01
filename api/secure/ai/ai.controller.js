import * as contextService from "../../shared/services/context/context.service.js";
import * as aiService from "./ai.service.js";

export const getContextList = async (req, res) => {
  try {
    const { id: userId } = req.user;

    const contextList = await contextService.getContextList(userId);
    res.json(contextList);
  } catch (err) {
    console.error(err.message);
    res.status(500).send(err.message);
  }
};

export const clearContexts = async (req, res) => {
  try {
    const { id: userId } = req.user;

    await contextService.clearContexts(userId);
    res.json({ message: "Contexts cleared" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send(err.message);
  }
};

export const deleteContext = async (req, res) => {
  try {
    const { id: userId } = req.user;
    const { contextId } = req.params;

    await contextService.deleteContext(userId, contextId);
    res.json({ message: "Context deleted" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send(err.message);
  }
};

export const getSystemPrompts = async (req, res) => {
  try {
    const { id: userId } = req.user;

    const systemPrompts = await aiService.getSystemPrompts(userId);
    res.json(systemPrompts);
  } catch (err) {
    console.error(err.message);
    res.status(500).send(err.message);
  }
};

export const createSystemPrompt = async (req, res) => {
  try {
    const { id: userId } = req.user;
    const { description, text } = req.body;

    const systemPrompt = await aiService.createSystemPrompt(
      description,
      text,
      userId
    );
    res.json({ systemPrompt, success: true, message: "System Prompt created" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send(err.message);
  }
};

export const updateSystemPrompt = async (req, res) => {
  try {
    const { id: userId } = req.user;
    const { description, text, systemPromptId } = req.body;

    const systemPrompt = await aiService.updateSystemPrompt(
      description,
      text,
      systemPromptId,
      userId
    );

    if (!systemPrompt) {
      return res.status(404).json({ message: "System Prompt not found" });
    }

    res.json({ systemPrompt, success: true, message: "System Prompt updated" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send(err.message);
  }
};

export const deleteSystemPrompt = async (req, res) => {
  try {
    const { id: userId } = req.user;
    const { systemPromptId } = req.params;

    const success = await aiService.deleteSystemPrompt(systemPromptId, userId);

    if (!success) {
      return res.status(404).json({ message: "System Prompt not found" });
    }

    res.json({ message: "System Prompt deleted" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send(err.message);
  }
};
