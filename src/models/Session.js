const mongoose = require("mongoose");

const SessionSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  schoolId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "School",
    required: true,
  }, // Foreign Key to School

  topicId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Topic",
    required: true,
  }, // Foreign Key to topic

  volunteerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Volunteer",
    required: true,
  }, // Foreign Key to topic

  studentIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "Student" }], // Array of references to multiple schools
  createdAt: { type: Date, default: Date.now },
});

const Session = mongoose.model("Session", SessionSchema);
module.exports = Session;
