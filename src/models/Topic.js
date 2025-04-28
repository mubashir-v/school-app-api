const mongoose = require("mongoose");

const TopicSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true  },
  createdAt: { type: Date, default: Date.now },
});

const Topic = mongoose.model("Topic", TopicSchema);
module.exports = Topic;
