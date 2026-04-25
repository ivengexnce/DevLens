const { Octokit } = require('@octokit/rest');
const Analytics = require('../models/Analytics');

const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

/* ─── scoring ─── */
function calcScore(user, repos) {
    var totalStars = repos.reduce(function(s, r) { return s + (r.stargazers_count || 0); }, 0);
    var totalForks = repos.reduce(function(s, r) { return s + (r.forks_count || 0); }, 0);
    var origRepos = repos.filter(function(r) { return !r.fork; }).length;
    var langSet = new Set(repos.map(function(r) { return r.language; }).filter(Boolean));

    var repoScore = Math.min(origRepos * 1.5, 30);
    var starScore = Math.min(totalStars * 0.04, 30);
    var langScore = Math.min(langSet.size * 2, 20);
    var follScore = Math.min((user.followers || 0) * 0.1, 10);
    var forkScore = Math.min(totalForks * 0.05, 10);
    var total = Math.round(repoScore + starScore + langScore + follScore + forkScore);

    return {
        score: Math.min(total, 100),
        breakdown: {
            repos: Math.round(repoScore),
            stars: Math.round(starScore),
            languages: Math.round(langScore),
            followers: Math.round(follScore),
            forks: Math.round(forkScore),
        }
    };
}

async function getProfile(req, res, next) {
    try {
        var { data } = await octokit.users.getByUsername({ username: req.params.username });
        res.json(data);
    } catch (err) {
        if (err.status === 404) return res.status(404).json({ error: 'User not found' });
        next(err);
    }
}

async function getRepos(req, res, next) {
    try {
        var { data } = await octokit.repos.listForUser({
            username: req.params.username,
            per_page: 100,
            sort: 'updated'
        });
        res.json(data);
    } catch (err) { next(err); }
}

async function getScore(req, res, next) {
    try {
        var username = req.params.username;
        var [userRes, reposRes] = await Promise.all([
            octokit.users.getByUsername({ username }),
            octokit.repos.listForUser({ username, per_page: 100 }),
        ]);
        var result = calcScore(userRes.data, reposRes.data);

        // Upsert analytics
        try {
            var langMap = {};
            reposRes.data.forEach(function(r) { if (r.language) langMap[r.language] = (langMap[r.language] || 0) + 1; });
            var topLangs = Object.entries(langMap).sort(function(a, b) { return b[1] - a[1]; }).slice(0, 5).map(function(x) { return x[0]; });
            await Analytics.findOneAndUpdate({ username }, {
                username,
                score: result.score,
                avatarUrl: userRes.data.avatar_url,
                name: userRes.data.name,
                publicRepos: userRes.data.public_repos,
                followers: userRes.data.followers,
                topLanguages: topLangs,
                breakdown: result.breakdown,
                updatedAt: new Date()
            }, { upsert: true, new: true });
        } catch (e) { console.warn('Analytics save failed:', e.message); }

        res.json(result);
    } catch (err) { next(err); }
}

async function compareUsers(req, res, next) {
    try {
        var u1 = req.params.user1,
            u2 = req.params.user2;
        var [p1, p2, r1, r2] = await Promise.all([
            octokit.users.getByUsername({ username: u1 }),
            octokit.users.getByUsername({ username: u2 }),
            octokit.repos.listForUser({ username: u1, per_page: 100 }),
            octokit.repos.listForUser({ username: u2, per_page: 100 }),
        ]);
        var s1 = calcScore(p1.data, r1.data);
        var s2 = calcScore(p2.data, r2.data);
        res.json({
            user1: { user: p1.data, score: s1.score, breakdown: s1.breakdown },
            user2: { user: p2.data, score: s2.score, breakdown: s2.breakdown },
        });
    } catch (err) { next(err); }
}

async function searchRepos(req, res, next) {
    try {
        var lang = req.query.language || 'JavaScript';
        var keyword = req.query.q || '';
        var sort = req.query.sort || 'stars';
        var page = parseInt(req.query.page) || 1;

        var q = keyword ?
            keyword + ' language:' + lang :
            'language:' + lang + ' stars:>100';

        var sortParam = sort === 'updated' ? 'updated' : sort === 'forks' ? 'forks' : 'stars';
        var orderParam = 'desc';

        var { data } = await octokit.search.repos({
            q,
            sort: sortParam,
            order: orderParam,
            per_page: 9,
            page
        });

        var results = data.items.map(function(r) {
            return {
                id: r.id,
                fullName: r.full_name,
                full_name: r.full_name,
                description: r.description,
                url: r.html_url,
                html_url: r.html_url,
                stars: r.stargazers_count,
                stargazers_count: r.stargazers_count,
                forks: r.forks_count,
                forks_count: r.forks_count,
                language: r.language,
                updated_at: r.updated_at,
                owner: {
                    login: r.owner.login,
                    avatarUrl: r.owner.avatar_url,
                    avatar_url: r.owner.avatar_url,
                }
            };
        });
        res.json({ results, total: data.total_count });
    } catch (err) { next(err); }
}

async function searchUsers(req, res, next) {
    try {
        var lang = req.query.language || '';
        var keyword = req.query.q || '';
        var page = parseInt(req.query.page) || 1;

        var q = '';
        if (keyword) q += keyword + ' ';
        if (lang) q += 'language:' + lang + ' ';
        if (!q.trim()) q = 'followers:>100';
        q = q.trim() + ' type:user';

        var { data } = await octokit.search.users({
            q,
            sort: 'followers',
            order: 'desc',
            per_page: 9,
            page
        });

        // Fetch full profile for each (limited for rate limit reasons)
        var users = await Promise.all(
            data.items.slice(0, 9).map(async function(u) {
                try {
                    var { data: full } = await octokit.users.getByUsername({ username: u.login });
                    return full;
                } catch { return u; }
            })
        );

        res.json({ results: users, total: data.total_count });
    } catch (err) { next(err); }
}

async function getRateLimit(req, res, next) {
    try {
        var { data } = await octokit.rateLimit.get();
        res.json(data);
    } catch (err) { next(err); }
}

module.exports = { getProfile, getRepos, getScore, compareUsers, searchRepos, searchUsers, getRateLimit };