import * as service from "./file.service.js";

export const createFile = async (req, res) => {
  try {
    const { id: userId } = req.user;
    const { contextId } = req.body;
    const { file } = req.files;

    const result = await service.createFile(file, contextId, userId);
    res.send(result);
  } catch (err) {
    res.status(500).send(err.message);
  }
};

export const deleteFile = async (req, res) => {
  try {
    const { id: userId } = req.user;
    const { id } = req.params;

    const result = await service.deleteFile(id, userId);
    res.send(result);
  } catch (err) {
    res.status(500).send(err.message);
  }
};
