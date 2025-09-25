const { spawn, spawnSync } = require('child_process');
const net = require('net');
const path = require('path');

const projectRoot = path.resolve(__dirname, '..');
const useShell = process.platform === 'win32';
const childProcesses = [];
let terminating = false;

function runInitialBuild() {
  console.log('Running initial build...');
  const result = spawnSync('node', ['scripts/build.js'], {
    cwd: projectRoot,
    stdio: 'inherit',
    shell: useShell
  });

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

function register(child, label) {
  childProcesses.push({ child, label });
  child.on('error', (error) => {
    console.error(label + ' process error:', error.message);
    terminate(1);
  });
}

function startBuildWatch() {
  const watcher = spawn('node', ['scripts/build.js', '--watch'], {
    cwd: projectRoot,
    stdio: 'inherit',
    shell: useShell
  });

  watcher.on('exit', (code) => {
    if (!terminating) {
      console.log('Build watcher exited.');
      terminate(code ?? 0);
    }
  });

  register(watcher, 'build watch');
}

function killChild(entry) {
  if (!entry || entry.child.killed) {
    return;
  }

  if (process.platform === 'win32') {
    spawnSync('taskkill', ['/pid', entry.child.pid, '/f', '/t'], {
      stdio: 'ignore'
    });
  } else {
    entry.child.kill('SIGTERM');
  }
}

function terminate(code = 0) {
  if (terminating) {
    return;
  }

  terminating = true;
  for (const child of childProcesses) {
    killChild(child);
  }

  process.exit(code);
}

function isPortAvailable(port) {
  return new Promise((resolve, reject) => {
    const tester = net.createServer();

    tester.once('error', (err) => {
      tester.close();
      if (err.code === 'EADDRINUSE') {
        resolve(false);
      } else {
        reject(err);
      }
    });

    tester.once('listening', () => {
      tester.close(() => resolve(true));
    });

    tester.listen(port, '127.0.0.1');
  });
}

async function findAvailablePort(startPort, maxAttempts = 20) {
  let port = startPort;
  for (let attempt = 0; attempt < maxAttempts; attempt += 1, port += 1) {
    // eslint-disable-next-line no-await-in-loop
    const available = await isPortAvailable(port);
    if (available) {
      return port;
    }
  }

  throw new Error('Failed to find available port for dev server.');
}

function startDevServer(port) {
  const server = spawn('node', ['scripts/dev-server.js'], {
    cwd: projectRoot,
    stdio: 'inherit',
    shell: useShell,
    env: {
      ...process.env,
      PORT: String(port)
    }
  });

  server.on('exit', (code) => {
    if (!terminating) {
      console.log('Dev server exited.');
      terminate(code ?? 0);
    }
  });

  register(server, 'dev server');
}

process.on('SIGINT', () => terminate(0));
process.on('SIGTERM', () => terminate(0));

(async function main() {
  try {
    runInitialBuild();
    startBuildWatch();
    const preferredPort = Number(process.env.PORT) || 5173;
    const port = await findAvailablePort(preferredPort);

    if (port !== preferredPort) {
      console.log('Port ' + preferredPort + ' in use. Using ' + port + ' instead.');
    }

    startDevServer(port);
  } catch (error) {
    console.error('Failed to start dev environment:', error.message);
    terminate(1);
  }
})();
