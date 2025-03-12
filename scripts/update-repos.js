const fs = require('fs');
const { Octokit } = require('@octokit/rest');

// Inisialisasi Octokit dengan token GitHub
const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN
});

const USERNAME = '4211421036';
const MAX_REPOS = 1000; // Maksimal jumlah repo yang akan diambil

async function getAllRepos() {
  let repos = [];
  let page = 1;
  let hasMore = true;

  while (hasMore && repos.length < MAX_REPOS) {
    const response = await octokit.repos.listForUser({
      username: USERNAME,
      type: 'all',
      per_page: 100,
      page: page
    });

    if (response.data.length === 0) {
      hasMore = false;
    } else {
      repos = repos.concat(response.data);
      page++;
    }
  }

  return repos;
}

async function checkForIndexHtml(owner, repo, path = '') {
  try {
    const response = await octokit.repos.getContent({
      owner,
      repo,
      path
    });

    if (Array.isArray(response.data)) {
      // Ini adalah direktori
      const indexFile = response.data.find(file => file.name === 'index.html');
      if (indexFile) {
        return { hasIndex: true, path: path || '/' };
      }

      // Cek subdirektori
      for (const item of response.data) {
        if (item.type === 'dir') {
          const result = await checkForIndexHtml(owner, repo, item.path);
          if (result.hasIndex) {
            return result;
          }
        }
      }
    } else if (response.data.name === 'index.html') {
      // Ini adalah file index.html
      return { hasIndex: true, path: path || '/' };
    }

    return { hasIndex: false };
  } catch (error) {
    return { hasIndex: false };
  }
}

async function generateRepoData() {
  try {
    console.log('Fetching repositories...');
    const repos = await getAllRepos();
    console.log(`Found ${repos.length} repositories`);

    const repoData = [];

    for (let i = 0; i < repos.length; i++) {
      const repo = repos[i];
      console.log(`Processing ${i + 1}/${repos.length}: ${repo.name}`);

      const indexResult = await checkForIndexHtml(USERNAME, repo.name);

      repoData.push({
        name: repo.name,
        hasIndex: indexResult.hasIndex,
        indexPath: indexResult.path || null,
        url: indexResult.hasIndex 
          ? `https://${USERNAME}.github.io/${repo.name}${indexResult.path === '/' ? '' : indexResult.path}`
          : repo.html_url,
        variations: [
          repo.name.toLowerCase(),
          repo.name.toUpperCase(),
          // camelCase
          repo.name.replace(/-([a-z])/g, (g) => g[1].toUpperCase()),
          // kebab-case
          repo.name.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase(),
          // PascalCase
          repo.name.charAt(0).toUpperCase() + repo.name.slice(1).replace(/-([a-z])/g, (g) => g[1].toUpperCase())
        ]
      });
    }

    // Tulis data ke file JSON
    fs.writeFileSync('repo-data.json', JSON.stringify(repoData, null, 2));
    console.log('Repository data generated successfully');
  } catch (error) {
    console.error('Error generating repository data:', error);
    process.exit(1);
  }
}

generateRepoData();
