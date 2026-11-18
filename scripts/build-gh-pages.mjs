import { execSync } from 'node:child_process';
import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const BASE_PATH = '/sklwasterorobin';

// 1. Run standard Astro static build with GitHub Pages base path for _astro assets
execSync(`npx astro build --site https://nimalanrao.github.io --base ${BASE_PATH}`, {
  stdio: 'inherit'
});

// 2. Recursively rewrite root-relative internal links and image paths in dist/**/*.html
function walkHtmlFiles(dir, files = []) {
  for (const entry of readdirSync(dir)) {
    const fullPath = join(dir, entry);
    if (statSync(fullPath).isDirectory()) {
      walkHtmlFiles(fullPath, files);
    } else if (fullPath.endsWith('.html')) {
      files.push(fullPath);
    }
  }
  return files;
}

const htmlFiles = walkHtmlFiles('dist');

for (const file of htmlFiles) {
  let html = readFileSync(file, 'utf8');

  // Rewrite root-relative href="/...", src="/...", srcset="/..." that are not already prefixed with /sklwasterorobin or //
  html = html.replace(
    /\b(href|src|srcset)="(?!\/sklwasterorobin(?:\b|\/)|\/\/)\/([^"]*)"/g,
    (_, attr, rest) => `${attr}="${BASE_PATH}/${rest}"`
  );

  writeFileSync(file, html, 'utf8');
}

// 3. Ensure .nojekyll exists in dist/ so GitHub Pages serves _astro/* assets
writeFileSync('dist/.nojekyll', '', 'utf8');
console.log(`GitHub Pages build ready in dist/ with base path ${BASE_PATH}`);
