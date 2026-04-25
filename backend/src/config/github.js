const axios = require('axios');

const githubAPI = axios.create({
  baseURL: 'https://api.github.com',
  headers: {
    Accept: 'application/vnd.github.v3+json',
    ...(process.env.GITHUB_TOKEN && {
      Authorization: `Bearer ${process.env.GITHUB_TOKEN}`
    })
  },
  timeout: 10000
});

const getProfile = async (username) => {
  const { data } = await githubAPI.get(`/users/${username}`);
  return data;
};

const getRepos = async (username) => {
  const { data } = await githubAPI.get(`/users/${username}/repos`, {
    params: { per_page: 100, sort: 'updated' }
  });
  return data;
};

const getEvents = async (username) => {
  try {
    const { data } = await githubAPI.get(`/users/${username}/events/public`, {
      params: { per_page: 100 }
    });
    return data;
  } catch {
    return [];
  }
};

const searchUsers = async (query, language, sort = 'followers') => {
  const q = language ? `${query} language:${language}` : query;
  const { data } = await githubAPI.get('/search/users', {
    params: { q, sort, order: 'desc', per_page: 12 }
  });
  return data.items;
};

const getRateLimit = async () => {
  const { data } = await githubAPI.get('/rate_limit');
  return data.resources.core;
};

module.exports = { getProfile, getRepos, getEvents, searchUsers, getRateLimit };
