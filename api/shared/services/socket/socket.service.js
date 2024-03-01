import * as ollamaService from "../ollama/ollama.service.js";
import * as tokenService from "../token/token.service.js";
import * as contextService from "../context/context.service.js";
import * as aiService from "../../../secure/ai/ai.service.js";

const checkForURL = (prompt) => {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const url = prompt.match(urlRegex);
  return url;
};

export const onStreamingGenerate = async (socket, payload) => {
  try {
    console.log("onStreamingGenerate", payload);

    const { token, prompt, contextId, systemPromptId } = payload;

    if (!token) {
      socket.emit("error", "No token provided");
      return;
    }

    const messages = [
      {
        text: prompt,
        isUser: true,
      },
    ];

    const decodedToken = tokenService.decodeToken(token);

    // @ts-ignore
    const { id: userId } = decodedToken.user;

    let systemPrompt = null;

    if (systemPromptId) {
      systemPrompt = await aiService.getSystemPrompt(systemPromptId, userId);
    }

    const streamFunction = (chunk) => {
      socket.emit("responseStream", {
        text: chunk,
        isUser: false,
      });
    };

    let responseText = "";

    const urls = checkForURL(prompt);

    if (contextId) {
      const context = await contextService.getContext(contextId, userId);
      if (context && context.files.length) {
        return onStreamFileResponse(socket, context, prompt, token);
      }
    }

    // one thing at a time but you want to bake this into the analyzeURL as well...
    if (urls && urls.length) {
      const fullResponse = await ollamaService.analyzeURL(
        prompt,
        urls,
        streamFunction
      );
      responseText = fullResponse.text;
    } else {
      const fullResponse = await ollamaService.streamingGenerate(
        prompt,
        streamFunction,
        userId,
        contextId,
        systemPrompt
      );
      responseText = fullResponse.response;
    }

    socket.emit("endStream", true);

    messages.push({
      text: responseText,
      isUser: false,
    });

    const descriptionUpdateCallback = (description, contextId) => {
      socket.emit("updateDescription", {
        description,
        _id: contextId,
      });
    };

    const upsertResult = await ollamaService.upsertContext(
      messages,
      userId,
      contextId,
      descriptionUpdateCallback
    );
    if (upsertResult.context) {
      // fetch the whole context
      const context = await contextService.getContext(
        upsertResult.context._id,
        userId
      );
      socket.emit("appendContext", context);
    }
  } catch (err) {
    socket.emit("error", err.message);
  }
};

export const onStreamFileResponse = async (socket, context, prompt, token) => {
  try {
    const messages = [
      {
        text: prompt,
        isUser: true,
      },
    ];

    const decodedToken = tokenService.decodeToken(token);

    // @ts-ignore
    const { id: userId } = decodedToken.user;

    const streamFunction = (chunk) => {
      socket.emit("responseStream", {
        text: chunk,
        isUser: false,
      });
    };

    let responseText = "";

    const fullResponse = await ollamaService.analyzeFile(
      prompt,
      context.files.map((file) => file.path),
      streamFunction
    );
    responseText = fullResponse.text;

    socket.emit("endStream", true);

    messages.push({
      text: responseText,
      isUser: false,
    });

    const descriptionUpdateCallback = (description, contextId) => {
      socket.emit("updateDescription", {
        description,
        _id: contextId,
      });
    };

    const upsertResult = await ollamaService.upsertContext(
      messages,
      userId,
      context._id,
      descriptionUpdateCallback
    );
    if (upsertResult.context) {
      // fetch the whole context
      const context = await contextService.getContext(
        upsertResult.context._id,
        userId
      );
      socket.emit("appendContext", context);
    }
  } catch (err) {
    socket.emit("error", err.message);
    console.error(err.message);
  }
};
