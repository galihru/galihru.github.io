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
        // Read HTML file
        let htmlContent = fs.readFileSync(inputFilePath, 'utf8');

        // Generate nonce for script
        const nonce = generateNonce();

        // Fix problematic script tags - looking for issues with type attributes
        // First, fix any script tags that have type attribute without a value
        htmlContent = htmlContent.replace(/<script\s+type(\s|>)/gi, '<script type="text/javascript"$1');
        
        // Fix any script tags with an empty type attribute
        htmlContent = htmlContent.replace(/<script\s+type=""\s*>/gi, '<script type="text/javascript">');
        
        // Fix any script tags with only spaces in type attribute
        htmlContent = htmlContent.replace(/<script\s+type="\s*"\s*>/gi, '<script type="text/javascript">');

        // Add bfcache script if it doesn't exist already
        if (!htmlContent.includes('Page restored from bfcache')) {
            htmlContent = htmlContent.replace('</body>', `<script nonce="${nonce}" type="text/javascript">${bfcacheScript}</script></body>`);
        }

        // Try minification with safer options
        let minifiedHTML;
        try {
            minifiedHTML = minify(htmlContent, {
                collapseWhitespace: true,
                removeComments: true,
                removeRedundantAttributes: true,
                removeEmptyAttributes: true,
                minifyJS: true,
                minifyCSS: true,
                collapseBooleanAttributes: true,
                removeScriptTypeAttributes: false, // Disable processing of type attributes
                removeStyleLinkTypeAttributes: false, // Disable processing of type attributes
                useShortDoctype: true,
                removeOptionalTags: false,
                removeTagWhitespace: false,
                processConditionalComments: true,
                removeAttributeQuotes: true,
                sortAttributes: true,
                sortClassName: true
            });
        } catch (minifyError) {
            // If first attempt fails, try with more conservative options
            console.log('First minification attempt failed, trying with safer options:', minifyError.message);
            
            minifiedHTML = minify(htmlContent, {
                collapseWhitespace: true,
                removeComments: true,
                minifyJS: false, // Disable JS minification
                minifyCSS: false, // Disable CSS minification
                collapseBooleanAttributes: true,
                removeScriptTypeAttributes: false, 
                removeStyleLinkTypeAttributes: false,
                useShortDoctype: true,
                removeOptionalTags: false,
                removeTagWhitespace: false,
                processConditionalComments: true,
                removeAttributeQuotes: false, // Don't remove quotes
                sortAttributes: false, // Don't sort attributes
                sortClassName: false // Don't sort classes
            });
        }

        // Save output to new file
        fs.writeFileSync(outputFilePath, minifiedHTML, 'utf8');

        console.log(`Minification completed & bfcache script added. Results saved to: ${outputFilePath}`);
    } catch (error) {
        console.error('Error occurred during HTML minification:', error);

        // If there's an error, read the HTML file again and save without minification
        try {
            const originalHtml = fs.readFileSync(inputFilePath, 'utf8');
            fs.writeFileSync(outputFilePath, originalHtml, 'utf8');
            console.log('HTML file saved without minification due to an error.');
        } catch (readError) {
            console.error('Could not save HTML file because content is not available:', readError);
        }
    }
}

const inputPath = path.resolve(process.env.GITHUB_WORKSPACE || '.', 'template.html');
const outputPath = path.resolve(process.env.GITHUB_WORKSPACE || '.', 'index.html');
const inputPaths = path.resolve(process.env.GITHUB_WORKSPACE || '.', 'tem.html');
const outputPaths = path.resolve(process.env.GITHUB_WORKSPACE || '.', '404.html');

processHTML(inputPaths, outputPaths);
processHTML(inputPath, outputPath);
