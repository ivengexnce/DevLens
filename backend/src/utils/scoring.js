// Pure scoring engine — no side effects

const calcScore = (profile, repos) => {
  if (!repos || repos.length === 0) return { total: 0, breakdown: {} };

  const totalStars = repos.reduce((s, r) => s + r.stargazers_count, 0);
  const avgStars = totalStars / repos.length;
  const totalForks = repos.reduce((s, r) => s + r.forks_count, 0);

  // Language diversity
  const langs = [...new Set(repos.map(r => r.language).filter(Boolean))];
  const langDiversity = Math.min(langs.length / 10, 1);

  // Repo count score (log scale)
  const repoScore = Math.min(Math.log10(repos.length + 1) / Math.log10(200), 1);

  // Star velocity
  const starScore = Math.min(Math.log10(avgStars + 1) / Math.log10(500), 1);

  // Follower reach
  const followerScore = Math.min(Math.log10((profile.followers || 0) + 1) / Math.log10(10000), 1);

  // Fork adoption
  const forkScore = Math.min(Math.log10(totalForks + 1) / Math.log10(1000), 1);

  const weights = {
    repos: 0.20,
    stars: 0.30,
    languages: 0.20,
    followers: 0.15,
    forks: 0.15
  };

  const total = Math.round(
    repoScore * weights.repos * 100 +
    starScore * weights.stars * 100 +
    langDiversity * weights.languages * 100 +
    followerScore * weights.followers * 100 +
    forkScore * weights.forks * 100
  );

  return {
    total: Math.min(total, 100),
    breakdown: {
      repos: Math.round(repoScore * 100),
      stars: Math.round(starScore * 100),
      languages: Math.round(langDiversity * 100),
      followers: Math.round(followerScore * 100),
      forks: Math.round(forkScore * 100)
    }
  };
};

const calcAnalytics = (repos) => {
  const totalStars = repos.reduce((s, r) => s + r.stargazers_count, 0);
  const totalForks = repos.reduce((s, r) => s + r.forks_count, 0);

  const langMap = {};
  repos.forEach(r => {
    if (r.language) langMap[r.language] = (langMap[r.language] || 0) + 1;
  });

  const sortedLangs = Object.entries(langMap)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 8)
    .map(([name, count]) => ({ name, count, pct: Math.round((count / repos.length) * 100) }));

  const topRepos = [...repos]
    .sort((a, b) => b.stargazers_count - a.stargazers_count)
    .slice(0, 6)
    .map(r => ({
      name: r.name,
      description: r.description,
      stars: r.stargazers_count,
      forks: r.forks_count,
      language: r.language,
      url: r.html_url,
      updatedAt: r.updated_at
    }));

  return {
    totalRepos: repos.length,
    totalStars,
    totalForks,
    avgStars: Math.round(totalStars / repos.length),
    languages: sortedLangs,
    primaryLanguage: sortedLangs[0]?.name || 'N/A',
    topRepos
  };
};

const buildHeatmap = (events) => {
  const map = {};
  events.forEach(e => {
    const date = e.created_at?.split('T')[0];
    if (date) map[date] = (map[date] || 0) + 1;
  });
  return map;
};

const scoreLabel = (score) => {
  if (score >= 85) return 'Elite';
  if (score >= 70) return 'Expert';
  if (score >= 55) return 'Advanced';
  if (score >= 40) return 'Intermediate';
  if (score >= 25) return 'Developing';
  return 'Beginner';
};

module.exports = { calcScore, calcAnalytics, buildHeatmap, scoreLabel };
