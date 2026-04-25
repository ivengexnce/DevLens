const mongoose = require('mongoose');

const analyticsSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true, lowercase: true, index: true },
    githubId: { type: Number },
    name: { type: String },
    avatarUrl: { type: String },
    bio: { type: String },
    location: { type: String },
    company: { type: String },
    blog: { type: String },
    twitterUsername: { type: String },
    publicRepos: { type: Number, default: 0 },
    followers: { type: Number, default: 0 },
    following: { type: Number, default: 0 },

    // Scoring
    score: { type: Number, default: 0, index: true },
    scoreLabel: { type: String, default: 'Beginner' },

    // Analytics
    totalStars: { type: Number, default: 0 },
    totalForks: { type: Number, default: 0 },
    totalWatchers: { type: Number, default: 0 },
    avgStars: { type: Number, default: 0 },
    primaryLanguage: { type: String, default: 'Unknown', index: true },
    languageCount: { type: Number, default: 0 },
    languages: { type: Array, default: [] },
    originalRepos: { type: Number, default: 0 },
    forkedRepos: { type: Number, default: 0 },
    avgRepoAgeDays: { type: Number, default: 0 },
    topRepos: { type: Array, default: [] },
    activityLevel: { type: String, default: 'Low' },
    followRatio: { type: Number, default: 0 },
    breakdownScores: { type: Object, default: {} },

    // Meta
    viewCount: { type: Number, default: 0 },
    fetchedAt: { type: Date, default: Date.now },
}, { timestamps: true });

analyticsSchema.methods.incrementView = async function() {
    this.viewCount += 1;
    return this.save();
};

const Analytics = mongoose.model('Analytics', analyticsSchema);

module.exports = Analytics;