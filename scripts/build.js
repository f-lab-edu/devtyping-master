const fs = require('fs');
const path = require('path');

const srcDir = path.resolve(__dirname, '..', 'src');
const distDir = path.resolve(__dirname, '..', 'dist');

function copyDir(from, to) {
  if (!fs.existsSync(to)) {
    fs.mkdirSync(to, { recursive: true });
  }

  for (const entry of fs.readdirSync(from, { withFileTypes: true })) {
    const sourcePath = path.join(from, entry.name);
    const targetPath = path.join(to, entry.name);

    if (entry.isDirectory()) {
      copyDir(sourcePath, targetPath);
    } else {
      fs.copyFileSync(sourcePath, targetPath);
    }
  }
}

if (!fs.existsSync(srcDir)) {
  console.error('Source directory src/ does not exist.');
  process.exitCode = 1;
  return;
}

fs.rmSync(distDir, { recursive: true, force: true });
copyDir(srcDir, distDir);
console.log('Build output copied to dist/.');
