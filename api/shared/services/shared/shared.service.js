import fs from "fs";

export const removeFile = (filePath) => {
  if (fs.existsSync(`${filePath}.bin`)) {
    try {
      fs.rmSync(`${filePath}.bin`, { recursive: true, force: true });
    } catch (err) {
      throw new Error(err.message);
    }
  }
  if (fs.existsSync(filePath)) {
    try {
      fs.rmSync(filePath);
    } catch (err) {
      throw new Error(err.message);
    }
  }
};
