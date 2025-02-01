const mongoose = require("mongoose");

const LoginSchema = new mongoose.Schema({
  uid: { type: String, required: true, unique: true }, // Firebase UID
  email: { type: String, required: true, unique: true },
  name: { type: String },
  profilePic: { type: String },
  isAdmin: { type: Boolean, default: false },
  isActive: { type: Boolean, default: false },
  role: {
    type: String,
    enum: ["student", "school", "volunteer"],
    required: true,
  },
  createdAt: { type: Date, default: Date.now },
});

const Login = mongoose.model("Login", LoginSchema);
module.exports = Login;
