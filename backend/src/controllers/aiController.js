const Anthropic = require('@anthropic-ai/sdk');

let client;
if (process.env.ANTHROPIC_API_KEY) {
  client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
}

// POST /api/ai/insight
const insight = async (req, res, next) => {
  try {
    const { profile, scoring, analytics } = req.body;

    if (!client) {
      return res.json({
        insight: generateFallbackInsight(profile, scoring, analytics),
        fallback: true
      });
    }

    const prompt = `You are a senior technical recruiter evaluating a developer's GitHub profile.

Developer: ${profile.name || profile.username} (@${profile.username})
Score: ${scoring.total}/100 (${scoring.label})
Repos: ${analytics.totalRepos} | Stars: ${analytics.totalStars} | Followers: ${profile.followers}
Primary Language: ${analytics.primaryLanguage}
Top Languages: ${analytics.languages?.slice(0, 4).map(l => l.name).join(', ')}
Top Repos: ${analytics.topRepos?.slice(0, 3).map(r => `${r.name} (⭐${r.stars})`).join(', ')}

Write a 3-sentence recruiter-style assessment. Be specific, honest, and professional. Mention standout qualities and potential areas for growth. Do NOT use generic phrases.`;

    const message = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 200,
      messages: [{ role: 'user', content: prompt }]
    });

    res.json({ insight: message.content[0].text });
  } catch (err) {
    // Always return something
    res.json({
      insight: generateFallbackInsight(req.body.profile, req.body.scoring, req.body.analytics),
      fallback: true
    });
  }
};

// POST /api/ai/compare-verdict
const compareVerdict = async (req, res, next) => {
  try {
    const { user1, user2 } = req.body;

    if (!client) {
      return res.json({
        verdict: generateFallbackVerdict(user1, user2),
        fallback: true
      });
    }

    const prompt = `Compare two developers as a senior technical recruiter:

${user1.profile.username}: Score ${user1.scoring.total}/100, ${user1.analytics.totalRepos} repos, ${user1.analytics.totalStars} stars, ${user1.profile.followers} followers, primary: ${user1.analytics.primaryLanguage}

${user2.profile.username}: Score ${user2.scoring.total}/100, ${user2.analytics.totalRepos} repos, ${user2.analytics.totalStars} stars, ${user2.profile.followers} followers, primary: ${user2.analytics.primaryLanguage}

Write 2 sentences: who is stronger overall and why, then one strength each developer has. Be direct and specific.`;

    const message = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 150,
      messages: [{ role: 'user', content: prompt }]
    });

    res.json({ verdict: message.content[0].text });
  } catch (err) {
    res.json({
      verdict: generateFallbackVerdict(req.body.user1, req.body.user2),
      fallback: true
    });
  }
};

function generateFallbackInsight(profile, scoring, analytics) {
  const level = scoring?.label || 'Developer';
  const lang = analytics?.primaryLanguage || 'multiple languages';
  const stars = analytics?.totalStars || 0;
  return `${profile?.name || profile?.username} is a ${level}-level developer with a strong foundation in ${lang}, accumulating ${stars} total stars across their repositories. Their GitHub activity demonstrates consistent engagement with open-source work and a diverse technical background. This profile shows solid potential for roles requiring ${lang} expertise.`;
}

function generateFallbackVerdict(u1, u2) {
  const winner = u1?.scoring?.total >= u2?.scoring?.total ? u1 : u2;
  const loser = winner === u1 ? u2 : u1;
  return `${winner.profile.username} edges out ${loser.profile.username} with a higher overall score driven by stronger community metrics and repository quality. Both developers show genuine commitment to their craft with distinct technical strengths worth exploring further.`;
}

module.exports = { insight, compareVerdict };
