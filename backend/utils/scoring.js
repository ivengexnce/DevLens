/**
 * DevLens Pro — Developer Scoring & Analytics Engine
 * All scoring functions are pure — no side effects.
 */

/**
 * Calculate composite developer score (0–100)
 */
const calculateScore = (user, repos) => {
    const repoScore = Math.min((user.public_repos || 0) * 2, 30);

    const totalStars = repos.reduce((a, r) => a + (r.stargazers_count || 0), 0);
    const starScore = Math.min(Math.log(totalStars + 1) * 6, 30);

    const langs = new Set(repos.map((r) => r.language).filter(Boolean));
    const langScore = Math.min(langs.size * 3, 20);

    const followerScore = Math.min(Math.log((user.followers || 0) + 1) * 2, 10);

    const totalForks = repos.reduce((a, r) => a + (r.forks_count || 0), 0);
    const forkScore = Math.min(totalForks / 10, 10);

    const raw = repoScore + starScore + langScore + followerScore + forkScore;
    return Math.min(Math.round(raw), 100);
};

/**
 * Derive score label + tier
 */
const getScoreLabel = (score) => {
    if (score >= 90) return { label: 'Legend', tier: 5, color: '#ff6b6b' };
    if (score >= 75) return { label: 'Elite', tier: 4, color: '#f5c842' };
    if (score >= 60) return { label: 'Expert', tier: 3, color: '#7c6fff' };
    if (score >= 40) return { label: 'Proficient', tier: 2, color: '#3b9eff' };
    if (score >= 20) return { label: 'Intermediate', tier: 1, color: '#00d9a0' };
    return { label: 'Beginner', tier: 0, color: '#6b7280' };
};

/**
 * Language breakdown sorted by usage weight
 */
const getLanguageBreakdown = (repos) => {
    const counts = {};
    repos.forEach((r) => {
        if (r.language) {
            counts[r.language] = (counts[r.language] || 0) + (r.stargazers_count || 0) + 1;
        }
    });
    const total = Object.values(counts).reduce((a, b) => a + b, 0);
    return Object.entries(counts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([lang, count]) => ({
            language: lang,
            count,
            percentage: Math.round((count / total) * 100),
        }));
};

/**
 * Summary analytics object
 */
const buildAnalytics = (user, repos) => {
    const totalStars = repos.reduce((a, r) => a + (r.stargazers_count || 0), 0);
    const totalForks = repos.reduce((a, r) => a + (r.forks_count || 0), 0);
    const totalWatchers = repos.reduce((a, r) => a + (r.watchers_count || 0), 0);
    const avgStars = repos.length ? Math.round(totalStars / repos.length) : 0;
    const languages = getLanguageBreakdown(repos);
    const primaryLang = (languages[0] && languages[0].language) || 'Unknown';
    const score = calculateScore(user, repos);

    const repoAgeMs = repos
        .map((r) => new Date() - new Date(r.created_at))
        .reduce((a, b) => a + b, 0);
    const avgRepoAgeDays = repos.length ? Math.round(repoAgeMs / repos.length / 86400000) : 0;

    const forkedRepos = repos.filter((r) => r.fork).length;
    const originalRepos = repos.length - forkedRepos;

    const topRepos = [...repos]
        .sort((a, b) => b.stargazers_count - a.stargazers_count)
        .slice(0, 10)
        .map((r) => ({
            name: r.name,
            description: r.description,
            stars: r.stargazers_count,
            forks: r.forks_count,
            language: r.language,
            url: r.html_url,
            homepage: r.homepage,
            topics: r.topics || [],
            updatedAt: r.updated_at,
            isForked: r.fork,
        }));

    return {
        score,
        scoreLabel: getScoreLabel(score),
        totalStars,
        totalForks,
        totalWatchers,
        avgStars,
        primaryLanguage: primaryLang,
        languageCount: languages.length,
        languages,
        originalRepos,
        forkedRepos,
        avgRepoAgeDays,
        topRepos,
        activityLevel: score > 70 ? 'High' : score > 40 ? 'Medium' : 'Low',
        followRatio: user.following ?
            Math.round((user.followers / user.following) * 10) / 10 :
            user.followers,
        breakdownScores: {
            repoScore: Math.min((user.public_repos || 0) * 2, 30),
            starScore: parseFloat(Math.min(Math.log(totalStars + 1) * 6, 30).toFixed(1)),
            langScore: Math.min(languages.length * 3, 20),
            followerScore: parseFloat(
                Math.min(Math.log((user.followers || 0) + 1) * 2, 10).toFixed(1)
            ),
            forkScore: parseFloat(Math.min(totalForks / 10, 10).toFixed(1)),
        },
    };
};

/**
 * Compare two profiles, return winner per metric
 */
const compareProfiles = (user1, repos1, analytics1, user2, repos2, analytics2) => {
    const metrics = [
        { key: 'score', label: 'AI Score', v1: analytics1.score, v2: analytics2.score },
        { key: 'repos', label: 'Public Repos', v1: user1.public_repos, v2: user2.public_repos },
        { key: 'followers', label: 'Followers', v1: user1.followers, v2: user2.followers },
        { key: 'stars', label: 'Total Stars', v1: analytics1.totalStars, v2: analytics2.totalStars },
        { key: 'forks', label: 'Total Forks', v1: analytics1.totalForks, v2: analytics2.totalForks },
        {
            key: 'languages',
            label: 'Languages',
            v1: analytics1.languageCount,
            v2: analytics2.languageCount,
        },
        { key: 'avgStars', label: 'Avg Stars/Repo', v1: analytics1.avgStars, v2: analytics2.avgStars },
    ];

    let wins1 = 0;
    let wins2 = 0;

    const compared = metrics.map((m) => {
        const winner = m.v1 > m.v2 ? 1 : m.v2 > m.v1 ? 2 : 0;
        if (winner === 1) wins1++;
        if (winner === 2) wins2++;
        return {...m, winner };
    });

    return {
        metrics: compared,
        wins1,
        wins2,
        overallWinner: wins1 > wins2 ? 1 : wins2 > wins1 ? 2 : 0,
    };
};

module.exports = { calculateScore, getScoreLabel, getLanguageBreakdown, buildAnalytics, compareProfiles };