import mongoose from "mongoose";

const { Schema } = mongoose;

const ContextSchema = new Schema({
  description: {
    type: String,
    required: true,
  },
  messages: [{ type: mongoose.Schema.Types.ObjectId, ref: "message" }],
  files: [{ type: mongoose.Schema.Types.ObjectId, ref: "file" }],
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

const Context = mongoose.model("context", ContextSchema);
export default Context;
