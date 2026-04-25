const Anthropic = require('@anthropic-ai/sdk');
const Analytics = require('../models/Analytics');

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// GET /api/ai/insights/:username
async function getInsights(req, res, next) {
    try {
        const { username } = req.params;

        // Pull saved analytics for context
        const analytics = await Analytics.findOne({ username }).lean();

        const prompt = `You are a senior engineering manager reviewing a GitHub developer profile.
Username: ${username}
${analytics ? `Score: ${analytics.score}/100
Top languages: ${(analytics.topLanguages || []).join(', ')}
Public repos: ${analytics.publicRepos}
Followers: ${analytics.followers}` : 'No analytics data available yet.'}

Give a concise professional assessment in 3 short paragraphs:
1. Strengths based on their activity
2. Areas to improve
3. Career recommendations

Keep it under 150 words total. Be specific and constructive.`;

        const message = await client.messages.create({
            model: 'claude-opus-4-5',
            max_tokens: 300,
            messages: [{ role: 'user', content: prompt }],
        });

        const text = (message.content[0] && message.content[0].text) || '';
        res.json({ username, insights: text });
    } catch (err) {
        next(err);
    }
}

// POST /api/ai/compare  body: { user1, user2 }
async function compareUsers(req, res, next) {
    try {
        const { user1, user2 } = req.body;
        if (!user1 || !user2) {
            return res.status(400).json({ error: 'user1 and user2 are required' });
        }

        const [a1, a2] = await Promise.all([
            Analytics.findOne({ username: user1 }).lean(),
            Analytics.findOne({ username: user2 }).lean(),
        ]);

        const fmt = (u, a) => a
            ? `${u}: score=${a.score}, repos=${a.publicRepos}, followers=${a.followers}, languages=${(a.topLanguages || []).join(', ')}`
            : `${u}: no data saved yet`;

        const prompt = `Compare these two GitHub developers objectively:
${fmt(user1, a1)}
${fmt(user2, a2)}

Provide:
1. Who is stronger overall and why (2 sentences)
2. What each excels at (1 sentence each)
3. A verdict line: "Winner: @username"

Keep it under 120 words.`;

        const message = await client.messages.create({
            model: 'claude-opus-4-5',
            max_tokens: 250,
            messages: [{ role: 'user', content: prompt }],
        });

        const text = (message.content[0] && message.content[0].text) || '';
        res.json({ user1, user2, comparison: text });
    } catch (err) {
        next(err);
    }
}

module.exports = { getInsights, compareUsers };