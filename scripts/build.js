const fs = require('fs');
const path = require('path');
const { spawn, spawnSync } = require('child_process');

const projectRoot = path.resolve(__dirname, '..');
const srcDir = path.join(projectRoot, 'src');
const distDir = path.join(projectRoot, 'dist');
const isWatch = process.argv.includes('--watch');
const useShell = process.platform === 'win32';

if (!fs.existsSync(srcDir)) {
  console.error('Source directory src/ does not exist.');
  process.exitCode = 1;
  return;
}

function cleanDist() {
  fs.rmSync(distDir, { recursive: true, force: true });
  fs.mkdirSync(distDir, { recursive: true });
}

cleanDist();

const babelArgs = ['babel', 'src', '--out-dir', 'dist', '--extensions', '.ts,.js', '--copy-files'];

if (isWatch) {
  console.log('Compiling TypeScript files with Babel (watch mode)...');
  const watcher = spawn('npx', [...babelArgs, '--watch'], {
    cwd: projectRoot,
    stdio: 'inherit',
    shell: useShell
  });

  watcher.on('exit', (code) => {
    process.exitCode = code ?? 0;
  });

  watcher.on('error', (error) => {
    console.error('Babel watch process failed:', error.message);
    process.exitCode = 1;
  });

  return;
}

console.log('Compiling TypeScript files with Babel...');
const result = spawnSync('npx', babelArgs, {
  cwd: projectRoot,
  stdio: 'inherit',
  shell: useShell
});

if (result.status !== 0) {
  console.error('Build failed.');
  process.exitCode = result.status ?? 1;
  return;
}

console.log('Build completed successfully!');
