const mongoose = require("mongoose");

const ToolRequest = mongoose.model(
  "ToolRequest",
  new mongoose.Schema({
    status: {type: String, default: "pending"},  // approved, rejected, pending, closed
    borrow_duration: {type: String, required: true},
    expiration_date: {type: Date, required: true},
    start_date: {type: Date, required: true},
    tool:
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Tool"
      },
    requestor:
    {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }
  })
);

module.exports = ToolRequest;