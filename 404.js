import fs from 'fs';
import crypto from 'crypto';

// Fungsi untuk menghasilkan hash yang konsisten
function generateHash(input) {
  return crypto.createHash('sha256').update(input).digest('hex').substr(0, 8);
}

// Fungsi untuk menghasilkan nonce
function generateNonce() {
  return crypto.randomBytes(16).toString('hex');
}

// Generate hash untuk semua komponen
const componentHashes = {
  header: generateHash('header'),
  nav: generateHash('nav'),
  dialog: generateHash('dialog'),
  progress: generateHash('progress'),
  loading: generateHash('loading'),
  notFound: generateHash('not-found'),
  originalPath: generateHash('original-path'),
  suggestions: generateHash('suggestions'),
  suggestionList: generateHash('suggestion-list'),
  mainContent: generateHash('main-content'),
  errorMessage: generateHash('error-message'),
  themeToggle: generateHash('theme-toggle'),
  progressBar: generateHash('progress-bar'),
};

const hashedCssClasses = {
  container: generateHash('container'),
  errorCode: generateHash('error-code'),
  notFound: generateHash('not-found'),
  suggestions: generateHash('suggestions'),
  suggestionItem: generateHash('suggestion-item'),
  loader: generateHash('loader'),
  visually_hidden: generateHash('visually-hidden'),
  button: generateHash('button'),
  progressBar: generateHash('progress-bar'),
  dialog: generateHash('dialog'),
  header: generateHash('header'),
  nav: generateHash('nav'),
};

// Generate nonce untuk CSP
const styleNonce = generateNonce();
const scriptNonce = generateNonce();

// HTML content to be generated
const htmlContent = `
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="Halaman 404 aplikasi kolasi yang dibuat oleh GALIH RIDHO UTOMO. Aplikasi ini membantu pengguna menemukan repositori yang dimaksud.">
  <meta name="keywords" content="HTML, 404, CSS, JavaScript, Web Development, SEO">
  <meta name="author" content="GALIH RIDHO UTOMO">
  <meta name="robots" content="index, follow">
  <base href="https://4211421036.github.io">
  <meta property="og:title" content="Page Not Found - Redirecting...">
  <meta property="og:description" content="Halaman 404 aplikasi kolasi yang dibuat oleh GALIH RIDHO UTOMO. Aplikasi ini membantu pengguna menemukan repositori yang dimaksud.">
  <meta property="og:image" content="http://4211421036.github.io/345677.png">
  <meta property="og:url" content="http://4211421036.github.io">
  <meta property="og:type" content="website">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="Page Not Found - Redirecting...">
  <meta name="twitter:description" content="Halaman 404 aplikasi kolasi yang dibuat oleh GALIH RIDHO UTOMO. Aplikasi ini membantu pengguna menemukan repositori yang dimaksud.">
  <meta name="twitter:image" content="http://4211421036.github.io/345677.png">
  <link rel="canonical" href="http://4211421036.github.io">
  <title>Page Not Found - Redirecting...</title>
  <meta http-equiv="Content-Security-Policy" content="default-src 'self'; style-src 'nonce-${styleNonce}'; script-src 'nonce-${scriptNonce}' https://cdn.jsdelivr.net;">
  <style nonce="${styleNonce}">
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      margin: 0;
      padding: 20px;
      color: var(--text-color);
      background-color: var(--background);
      transition: all 0.3s ease;
    }
    :root {
      --background: #ffffff;
      --text-color: #333333;
      --primary-color: #3498db;
    }
    [data-theme="dark"] {
      --background: #1a1a1a;
      --text-color: #ffffff;
      --primary-color: #2ecc71;
    }
    .${hashedCssClasses.container} {
      max-width: 800px;
      margin: 0 auto;
      text-align: center;
    }
    h1 {
      font-size: 36px;
      margin-bottom: 20px;
    }
    .${hashedCssClasses.errorCode} {
      font-size: 120px;
      font-weight: bold;
      color: #e74c3c;
      margin: 0;
    }
    .${hashedCssClasses.notFound} {
      display: none;
    }
    .${hashedCssClasses.suggestions} {
      margin-top: 20px;
      text-align: left;
      padding: 20px;
      background-color: var(--background);
      border-radius: 5px;
      border: 1px solid var(--text-color);
    }
    .${hashedCssClasses.suggestionItem} {
      margin-bottom: 10px;
    }
    .${hashedCssClasses.loader} {
      border: 5px solid #f3f3f3;
      border-top: 5px solid var(--primary-color);
      border-radius: 50%;
      width: 50px;
      height: 50px;
      animation: spin 1s linear infinite;
      margin: 20px auto;
    }
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    .skipLink {
      position: absolute;
      top: -40px;
      left: 0;
      background: var(--primary-color);
      color: white;
      padding: 8px;
      z-index: 100;
      transition: top 0.3s;
    }
    .skipLink:focus {
      top: 0;
    }
    .${hashedCssClasses.visually_hidden} {
      position: absolute;
      width: 1px;
      height: 1px;
      padding: 0;
      margin: -1px;
      overflow: hidden;
      clip: rect(0, 0, 0, 0);
      white-space: nowrap;
      border: 0;
    }
    a {
      color: var(--primary-color);
      text-decoration: underline;
      font-weight: bold;
    }
    a:hover, a:focus {
      color: var(--primary-color);
      text-decoration: underline;
      outline: 2px solid var(--primary-color);
    }
    .${hashedCssClasses.button} {
      background-color: var(--primary-color);
      color: white;
      border: none;
      padding: 10px 20px;
      cursor: pointer;
      border-radius: 5px;
    }
    .${hashedCssClasses.progressBar} {
      width: 0%;
      height: 10px;
      background-color: var(--primary-color);
      transition: width 0.3s ease;
    }
  </style>
</head>
<body>
  <header id="${componentHashes.header}" role="banner">
    <nav aria-label="Navigasi utama">
      <button id="${componentHashes.themeToggle}" class="${hashedCssClasses.button}">Toggle Tema</button>
    </nav>
  </header>

  <a href="#${componentHashes.mainContent}" class="skipLink" id="skipLink">Skip Link</a>
  
  <div class="${hashedCssClasses.container}">
    <main id="${componentHashes.mainContent}" tabindex="-1">
      <div id="${componentHashes.loading}" role="status" aria-live="polite">
        <h1>Mencari repositori...</h1>
        <div class="${hashedCssClasses.loader}" aria-hidden="true"></div>
        <p role="text">Sedang mencoba menemukan repositori yang sesuai...</p>
      </div>
      
      <div id="${componentHashes.notFound}" class="${hashedCssClasses.notFound}" role="alert" aria-labelledby="not-found-heading">
        <p class="${hashedCssClasses.errorCode}" aria-hidden="true">404</p>
        <h1 id="not-found-heading">Halaman Tidak Ditemukan</h1>
        <p role="text">Maaf, halaman <strong id="${componentHashes.originalPath}"></strong> tidak ditemukan.</p>
        
        <div id="${componentHashes.suggestions}" class="${hashedCssClasses.suggestions}" aria-labelledby="suggestions-heading">
          <h2 id="suggestions-heading">Mungkin maksud Anda:</h2>
          <ul id="${componentHashes.suggestionList}" role="list" aria-label="Daftar saran repositori"></ul>
        </div>
        
        <p id="${componentHashes.errorMessage}"></p>
        
        <p><a href="/" aria-label="Kembali ke Halaman Utama">Kembali ke Halaman Utama</a></p>
      </div>
    </main>
    
    <footer role="contentinfo">
      <p role="text">© 2025 GALIH RIDHO UTOMO. Semua hak dilindungi.</p>
    </footer>
  </div>
  
  <script nonce="${scriptNonce}" src="https://cdn.jsdelivr.net/npm/fuzzysort@2.0.4/fuzzysort.min.js"></script>
  <script nonce="${scriptNonce}">
    // Fungsi untuk toggle tema
    const themeToggle = document.getElementById('${componentHashes.themeToggle}');
    const currentTheme = localStorage.getItem('theme') || 'light';

    function applyTheme(theme) {
      document.documentElement.setAttribute('data-theme', theme);
      localStorage.setItem('theme', theme);
    }

    themeToggle.addEventListener('click', () => {
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      applyTheme(newTheme);
    });

    // Init tema
    applyTheme(currentTheme);

    // Fungsi untuk mendapatkan slug dari URL
    function getSlug(path) {
      path = path.replace(/^\/|\/$/g, '');
      return path.split('/')[0];
    }

    // Fungsi untuk fuzzy matching
    async function findMatchingRepo(slug) {
      try {
        const response = await fetch('/repo-data.json');
        if (!response.ok) throw new Error('Gagal mengambil data repositori');
        const repoData = await response.json();
        
        const allRepoVariations = repoData.flatMap(repo => [
          { name: repo.name, original: repo.name, hasIndex: repo.hasIndex, indexPath: repo.indexPath, url: repo.url },
          ...repo.variations.map(variation => ({ name: variation, original: repo.name, hasIndex: repo.hasIndex, indexPath: repo.indexPath, url: repo.url }))
        ]);
        
        const results = fuzzysort.go(slug, allRepoVariations, { key: 'name', limit: 5 });
        
        if (results.length > 0) {
          const bestMatch = results[0].obj;
          return {
            found: true,
            name: bestMatch.original,
            hasIndex: bestMatch.hasIndex,
            indexPath: bestMatch.indexPath,
            url: bestMatch.url,
            allMatches: results.map(r => r.obj)
          };
        }
        
        return { found: false, allMatches: [] };
      } catch (error) {
        console.error('Error:', error);
        return { found: false, allMatches: [], error: error.message };
      }
    }

    // Fungsi utama untuk handle redirect
    async function handleRedirect() {
      const path = window.location.pathname;
      const slug = getSlug(path);
      
      try {
        document.getElementById('${componentHashes.loading}').style.display = 'block';
        document.getElementById('${componentHashes.originalPath}').textContent = path;
        
        if (slug) {
          const matchResult = await findMatchingRepo(slug);
          
          if (matchResult.found) {
            window.location.href = matchResult.url;
            return;
          }
          
          const suggestionList = document.getElementById('${componentHashes.suggestionList}');
          if (matchResult.allMatches.length > 0) {
            matchResult.allMatches.forEach(match => {
              const item = document.createElement('li');
              item.className = '${hashedCssClasses.suggestionItem}';
              const link = document.createElement('a');
              link.href = match.url;
              link.textContent = match.original;
              link.setAttribute('aria-label', 'Kunjungi repositori ' + match.original);
              item.appendChild(link);
              suggestionList.appendChild(item);
            });
          } else {
            document.getElementById('${componentHashes.suggestions}').style.display = 'none';
          }
          
          if (matchResult.error) {
            document.getElementById('${componentHashes.errorMessage}').textContent = 
              'Terjadi kesalahan: ' + matchResult.error;
          }
        } else {
          document.getElementById('${componentHashes.suggestions}').style.display = 'none';
        }
        
        document.getElementById('${componentHashes.loading}').style.display = 'none';
        document.getElementById('${componentHashes.notFound}').style.display = 'block';
        
        setTimeout(() => {
          document.getElementById('${componentHashes.mainContent}').focus();
        }, 100);
      } catch (error) {
        console.error('Error:', error);
        document.getElementById('${componentHashes.loading}').style.display = 'none';
        document.getElementById('${componentHashes.notFound}').style.display = 'block';
        document.getElementById('${componentHashes.errorMessage}').textContent = 
          'Terjadi kesalahan: ' + error.message;
      }
    }

    // Event listeners
    window.addEventListener('DOMContentLoaded', handleRedirect);
    document.getElementById('skipLink').addEventListener('click', function(e) {
      e.preventDefault();
      document.getElementById('${componentHashes.mainContent}').focus();
    });
  </script>
</body>
</html>
`;

// Write HTML file
fs.writeFileSync('404.html', htmlContent);

console.log('File 404.html berhasil dibuat dengan semua perbaikan!');
