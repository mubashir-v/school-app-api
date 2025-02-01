const mongoose = require("mongoose");

const SchoolSchema = new mongoose.Schema({
  name: { type: String, required: true },
  address: { type: String },
  phone:{ type: String, required: true },
  login: { type: mongoose.Schema.Types.ObjectId, ref: "Login", required: true }, // Foreign Key to Login
  createdAt: { type: Date, default: Date.now },
});

const School = mongoose.model("School", SchoolSchema);
module.exports = School;
