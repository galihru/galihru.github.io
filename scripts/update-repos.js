import axios from 'axios';
import fs from 'fs';

const GITHUB_USERNAME = '4211421036';
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const REPOS_JSON_PATH = './repos.json';

async function fetchAllRepos() {
  let repos = [];
  let page = 1;
  let hasMore = true;

  while (hasMore) {
    try {
      const response = await axios.get(`https://api.github.com/users/${GITHUB_USERNAME}/repos`, {
        params: {
          per_page: 100, // Maksimal 100 repo per halaman
          page: page,
        },
        headers: {
          Authorization: `token ${GITHUB_TOKEN}`,
        },
      });

      if (response.data.length > 0) {
        repos = repos.concat(response.data.map(repo => repo.name.toLowerCase()));
        page++;
      } else {
        hasMore = false;
      }
    } catch (error) {
      console.error('Error fetching repos:', error);
      hasMore = false;
    }
  }

  return repos;
}

async function updateReposList() {
  const repos = await fetchAllRepos();
  fs.writeFileSync(REPOS_JSON_PATH, JSON.stringify(repos, null, 2));
  console.log('Repos list updated successfully!');
}

updateReposList();
