import fs from 'fs';
import crypto from 'crypto';

// Function to generate hash
function generateHash(input) {
  return crypto.createHash('sha256').update(input).digest('hex').substr(0, 8);
}

// Function to generate nonce
function generateNonce() {
  return crypto.randomBytes(16).toString('hex');
}

// Generate hashed ID and CSS class names
const hashedIds = {
  loading: generateHash('loading'),
  notFound: generateHash('not-found'),
  originalPath: generateHash('original-path'),
  suggestions: generateHash('suggestions'),
  suggestionList: generateHash('suggestion-list'),
  mainContent: generateHash('main-content'),
  skipLink: generateHash('skip-link'),
};

const hashedCssClasses = {
  container: generateHash('container'),
  errorCode: generateHash('error-code'),
  notFound: generateHash('not-found'),
  suggestions: generateHash('suggestions'),
  suggestionItem: generateHash('suggestion-item'),
  loader: generateHash('loader'),
  skipLink: generateHash('skip-link'),
  visually_hidden: generateHash('visually-hidden'),
};

// Generate nonce for CSP
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
      color: #333;
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
      background-color: #f8f9fa;
      border-radius: 5px;
    }
    .${hashedCssClasses.suggestionItem} {
      margin-bottom: 10px;
    }
    .${hashedCssClasses.loader} {
      border: 5px solid #f3f3f3;
      border-top: 5px solid #3498db;
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
    .${hashedCssClasses.skipLink} {
      position: absolute;
      top: -40px;
      left: 0;
      background: #3498db;
      color: white;
      padding: 8px;
      z-index: 100;
      transition: top 0.3s;
    }
    .${hashedCssClasses.skipLink}:focus {
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
      color: #3498db;
      text-decoration: underline;
      font-weight: bold;
    }
    a:hover, a:focus {
      color: #2980b9;
      text-decoration: underline;
      outline: 2px solid #3498db;
    }
  </style>
</head>
<body>
  <a href="#${hashedIds.mainContent}" class="${hashedCssClasses.skipLink}" id="${hashedIds.skipLink}">Lewati ke konten utama</a>
  
  <div class="${hashedCssClasses.container}">
    <main id="${hashedIds.mainContent}" tabindex="-1">
      <div id="${hashedIds.loading}" role="status" aria-live="polite">
        <h1>Mencari repositori...</h1>
        <div class="${hashedCssClasses.loader}" aria-hidden="true"></div>
        <p>Sedang mencoba menemukan repositori yang sesuai...</p>
      </div>
      
      <div id="${hashedIds.notFound}" class="${hashedCssClasses.notFound}" role="alert" aria-labelledby="not-found-heading">
        <p class="${hashedCssClasses.errorCode}" aria-hidden="true">404</p>
        <h1 id="not-found-heading">Halaman Tidak Ditemukan</h1>
        <p>Maaf, halaman <strong id="${hashedIds.originalPath}"></strong> tidak ditemukan.</p>
        
        <div id="${hashedIds.suggestions}" class="${hashedCssClasses.suggestions}" aria-labelledby="suggestions-heading">
          <h2 id="suggestions-heading">Mungkin maksud Anda:</h2>
          <ul id="${hashedIds.suggestionList}" role="list" aria-label="Daftar saran repositori"></ul>
        </div>
        
        <p><a href="/" aria-label="Kembali ke Halaman Utama">Kembali ke Halaman Utama</a></p>
      </div>
    </main>
    
    <footer role="contentinfo">
      <p>© 2025 GALIH RIDHO UTOMO. Semua hak dilindungi.</p>
    </footer>
  </div>
  
  <script nonce="${scriptNonce}" src="https://cdn.jsdelivr.net/npm/fuzzysort@2.0.4/fuzzysort.min.js"></script>
  <script nonce="${scriptNonce}">
    // Function to get slug from URL
    function getSlug(path) {
      // Remove leading and trailing slashes
      path = path.replace(/^\/|\/$/g, '');
      // Get the first part of the path as slug
      return path.split('/')[0];
    }

    // Function for fuzzy matching
    async function findMatchingRepo(slug) {
      try {
        // Get repo data from JSON
        const response = await fetch('/repo-data.json');
        if (!response.ok) {
          throw new Error('Failed to fetch repo data');
        }
        const repoData = await response.json();
        
        // Create array of all repo name variations
        const allRepoVariations = [];
        repoData.forEach(repo => {
          // Add original repo name
          allRepoVariations.push({
            name: repo.name,
            original: repo.name,
            hasIndex: repo.hasIndex,
            indexPath: repo.indexPath,
            url: repo.url
          });
          
          // Add repo name variations
          repo.variations.forEach(variation => {
            allRepoVariations.push({
              name: variation,
              original: repo.name,
              hasIndex: repo.hasIndex,
              indexPath: repo.indexPath,
              url: repo.url
            });
          });
        });
        
        // Perform fuzzy matching
        const results = fuzzysort.go(slug, allRepoVariations, { key: 'name', limit: 5 });
        
        // If there are matching results
        if (results.length > 0) {
          // Get the best match
          const bestMatch = results[0].obj;
          
          // Return matching repo information
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
        console.error('Error finding matching repo:', error);
        return { found: false, allMatches: [], error: error.message };
      }
    }

    // Main function for handling redirects
    async function handleRedirect() {
      // Get path from URL
      const path = window.location.pathname;
      
      // Get slug
      const slug = getSlug(path);
      
      if (!slug) {
        // If no slug, redirect to home page
        window.location.href = '/';
        return;
      }
      
      // Find matching repo
      try {
        const matchResult = await findMatchingRepo(slug);
        
        if (matchResult.found) {
          // If found, redirect to correct URL
          window.location.href = matchResult.url;
          return;
        }
        
        // If not found, show 404 page with suggestions
        document.getElementById('${hashedIds.loading}').style.display = 'none';
        document.getElementById('${hashedIds.originalPath}').textContent = path;
        
        // Show suggestions
        const suggestionList = document.getElementById('${hashedIds.suggestionList}');
        if (matchResult.allMatches && matchResult.allMatches.length > 0) {
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
          document.getElementById('${hashedIds.suggestions}').style.display = 'none';
        }
        
        document.getElementById('${hashedIds.notFound}').style.display = 'block';
        
        // Set focus to the main content for screen readers
        setTimeout(() => {
          document.getElementById('${hashedIds.mainContent}').focus();
        }, 100);
      } catch (error) {
        console.error('Error in redirect handling:', error);
        document.getElementById('${hashedIds.loading}').style.display = 'none';
        document.getElementById('${hashedIds.notFound}').style.display = 'block';
      }
    }

    // Run redirect function when page loads
    window.addEventListener('DOMContentLoaded', handleRedirect);
    
    // Make sure the skip link works properly
    document.getElementById('${hashedIds.skipLink}').addEventListener('click', function(e) {
      e.preventDefault();
      document.getElementById('${hashedIds.mainContent}').focus();
    });
  </script>
</body>
</html>
`;

// Write HTML file
fs.writeFileSync('404.html', htmlContent);

console.log('File 404.html berhasil dibuat dengan perbaikan aksesibilitas!');
