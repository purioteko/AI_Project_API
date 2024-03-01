import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

import File from "../../shared/models/File/File.js";
import Context from "../../shared/models/Context/Context.js";
import * as contextService from "../../shared/services/context/context.service.js";
import * as sharedService from "../../shared/services/shared/shared.service.js";

const uploadsPath = "../../../uploads";

export const createFile = async (file, contextId, userId) => {
  try {
    let context;

    if (contextId) {
      context = await contextService.getContext(contextId, userId);
    } else {
      // create a new context
      context = await contextService.saveContext(
        "TMP_CONTEXT_NAME",
        [],
        userId
      );
    }

    if (!context) {
      throw new Error("Context not found");
    }

    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);

    const absoluteUploadPath = path.resolve(__dirname, uploadsPath);

    // Check if the upload directory exists, if not, create it
    if (!fs.existsSync(absoluteUploadPath)) {
      fs.mkdirSync(absoluteUploadPath, { recursive: true });
    }

    const uniqueFileName = `${Date.now()}-${file.name}`;

    // new to write the file to disc
    const filePath = path.join(absoluteUploadPath, uniqueFileName);
    fs.writeFileSync(filePath, file.data);

    const fileModel = new File();
    fileModel.path = filePath;
    fileModel.name = file.name;
    fileModel.user = userId;

    const newFile = await fileModel.save();

    context.files.push(newFile._id);
    await context.save();

    return {
      file: newFile,
      context,
    };
  } catch (err) {
    throw new Error(err.message);
  }
};

export const deleteFile = async (fileId, userId) => {
  try {
    const file = await File.findOne({
      _id: fileId,
      user: userId,
    });

    if (!file) {
      throw new Error("File not found");
    }

    const context = await Context.findOne({
      files: fileId,
    });

    if (context) {
      context.files = context.files.filter((file) => file._id !== fileId);
      await context.save();
    }

    await File.deleteOne({
      _id: fileId,
      user: userId,
    });

    try {
      sharedService.removeFile(file.path);
    } catch (err) {
      console.error(err);
    }

    return true;
  } catch (err) {
    throw new Error(err.message);
  }
};
