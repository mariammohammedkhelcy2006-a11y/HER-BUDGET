const fs = require('fs');
const path = require('path');

const sourceDir = __dirname;
const outputDir = path.join(sourceDir, 'dist');
const apiUrl = (process.env.HERBUDGET_API_URL || '').replace(/\/$/, '');

if (!apiUrl) {
    throw new Error('HERBUDGET_API_URL must be set to your Render backend URL in Vercel.');
}

fs.rmSync(outputDir, { recursive: true, force: true });
fs.mkdirSync(outputDir, { recursive: true });

for (const file of ['index.html', 'style.css', 'script.js']) {
    fs.copyFileSync(path.join(sourceDir, file), path.join(outputDir, file));
}

const safeApiUrl = JSON.stringify(apiUrl).replace(/</g, '\\u003c');
fs.writeFileSync(
    path.join(outputDir, 'config.js'),
    `window.HERBUDGET_API_URL = ${safeApiUrl};\n`,
    'utf8',
);

console.log(`Built frontend for ${apiUrl}`);
