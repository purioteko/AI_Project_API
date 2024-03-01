import mongoose from "mongoose";

const { Schema } = mongoose;

const SystemPromptSchema = new Schema({
  description: {
    type: String,
    required: true,
  },
  text: {
    type: String,
    required: true,
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

const SystemPrompt = mongoose.model("systemPrompt", SystemPromptSchema);
export default SystemPrompt;
