const mongoose = require("mongoose");


const SessionSchema = new mongoose.Schema({
  name: { type: String, required: true },
  subject: { type: String, required: false },
  schoolId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "School",
    required: true,
  },
  volunteerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Volunteer",
    required: true,
  },
  subject: { type: String, required: false },
  date: { type: Date, required: false },
  startTime: { type: String, required: false }, // Could be Date or ISO string if full datetime needed
  duration: { type: Number, required: false }, // In minutes
  maxStudents: { type: Number, required: false },
  description: { type: String },
  grade: { type: String, required: false },
  topics: [{ type: String }], // Nested structure with "value"
  createdAt: { type: Date, default: Date.now },
});

const Session = mongoose.model("Session", SessionSchema);
module.exports = Session;
