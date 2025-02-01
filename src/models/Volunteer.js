const mongoose = require("mongoose");

const VolunteerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone:{ type: String, required: true },
  expertise: { type: String },
  availability: { type: String },
  schoolIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "School" }], // Array of references to multiple schools
  login: { type: mongoose.Schema.Types.ObjectId, ref: "Login", required: true }, // Foreign Key to Login
  createdAt: { type: Date, default: Date.now },
});

const Volunteer = mongoose.model("Volunteer", VolunteerSchema);
module.exports = Volunteer;
