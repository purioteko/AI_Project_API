import mongoose from "mongoose";

const { Schema } = mongoose;

const MessageSchema = new Schema({
  isUser: {
    type: Boolean,
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
});

const Message = mongoose.model("message", MessageSchema);
export default Message;
