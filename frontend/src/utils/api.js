const BASE =
    import.meta.env.VITE_API_URL || '/api';

async function request(path, options = {}) {
    const url = `${BASE}${path}`;
    try {
        const res = await fetch(url, {
            headers: { 'Content-Type': 'application/json', ...options.headers },
            ...options,
        });
        if (!res.ok) {
            const err = await res.json().catch(() => ({ error: res.statusText }));
            throw new Error(err.error || `Request failed: ${res.status}`);
        }
        return res.json();
    } catch (e) {
        if (e.message === 'Failed to fetch') {
            throw new Error('Cannot reach the backend. Make sure the server is running on port 5000.');
        }
        throw e;
    }
}

export const api = {
        /* ── GitHub ── */
        getProfile: (username) => request(`/github/profile/${username}`),
        getRepos: (username) => request(`/github/repos/${username}`),
        getScore: (username) => request(`/github/score/${username}`),
        compareUsers: (u1, u2) => request(`/github/compare/${u1}/${u2}`),

        // Discover: repos with keyword, language, sort, page
        searchRepos: (lang, keyword = '', sort = 'stars', page = 1) => {
            const params = new URLSearchParams();
            if (lang) params.set('language', lang);
            if (keyword) params.set('q', keyword);
            if (sort) params.set('sort', sort);
            if (page > 1) params.set('page', page);
            return request(`/github/search?${params.toString()}`);
        },

        // Discover: users with keyword, language, page
        searchUsers: (lang, keyword = '', page = 1) => {
            const params = new URLSearchParams();
            if (lang) params.set('language', lang);
            if (keyword) params.set('q', keyword);
            if (page > 1) params.set('page', page);
            return request(`/github/users?${params.toString()}`);
        },

        getRateLimit: () => request(`/github/rate-limit`),

        /* ── AI ── */
        getInsights: (username, type = 'insight') =>
            request(`/ai/insights/${username}?type=${type}`),
        compare: (u1, u2) =>
            request(`/ai/compare`, { method: 'POST', body: JSON.stringify({ user1: u1, user2: u2 }) }),

        /* ── Analytics ── */
        getAnalytics: (username) => request(`/analytics/${username}`),
        getLeaderboard: (lang) => request(`/analytics/leaderboard${lang ? `?language=${lang}` : ''}`),
  getGlobalStats: ()         => request(`/analytics/stats/global`),
  getRank:        (username) => request(`/analytics/rank/${username}`),

  /* ── Misc ── */
  health: () => request(`/health`),
};