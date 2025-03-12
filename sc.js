import fs from 'fs';
import crypto from 'crypto';
import path from 'path';
import { minify } from 'html-minifier';

function generateNonce() {
    return crypto.randomBytes(16).toString('base64');
}

const bfcacheScript = `
performance.mark('app-init-start');

function loadThirdParty(element) {
    const actualSrc = element.dataset.src;
    const actualType = element.dataset.type;
    
    if (actualType === 'script') {
        const script = document.createElement('script');
        script.src = actualSrc;
        script.async = true;
        element.parentNode.replaceChild(script, element);
    } else if (actualType === 'iframe') {
        const iframe = document.createElement('iframe');
        iframe.src = actualSrc;
        Object.assign(iframe, {
            width: element.dataset.width || '100%',
            height: element.dataset.height || '100%',
            frameborder: '0'
        });
        element.parentNode.replaceChild(iframe, element);
    }
    
    performance.mark('third-party-load-' + actualSrc);
    performance.measure('third-party-loading', 'app-init-start', 'third-party-load-' + actualSrc);
}

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            loadThirdParty(entry.target);
            observer.unobserve(entry.target);
        }
    });
}, {
    rootMargin: '50px'
});
window.addEventListener('pageshow', function(event) {
    performance.mark('pageshow-start');
    if (event.persisted) {
        console.log('Page restored from bfcache');
        performance.measure('bfcache-restoration', 'pageshow-start');
    }
});

window.addEventListener('load', function() {
    performance.mark('page-load-complete');
    performance.measure('total-page-load', 'app-init-start', 'page-load-complete');
    
    // Initialize lazy loading
    document.querySelectorAll('[data-lazy]').forEach(element => {
        observer.observe(element);
    });
});

// Send performance metrics to analytics
function sendPerformanceMetrics() {
    const metrics = performance.getEntriesByType('measure');
    console.log('Performance metrics:', metrics);
    // Here you could send these metrics to your analytics service
}


window.addEventListener('pagehide', function(event) {
    console.log('Page is being unloaded');
});

document.addEventListener('visibilitychange', function() {
    if (document.visibilityState === 'hidden') {
        performance.mark('page-hide');
        performance.measure('page-visible-duration', 'app-init-start', 'page-hide');
        sendPerformanceMetrics();
        console.log('Page hidden, prepare for restoration');
    }
});
`;

function processHTML(inputFilePath, outputFilePath) {
    try {
        let htmlContent = fs.readFileSync(inputFilePath, 'utf8');

        // Generate nonce
        const nonce = generateNonce();

        // Tambahkan script bfcache hanya jika belum ada
        if (!htmlContent.includes('Page restored from bfcache')) {
            htmlContent = htmlContent.replace('</body>', `<script nonce="${nonce}">${bfcacheScript}</script></body>`);
        }

        // Minifikasi HTML dengan opsi yang aman
        const minifiedHTML = minify(htmlContent, {
            collapseWhitespace: true,
            removeComments: true,
            removeRedundantAttributes: true,
            removeEmptyAttributes: true,
            minifyJS: true,
            minifyCSS: true,
            collapseBooleanAttributes: true,
            removeScriptTypeAttributes: false, // Nonaktifkan pemrosesan atribut type
            removeStyleLinkTypeAttributes: false, // Nonaktifkan pemrosesan atribut type
            useShortDoctype: true,
            removeOptionalTags: false,
            removeTagWhitespace: false,
            processConditionalComments: true,
            removeAttributeQuotes: true,
            sortAttributes: true,
            sortClassName: true,
        });

        // Simpan output ke file baru
        fs.writeFileSync(outputFilePath, minifiedHTML, 'utf8');

        console.log(`Minifikasi selesai & bfcache script ditambahkan. Hasil disimpan di: ${outputFilePath}`);
    } catch (error) {
        console.error('Terjadi kesalahan saat meminifikasi HTML:', error);

        // Jika terjadi error, simpan HTML tanpa minifikasi
        fs.writeFileSync(outputFilePath, htmlContent, 'utf8');
        console.log('File HTML disimpan tanpa minifikasi karena terjadi error.');
    }
}

const inputPaths = path.resolve(process.env.GITHUB_WORKSPACE, 'template.html');
const outputPaths = path.resolve(process.env.GITHUB_WORKSPACE, 'index.html');

processHTML(inputPaths, outputPaths);
