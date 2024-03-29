const mongoose = require("mongoose");

const ConversationSchema = new mongoose.Schema(
  {
    members: {
      type: Array,
    },
    title: {
        type: String,
        default: "",
        max: 50
    },
    creatorId: {
        type: String
    },
    isGroup: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Conversation", ConversationSchema);