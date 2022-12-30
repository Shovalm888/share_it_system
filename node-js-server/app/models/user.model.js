const mongoose = require("mongoose");

const User = mongoose.model(
  "User",
  new mongoose.Schema({
    username: {type: String, required: true, unique: true},
    email: {type: String, required: true},
    password: {type: String, required: true},
    fname: {type: String, required: true},
    lname: {type: String, required: true},
    phone: {type: String, required: true},
    job: {type: String, required: false},
    description: {type: String, required: false},
    active: {type: Boolean, default: true},
    rank: {type: String, default: 1},
    roles: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Role"
      }
    ]
  })
);

module.exports = User;
