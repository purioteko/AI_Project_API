import Context from "../../models/Context/Context.js";
import Message from "../../models/Message/Message.js";
import File from "../../models/File/File.js";

import * as sharedService from "../shared/shared.service.js";

// return the context descriptions for all contexts
export const getContextList = async (userId) => {
  return await Context.find({ user: userId }, "description date messages")
    .sort({
      date: -1,
    })
    .populate([
      {
        path: "messages",
        model: "message",
      },
      {
        path: "files",
        model: "file",
      },
    ]);
};

// return the context data for the given context id
export const getContext = async (contextId, userId) => {
  const context = await Context.findOne({
    _id: contextId,
    user: userId,
  }).populate([
    {
      path: "messages",
      model: "message",
    },
    {
      path: "files",
      model: "file",
    },
  ]);

  return context;
};

// save context data
export const saveContext = async (description, messages, userId) => {
  const context = new Context();
  context.description = description;
  context.user = userId;
  context.files = [];

  // need to save messages independently
  for (let i = 0; i < messages.length; i++) {
    const message = messages[i];
    if (!message._id) {
      const messageModel = new Message();
      messageModel.text = message.text;
      messageModel.isUser = message.isUser;
      const messageId = (await messageModel.save()).id;
      context.messages.push(messageId);
    }
  }

  return await context.save();
};

export const setContextDescription = async (contextId, description, userId) => {
  const context = await getContext(contextId, userId);
  if (!context) {
    return;
  }

  context.description = description;
  return await context.save();
};

// update context data
export const updateContext = async (contextId, messages, userId) => {
  const context = await getContext(contextId, userId);
  if (!context) {
    return;
  }

  for (let i = 0; i < messages.length; i++) {
    const message = messages[i];
    if (!message._id) {
      const messageModel = new Message();
      messageModel.text = message.text;
      messageModel.isUser = message.isUser;
      const messageId = (await messageModel.save()).id;
      context.messages.push(messageId);
    }
  }
  context.date = new Date();

  return await context.save();
};

export const clearContexts = async (userId) => {
  const contexts = await Context.find({ user: userId }).populate([
    {
      path: "messages",
      model: "message",
    },
    {
      path: "files",
      model: "file",
    },
  ]);

  for (let i = 0; i < contexts.length; i++) {
    const context = contexts[i];
    await Message.deleteMany({
      _id: { $in: context.messages.map((message) => message._id) },
    });

    context.files.forEach((file) => {
      sharedService.removeFile(file.path);
    });

    await File.deleteMany({
      _id: { $in: context.files.map((file) => file._id) },
    });
  }

  return await Context.deleteMany({ user: userId });
};

export const deleteContext = async (userId, contextId) => {
  const context = await Context.findOne({
    _id: contextId,
    user: userId,
  }).populate([
    {
      path: "messages",
      model: "message",
    },
    {
      path: "files",
      model: "file",
    },
  ]);

  if (!context) {
    return;
  }

  await Message.deleteMany({
    _id: { $in: context.messages.map((message) => message._id) },
  });

  try {
    context.files.forEach((file) => {
      sharedService.removeFile(file.path);
    });
  } catch (err) {
    console.error(err);
  }

  await File.deleteMany({
    _id: { $in: context.files.map((file) => file._id) },
  });

  return await Context.deleteOne({ _id: contextId });
};
