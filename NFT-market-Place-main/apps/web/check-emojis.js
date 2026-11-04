const fs = require('fs');
const path = require('path');

const dirs = ['app', 'components', 'context', 'lib'];
const baseDir = __dirname;

const emojiRegex = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B50}\u{1F1E6}-\u{1F1FF}]/u;

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(fullPath));
    } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
      results.push(fullPath);
    }
  });
  return results;
}

let count = 0;
dirs.forEach(d => {
  const p = path.join(baseDir, d);
  if (fs.existsSync(p)) {
    const files = walk(p);
    files.forEach(f => {
      const content = fs.readFileSync(f, 'utf8');
      const lines = content.split('\n');
      lines.forEach((line, idx) => {
        if (emojiRegex.test(line)) {
          count++;
          const relative = path.relative(baseDir, f);
          console.log(`${relative}:${idx + 1}: ${line.trim()}`);
        }
      });
    });
  }
});
console.log(`\nTotal occurrences found: ${count}`);
