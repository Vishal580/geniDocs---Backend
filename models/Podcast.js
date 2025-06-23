const mongoose = require('mongoose');

const PodcastSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: String,
  audioUrl: {
    type: String,
    required: true
  },
  duration: Number,
  sourceDocument: String, // Base64 encoded document
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Podcast', PodcastSchema);