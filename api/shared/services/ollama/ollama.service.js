import { ChatOllama } from "@langchain/community/chat_models/ollama";
import { BaseCallbackHandler } from "@langchain/core/callbacks/base";
import { ConversationChain } from "langchain/chains";
import { ChatMessageHistory, BufferMemory } from "langchain/memory";
import { SystemMessage, AIMessage, HumanMessage } from "langchain/schema";

import * as contextService from "../context/context.service.js";
import * as documentService from "./ollama.document.service.js";

import { MODEL_CONFIG, PROMPTS } from "./ollama.config.js";

let ollama;

export const initOllama = async () => {
  try {
    console.debug("Initializing Ollama");
    ollama = new ChatOllama(MODEL_CONFIG);
    console.debug("Ollama Initialized");
  } catch (err) {
    console.error(err.message);
    throw err;
  }
};

export const handleOllamaUninitialized = async () => {
  if (!ollama) {
    console.debug("Ollama not initialized");
    await initOllama();
  }
};

// @ts-ignore
export const getContextDescription = async (
  contextId,
  userId,
  overrideMessages
) => {
  await handleOllamaUninitialized();

  const chain = await generateChainFromContext(contextId, userId, [
    {
      isSystem: true,
      text: PROMPTS.DESCRIPTION_GEN_PROMPT,
    },
    ...overrideMessages,
  ]);

  const fullResponse = await chain.call({
    input:
      "Return the title of the conversation. Only respond with the title. Do not include any other words in your response.",
  });

  return fullResponse;
};

export const upsertContext = async (
  messages,
  userId,
  contextId,
  descriptionUpdateCallback
) => {
  if (!contextId) {
    // save the context with the message
    const context = await contextService.saveContext(
      messages[0].text.slice(0, 25),
      messages,
      userId
    );

    // ask for a description
    getContextDescription(contextId, userId, messages).then(
      async ({ response: description }) => {
        console.log("setting real description");
        await contextService.setContextDescription(
          context.id,
          description.trim(),
          userId
        );

        descriptionUpdateCallback(description, context.id);
      }
    );

    return { contextId: context.id, context };
  } else {
    const context = await contextService.getContext(contextId, userId);
    if (!context) {
      throw new Error("Context not found");
    }

    // update the context with the message
    const updatedContext = await contextService.updateContext(
      contextId,
      messages,
      userId
    );

    if (context.description === "TMP_CONTEXT_NAME") {
      getContextDescription(contextId, userId, messages).then(
        async ({ response: description }) => {
          console.log("setting real description");
          await contextService.setContextDescription(
            context.id,
            description.trim(),
            userId
          );

          descriptionUpdateCallback(description, context.id);
        }
      );
    }

    return { contextId, context: updatedContext };
  }
};

export const loadContextMessages = async (contextId, userId) => {
  const context = await contextService.getContext(contextId, userId);
  if (!context) {
    return [];
  }

  return context.messages;
};

export const generateChainFromContext = async (
  contextId,
  userId,
  overrideMessages,
  systemPrompt
) => {
  let messages = [];

  if (overrideMessages) {
    messages = overrideMessages;
  } else if (contextId) {
    const context = await contextService.getContext(contextId, userId);
    if (context) {
      messages = context.messages;
    }
  }

  if (systemPrompt) {
    messages.unshift({
      isSystem: true,
      text: systemPrompt.text,
    });
  }

  const pastMessages = messages.map((message) => {
    if (message.isUser) {
      // @ts-ignore
      return new HumanMessage(message.text);
    } else if (message.isSystem) {
      return new SystemMessage(message.text);
    } else {
      // @ts-ignore
      return new AIMessage(message.text);
    }
  });

  const memory = new BufferMemory({
    // @ts-ignore
    chatHistory: new ChatMessageHistory(pastMessages),
  });

  // const memory = new langchainMemory.BufferMemory();
  const chain = new ConversationChain({
    llm: ollama,
    memory: memory,
  });

  return chain;
};

// @ts-ignore
export const streamingGenerate = async (
  prompt,
  streamingFunction,
  userId,
  contextId,
  systemPrompt
) => {
  await handleOllamaUninitialized();

  try {
    // currentCallback = streamingFunction;

    const chain = await generateChainFromContext(
      contextId,
      userId,
      undefined,
      systemPrompt
    );

    class CustomHandler extends BaseCallbackHandler {
      name = "custom_handler";

      handleLLMNewToken(token) {
        // console.log(token);
        if (streamingFunction) {
          streamingFunction(token);
        }
      }

      handleLLMStart(llm, _prompts) {
        console.log("handleLLMStart", { llm });
      }

      handleChainStart(chain) {
        console.log("handleChainStart", { chain });
      }

      handleAgentAction(action) {
        console.log("handleAgentAction", action);
      }

      handleToolStart(tool) {
        console.log("handleToolStart", { tool });
      }
    }

    const handler = new CustomHandler();

    const fullResponse = await chain.call(
      { input: prompt },
      { callbacks: [handler] }
    );

    console.log("done");
    console.log(fullResponse);

    return fullResponse;
  } catch (err) {
    console.error("[ollama.service][generate]", err.message);
    throw err;
  }
};

export const analyzeURL = async (prompt, url, streamFunction) => {
  try {
    await handleOllamaUninitialized();
    return await documentService.analyzeURL(
      prompt,
      url,
      ollama,
      streamFunction
    );
  } catch (err) {
    console.error("[ollama.service][analyzeURL]", err.message);
    throw err;
  }
};

export const analyzeFile = async (prompt, filePaths, streamFunction) => {
  try {
    await handleOllamaUninitialized();
    return await documentService.analyzeFile(
      prompt,
      filePaths,
      ollama,
      streamFunction
    );
  } catch (err) {
    console.error("[ollama.service][analyzeURL]", err.message);
    throw err;
  }
};

export const shortcutGenerate = async (prompt, imageText) => {
  try {
    await handleOllamaUninitialized();

    const messages = [
      new SystemMessage(`You are a helpful AI assistant. A user has taken an image and extracted all visible text.
      They are going to send the text to you and ask for a summary of the text. You should respond with a summary of the text.
      You should also try to include what you think the image is of if possible.`),
      new SystemMessage(`Here is the text from the image: ${imageText}`),
    ];

    const memory = new BufferMemory({
      // @ts-ignore
      chatHistory: new ChatMessageHistory(messages),
    });

    const chain = new ConversationChain({
      llm: ollama,
      memory: memory,
    });

    const fullResponse = await chain.call({ input: prompt });

    return fullResponse;
  } catch (err) {
    console.error("[ollama.service][shortcutGenerate]", err.message);
    throw err;
  }
};
