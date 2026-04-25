const axios = require('axios');

const githubAxios = axios.create({
    baseURL: 'https://api.github.com',
    headers: {
        Accept: 'application/vnd.github.v3+json',
        ...(process.env.GITHUB_TOKEN && {
            Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
        }),
    },
    timeout: 10000,
});

githubAxios.interceptors.response.use(
    (res) => res,
    (err) => {
        if (err.response && err.response.status === 403) {
            throw new Error('GitHub API rate limit exceeded.');
        }
        if (err.response && err.response.status === 404) {
            throw new Error('GitHub user not found.');
        }
        throw err;
    }
);

const fetchUser = async(username) => {
    const { data } = await githubAxios.get(`/users/${username}`);
    return data;
};

const fetchRepos = async(username) => {
    const { data } = await githubAxios.get(`/users/${username}/repos`, {
        params: { per_page: 100, sort: 'updated' },
    });
    return data;
};

const fetchOrgs = async(username) => {
    const { data } = await githubAxios.get(`/users/${username}/orgs`);
    return data;
};

const searchTopRepos = async(language) => {
    const { data } = await githubAxios.get('/search/repositories', {
        params: { q: `language:${language}`, sort: 'stars' },
    });
    return data.items;
};

const getRateLimit = async() => {
    const { data } = await githubAxios.get('/rate_limit');
    return data;
};

module.exports = {
    fetchUser,
    fetchRepos,
    fetchOrgs,
    searchTopRepos,
    getRateLimit,
};