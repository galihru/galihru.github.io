const fs = require('fs');
const crypto = require('crypto');

// Fungsi untuk menghasilkan hash
function generateHash(input) {
  return crypto.createHash('sha256').update(input).digest('hex').substr(0, 8);
}

// Fungsi untuk menghasilkan nonce
function generateNonce() {
  return crypto.randomBytes(16).toString('hex');
}

// Generate hashed ID dan CSS class names
const hashedIds = {
  loading: generateHash('loading'),
  notFound: generateHash('not-found'),
  originalPath: generateHash('original-path'),
  suggestions: generateHash('suggestions'),
  suggestionList: generateHash('suggestion-list'),
};

const hashedCssClasses = {
  container: generateHash('container'),
  errorCode: generateHash('error-code'),
  notFound: generateHash('not-found'),
  suggestions: generateHash('suggestions'),
  suggestionItem: generateHash('suggestion-item'),
  loader: generateHash('loader'),
};

// Generate nonce untuk CSP
const styleNonce = generateNonce();
const scriptNonce = generateNonce();

// Konten HTML yang akan dihasilkan
const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Page Not Found - Redirecting...</title>
  <meta http-equiv="Content-Security-Policy" content="default-src 'self'; style-src 'nonce-${styleNonce}'; script-src 'nonce-${scriptNonce}';">
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
  </style>
</head>
<body>
  <div class="${hashedCssClasses.container}">
    <div id="${hashedIds.loading}">
      <h1>Mencari repositori...</h1>
      <div class="${hashedCssClasses.loader}"></div>
      <p>Sedang mencoba menemukan repositori yang sesuai...</p>
    </div>
    
    <div id="${hashedIds.notFound}" class="${hashedCssClasses.notFound}">
      <p class="${hashedCssClasses.errorCode}">404</p>
      <h1>Halaman Tidak Ditemukan</h1>
      <p>Maaf, halaman <strong id="${hashedIds.originalPath}"></strong> tidak ditemukan.</p>
      
      <div id="${hashedIds.suggestions}" class="${hashedCssClasses.suggestions}">
        <h2>Mungkin maksud Anda:</h2>
        <div id="${hashedIds.suggestionList}"></div>
      </div>
      
      <p><a href="/">Kembali ke Halaman Utama</a></p>
    </div>
  </div>
  
  <script nonce="${scriptNonce}" src="https://cdn.jsdelivr.net/npm/fuzzysort@2.0.4/fuzzysort.min.js"></script>
  <script nonce="${scriptNonce}">
    // Fungsi untuk mendapatkan slug dari URL
    function getSlug(path) {
      // Hilangkan slash awal dan akhir
      path = path.replace(/^\/|\/$/g, '');
      // Ambil bagian pertama dari path sebagai slug
      return path.split('/')[0];
    }

    // Fungsi untuk fuzzy matching
    async function findMatchingRepo(slug) {
      try {
        // Ambil data repo dari JSON
        const response = await fetch('/repo-data.json');
        const repoData = await response.json();
        
        // Buat array dari semua variasi nama repo
        const allRepoVariations = [];
        repoData.forEach(repo => {
          // Tambahkan nama repo asli
          allRepoVariations.push({
            name: repo.name,
            original: repo.name,
            hasIndex: repo.hasIndex,
            indexPath: repo.indexPath,
            url: repo.url
          });
          
          // Tambahkan variasi nama repo
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
        
        // Lakukan fuzzy matching
        const results = fuzzysort.go(slug, allRepoVariations, { key: 'name', limit: 5 });
        
        // Jika ada hasil yang cocok
        if (results.length > 0) {
          // Ambil hasil pertama
          const bestMatch = results[0].obj;
          
          // Kembalikan informasi repo yang cocok
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
        return { found: false, allMatches: [] };
      }
    }

    // Fungsi utama untuk handling redirect
    async function handleRedirect() {
      // Ambil path dari URL
      const path = window.location.pathname;
      
      // Dapatkan slug
      const slug = getSlug(path);
      
      if (!slug) {
        // Jika tidak ada slug, redirect ke halaman utama
        window.location.href = '/';
        return;
      }
      
      // Cari repo yang cocok
      const matchResult = await findMatchingRepo(slug);
      
      if (matchResult.found) {
        // Jika ditemukan, redirect ke URL yang benar
        window.location.href = matchResult.url;
        return;
      }
      
      // Jika tidak ditemukan, tampilkan halaman 404 dengan saran
      document.getElementById('${hashedIds.loading}').style.display = 'none';
      document.getElementById('${hashedIds.originalPath}').textContent = path;
      
      // Tampilkan saran
      const suggestionList = document.getElementById('${hashedIds.suggestionList}');
      if (matchResult.allMatches.length > 0) {
        matchResult.allMatches.forEach(match => {
          const item = document.createElement('div');
          item.className = '${hashedCssClasses.suggestionItem}';
          
          const link = document.createElement('a');
          link.href = match.url;
          link.textContent = match.original;
          
          item.appendChild(link);
          suggestionList.appendChild(item);
        });
      } else {
        document.getElementById('${hashedIds.suggestions}').style.display = 'none';
      }
      
      document.getElementById('${hashedIds.notFound}').style.display = 'block';
    }

    // Jalankan fungsi redirect saat halaman dimuat
    window.addEventListener('DOMContentLoaded', handleRedirect);
  </script>
</body>
</html>
`;

// Menulis file HTML
fs.writeFileSync('404.html', htmlContent);

console.log('File 404.html berhasil dibuat!');
