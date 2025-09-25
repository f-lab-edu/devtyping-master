const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

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

// Clean dist directory
fs.rmSync(distDir, { recursive: true, force: true });
fs.mkdirSync(distDir, { recursive: true });

// Compile TypeScript files with Babel
console.log('Compiling TypeScript files with Babel...');
try {
  execSync('npx babel src --out-dir dist --extensions ".ts,.js" --copy-files', {
    cwd: path.resolve(__dirname, '..'),
    stdio: 'inherit'
  });
  console.log('Build completed successfully!');
} catch (error) {
  console.error('Build failed:', error.message);
  process.exitCode = 1;
}
