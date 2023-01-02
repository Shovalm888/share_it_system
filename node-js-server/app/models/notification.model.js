const mongoose = require("mongoose");

const Notification = mongoose.model(
  "Notification",
  new mongoose.Schema({
    watched: {type: Boolean, default: false},
    content: {type: String, required: true},
    date: {type: Date, required: true},
    sender :
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
      },
    recipient :
    {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: false  // Notification without recipient is visible for everyone
    },
    // tool_request :
    // {
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: "ToolRequest",
    //     required: false  // Notification can be bined with tool request to be approve or not
    // }
  })
);

module.exports = Notification;