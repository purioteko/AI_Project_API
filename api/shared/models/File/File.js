import mongoose from "mongoose";

const { Schema } = mongoose;

const FileSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  path: {
    type: String,
    default: null,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: true,
  },
});

const File = mongoose.model("file", FileSchema);
export default File;
