const mongoose = require('mongoose');

const sectionSchema = new mongoose.Schema({
  id: String,
  title: String,
  color: String,
  x: Number,
  y: Number
}, { _id: false });

const templateSchema = new mongoose.Schema({
  sessionName: {
    type: String,
    required: true
  },
  sections: {
    type: [sectionSchema],
    required: true
  }
});

module.exports = mongoose.model('Template', templateSchema);
