const http = require('http');
const fs = require('fs');
const path = require('path');
const { URL } = require('url');

const host = '127.0.0.1';
const port = Number(process.env.PORT) || 5173;
const rootDir = path.resolve(__dirname, '..', 'src');

const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml; charset=utf-8',
  '.ico': 'image/x-icon'
};

function sendNotFound(res) {
  res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
  res.end('Not Found');
}

function serveFile(res, filePath) {
  fs.stat(filePath, (statErr, stats) => {
    if (statErr) {
      return sendNotFound(res);
    }

    if (stats.isDirectory()) {
      const indexPath = path.join(filePath, 'index.html');
      return serveFile(res, indexPath);
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = mimeTypes[ext] || 'application/octet-stream';
    const stream = fs.createReadStream(filePath);

    stream.on('open', () => {
      res.writeHead(200, { 'Content-Type': contentType });
      stream.pipe(res);
    });

    stream.on('error', () => {
      sendNotFound(res);
    });
  });
}

const server = http.createServer((req, res) => {
  const requestUrl = new URL(req.url, 'http://' + req.headers.host);
  const relativePath = decodeURIComponent(requestUrl.pathname);
  const resolvedPath = path.resolve(rootDir, '.' + relativePath);

  if (!resolvedPath.startsWith(rootDir)) {
    res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Forbidden');
    return;
  }

  serveFile(res, resolvedPath);
});

server.listen(port, host, () => {
  console.log('Dev server running at http://' + host + ':' + port);
});
