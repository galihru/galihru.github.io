import fs from 'fs';
import { minify } from 'html-minifier';
import { parse } from 'node-html-parser';
import crypto from 'crypto';

const htmlFile = 'mobile/index.html';
const minifyConfig = {
  collapseWhitespace: true,
  removeComments: true,
  minifyCSS: true,
  minifyJS: true,
};

function generateHash(str) {
  return crypto
    .createHash('sha256')
    .update(str)
    .digest('hex')
    .substring(0, 8);
}

function processHTML(html) {
  const root = parse(html);
  const styleTags = root.querySelectorAll('style');
  const classMap = new Map();
  const idMap = new Map();

  styleTags.forEach((styleTag) => {
    let css = styleTag.innerHTML;

    css = css.replace(/\.([a-zA-Z0-9_-]+)/g, (match, cls) => {
      if (!classMap.has(cls)) {
        classMap.set(cls, generateHash(cls));
      }
      return `.${classMap.get(cls)}`;
    });

    // Process IDs
    css = css.replace(/#([a-zA-Z0-9_-]+)/g, (match, id) => {
      if (!idMap.has(id)) {
        idMap.set(id, generateHash(id));
      }
      return `#${idMap.get(id)}`;
    });

    styleTag.set_content(css);
  });

  // Process HTML elements
  root.querySelectorAll('*').forEach((element) => {
    // Update classes
    if (element.classNames) {
      const newClasses = element.classNames
        .split(' ')
        .map((cls) => classMap.get(cls) || cls)
        .join(' ');
      element.setAttribute('class', newClasses);
    }

    // Update IDs
    const id = element.id;
    if (id && idMap.has(id)) {
      element.setAttribute('id', idMap.get(id));
    }
  });

  // Process script tags
  root.querySelectorAll('script').forEach((script) => {
    let scriptContent = script.innerHTML;

    // Update class names in scripts
    classMap.forEach((value, key) => {
      // Handle regular class assignments
      const regex = new RegExp(
        `(?:className|classList\\.\\w+)\\s*=\\s*['"]${key}['"]`,
        'g'
      );
      scriptContent = scriptContent.replace(regex, (match) => {
        return match.replace(key, value);
      });

      // Handle innerHTML templates
      const innerHtmlRegex = new RegExp(`class=['"]${key}['"]`, 'g');
      scriptContent = scriptContent.replace(innerHtmlRegex, `class="${value}"`);
    });

    // Update IDs in scripts
    idMap.forEach((value, key) => {
      // Handle regular ID assignments
      const regex = new RegExp(
        `(?:getElementById|querySelector|querySelectorAll)\\s*\\(\\s*['"]#?${key}['"]\\s*\\)`,
        'g'
      );
      scriptContent = scriptContent.replace(regex, (match) => {
        return match.replace(key, value);
      });

      // Handle innerHTML templates
      const innerHtmlRegex = new RegExp(`id=['"]${key}['"]`, 'g');
      scriptContent = scriptContent.replace(innerHtmlRegex, `id="${value}"`);
    });

    // Update createElement with class and id
    scriptContent = scriptContent.replace(
      /(?:\.className\s*=\s*['"]|\.classList\.add\()(['"a-zA-Z0-9_-]+)/g,
      (match, cls) => {
        return match.replace(cls, classMap.get(cls) || cls);
      }
    );

    scriptContent = scriptContent.replace(
      /\.id\s*=\s*['"]([a-zA-Z0-9_-]+)['"]/g,
      (match, id) => {
        return `.id = '${idMap.get(id) || id}'`;
      }
    );

    // Update dataset attributes
    scriptContent = scriptContent.replace(
      /\.dataset\.(\w+)\s*=\s*(['"].*?['"])/g,
      (match, prop, value) => {
        if (prop === 'repo') {
          // Handle JSON string in dataset
          return match.replace(value, value.replace(/"class":"([^"]+)"/g, (m, cls) => {
            return `"class":"${classMap.get(cls) || cls}"`;
          }));
        }
        return match;
      }
    );

    script.set_content(scriptContent);
  });

  return root.toString();
}

// Main process
fs.readFile(htmlFile, 'utf8', (err, data) => {
  if (err) throw err;

  const processedHtml = processHTML(data);
  const minifiedHtml = minify(processedHtml, minifyConfig);

  fs.writeFile(htmlFile, minifiedHtml, 'utf8', (err) => {
    if (err) throw err;
    console.log('CSS hashed and HTML minified successfully!');
  });
});
