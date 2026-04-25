const { Octokit } = require('@octokit/rest');
const Analytics = require('../models/Analytics');

const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

/* ═══════════════════════════════════════════
   SCORING — all parameters, max 100
   ═══════════════════════════════════════════
   repos:       max 20  (original repos)
   stars:       max 25  (total stars across repos)
   forks:       max 10  (total forks)
   followers:   max 15  (social reach)
   languages:   max 10  (tech diversity)
   account_age: max 10  (seniority)
   activity:    max 10  (recent pushes)
   ─────────────────────────────────────────── */
function computeScore(user, repos) {
    var now = Date.now();
    var origRepos = repos.filter(function(r) { return !r.fork; });
    var totalStars = origRepos.reduce(function(s, r) { return s + (r.stargazers_count || 0); }, 0);
    var totalForks = origRepos.reduce(function(s, r) { return s + (r.forks_count || 0); }, 0);
    var langSet = new Set(origRepos.map(function(r) { return r.language; }).filter(Boolean));

    // account age in years
    var createdYear = user.created_at ? new Date(user.created_at) : new Date();
    var ageYears = (now - createdYear.getTime()) / (1000 * 60 * 60 * 24 * 365);

    // recent activity — repos pushed in last 90 days
    var cutoff = now - 90 * 24 * 60 * 60 * 1000;
    var recentPushes = origRepos.filter(function(r) {
        return r.pushed_at && new Date(r.pushed_at).getTime() > cutoff;
    }).length;

    var repoScore = Math.min(origRepos.length * 1.0, 20);
    var starScore = Math.min(Math.log10(totalStars + 1) * 7, 25);
    var forkScore = Math.min(Math.log10(totalForks + 1) * 3, 10);
    var follScore = Math.min(Math.log10((user.followers || 0) + 1) * 5, 15);
    var langScore = Math.min(langSet.size * 1.25, 10);
    var ageScore = Math.min(ageYears * 1.5, 10);
    var actScore = Math.min(recentPushes * 1.0, 10);

    var total = repoScore + starScore + forkScore + follScore + langScore + ageScore + actScore;

    return {
        score: Math.min(Math.round(total), 100),
        breakdown: {
            repos: Math.round(repoScore),
            stars: Math.round(starScore),
            forks: Math.round(forkScore),
            followers: Math.round(follScore),
            languages: Math.round(langScore),
            account_age: Math.round(ageScore),
            activity: Math.round(actScore),
        },
        meta: {
            totalStars,
            totalForks,
            languages: Array.from(langSet),
            originalRepos: origRepos.length,
            recentPushes,
            accountAge: Math.round(ageYears * 10) / 10,
        }
    };
}

/* ── upsert one user into Analytics ── */
async function upsertUser(username) {
    try {
        var [userRes, reposRes] = await Promise.all([
            octokit.users.getByUsername({ username }),
            octokit.repos.listForUser({ username, per_page: 100, sort: 'pushed' }),
        ]);
        var u = userRes.data;
        var rs = reposRes.data;
        var result = computeScore(u, rs);

        var langMap = {};
        rs.forEach(function(r) { if (r.language) langMap[r.language] = (langMap[r.language] || 0) + 1; });
        var topLangs = Object.entries(langMap).sort(function(a, b) { return b[1] - a[1]; }).slice(0, 5).map(function(x) { return x[0]; });

        var doc = await Analytics.findOneAndUpdate({ username }, {
            username,
            score: result.score,
            breakdown: result.breakdown,
            meta: result.meta,
            avatarUrl: u.avatar_url,
            name: u.name || username,
            bio: u.bio,
            location: u.location,
            publicRepos: u.public_repos,
            followers: u.followers,
            following: u.following,
            topLanguages: topLangs,
            githubUrl: u.html_url,
            createdAt: u.created_at,
            updatedAt: new Date(),
            views: 1,
        }, { upsert: true, new: true });
        return doc;
    } catch (e) {
        console.warn('[upsertUser] failed for', username, e.message);
        return null;
    }
}

/* ── Seed leaderboard with top GitHub devs ── */
var SEED_QUERIES = [
    'followers:>50000',
    'followers:>20000 language:JavaScript',
    'followers:>20000 language:Python',
    'followers:>20000 language:TypeScript',
    'followers:>10000 language:Go',
    'followers:>10000 language:Rust',
    'followers:>10000 language:Java',
    'followers:>5000  language:C++',
];

var seedRunning = false;

async function seedTopDevs() {
    if (seedRunning) return;
    seedRunning = true;
    console.log('[Leaderboard] Seeding top GitHub developers…');
    var seen = new Set();

    for (var i = 0; i < SEED_QUERIES.length; i++) {
        try {
            var q = SEED_QUERIES[i] + ' type:user';
            var { data } = await octokit.search.users({ q, sort: 'followers', order: 'desc', per_page: 10, page: 1 });
            for (var j = 0; j < data.items.length; j++) {
                var login = data.items[j].login;
                if (!seen.has(login)) {
                    seen.add(login);
                    await upsertUser(login);
                    // small delay to avoid rate limiting
                    await new Promise(function(r) { setTimeout(r, 250); });
                }
            }
        } catch (e) {
            console.warn('[seed] query failed:', SEED_QUERIES[i], e.message);
        }
    }
    seedRunning = false;
    console.log('[Leaderboard] Seed complete. Indexed', seen.size, 'developers.');
}

/* ══════════════════════════════════
   ROUTE HANDLERS
   ══════════════════════════════════ */

/* GET /api/analytics/leaderboard?language=&limit= */
async function getLeaderboard(req, res, next) {
    try {
        var lang = req.query.language || '';
        var limit = Math.min(parseInt(req.query.limit) || 50, 100);

        var filter = {};
        if (lang) filter.topLanguages = lang;

        var leaders = await Analytics
            .find(filter)
            .sort({ score: -1 })
            .limit(limit)
            .lean();

        // If fewer than 10 results, trigger background seed
        if (leaders.length < 10 && !seedRunning) {
            seedTopDevs().catch(console.error);
        }

        res.json(leaders);
    } catch (err) { next(err); }
}

/* GET /api/analytics/stats/global */
async function getGlobalStats(req, res, next) {
    try {
        var total = await Analytics.countDocuments();
        var agg = await Analytics.aggregate([
            { $group: { _id: null, avgScore: { $avg: '$score' }, totalViews: { $sum: '$views' } } }
        ]);
        var stats = agg[0] || {};
        res.json({
            totalProfiles: total,
            avgScore: stats.avgScore ? Math.round(stats.avgScore * 10) / 10 : 0,
            totalViews: stats.totalViews || 0,
        });
    } catch (err) { next(err); }
}

/* GET /api/analytics/rank/:username */
async function getRank(req, res, next) {
    try {
        var username = req.params.username;

        // Upsert fresh data
        var doc = await upsertUser(username);
        if (!doc) return res.status(404).json({ error: 'Could not fetch user from GitHub.' });

        var total = await Analytics.countDocuments();
        var above = await Analytics.countDocuments({ score: { $gt: doc.score } });
        var rank = above + 1;

        // percentile = % of users you're better than
        var below = total - rank;
        var percentile = total > 1 ? Math.round((below / (total - 1)) * 1000) / 10 : 100;

        res.json({
            username: doc.username,
            score: doc.score,
            rank,
            total,
            percentile: percentile.toFixed(1),
            record: {
                avatarUrl: doc.avatarUrl,
                name: doc.name,
                bio: doc.bio,
                topLanguages: doc.topLanguages,
                breakdown: doc.breakdown,
                meta: doc.meta,
            },
        });
    } catch (err) { next(err); }
}

/* GET /api/analytics/:username */
async function getAnalytics(req, res, next) {
    try {
        var doc = await Analytics.findOneAndUpdate({ username: req.params.username }, { $inc: { views: 1 } }, { new: true }).lean();
        if (!doc) return res.status(404).json({ error: 'Not found — analyze this user first.' });
        res.json(doc);
    } catch (err) { next(err); }
}

/* POST /api/analytics/seed  — manual trigger */
async function triggerSeed(req, res, next) {
    try {
        if (seedRunning) return res.json({ message: 'Seed already running.' });
        seedTopDevs().catch(console.error);
        res.json({ message: 'Seed started in background.' });
    } catch (err) { next(err); }
}

module.exports = { getLeaderboard, getGlobalStats, getRank, getAnalytics, triggerSeed };