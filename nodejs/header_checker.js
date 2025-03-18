const https = require('https');
const fs = require('fs');

// Periksa HTTP headers
function checkHeaders(url) {
  https.get(url, (res) => {
    console.log(`Status Code: ${res.statusCode}`);
    console.log('Headers:');
    const securityHeaders = [
      'content-security-policy',
      'strict-transport-security',
      'x-frame-options',
      'x-content-type-options',
    ];

    securityHeaders.forEach((header) => {
      if (res.headers[header]) {
        console.log(`${header}: ${res.headers[header]}`);
      } else {
        console.log(`${header}: Tidak ditemukan`);
      }
    });
  });
}

// Generate SRI hash
function generateSRI(file) {
  const crypto = require('crypto');
  const hash = crypto.createHash('sha256').update(fs.readFileSync(file)).digest('base64');
  console.log(`SRI Hash (sha256-${hash})`);
}

// Main
const url = 'https://4211421036.github.io';
checkHeaders(url);
generateSRI('script.js');
