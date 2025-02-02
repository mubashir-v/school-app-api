const mongoose = require("mongoose");

const StudentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  grade: { type: String, required: true },
  schoolId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "School",
    required: true,
  }, // Foreign Key to School
  parentContact: { type: String },
  login: { type: mongoose.Schema.Types.ObjectId, ref: "Login", required: true }, // Foreign Key to Login
  defaultPassword: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const Student = mongoose.model("Student", StudentSchema);
module.exports = Student;
