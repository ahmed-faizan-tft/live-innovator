const mongoose = require("mongoose");

const joinSchema = new mongoose.Schema({
  sessionId: { type: String, required: true },
  code: { type: String, required: true },
});

const Join = mongoose.model("Join", joinSchema);
module.exports = Join;
