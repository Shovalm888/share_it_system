const mongoose = require("mongoose");

const Tool = mongoose.model(
  "Tool",
  new mongoose.Schema({
    name: {type: String, required: true, unique: true},
    manufacturing_date: {type: String, required: true},
    status: {type: String, required: true},
    max_time_borrow: {type: String, required: true},
    categories: {type: String, required: true},
    producer: {type: String, required: true},
    description: {type: String, required: false},
    owner:
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      }
  })
);

module.exports = Tool;