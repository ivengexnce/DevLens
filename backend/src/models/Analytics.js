const mongoose = require('mongoose');

const analyticsSchema = new mongoose.Schema({
  username: { type: String, required: true, lowercase: true, index: true },
  score: Number,
  scoreLabel: String,
  totalRepos: Number,
  totalStars: Number,
  primaryLanguage: String,
  followers: Number,
  avatarUrl: String,
  name: String,
  searchCount: { type: Number, default: 1 },
  lastSearched: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now }
}, { timestamps: false });

analyticsSchema.index({ score: -1 });
analyticsSchema.index({ searchCount: -1 });

module.exports = mongoose.model('Analytics', analyticsSchema);
