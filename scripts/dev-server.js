const http = require('http');
const fs = require('fs');
const path = require('path');
const { URL } = require('url');

const host = '127.0.0.1';
const port = Number(process.env.PORT) || 5173;
const rootDir = path.resolve(__dirname, '..', 'dist');

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
      if (!path.extname(filePath)) {
        const jsFallbackPath = filePath + '.js';
        if (fs.existsSync(jsFallbackPath)) {
          return serveFile(res, jsFallbackPath);
        }
      }

      return sendNotFound(res);
    }

    if (stats.isDirectory()) {
      const indexHtmlPath = path.join(filePath, 'index.html');
      if (fs.existsSync(indexHtmlPath)) {
        return serveFile(res, indexHtmlPath);
      }

      const indexJsPath = path.join(filePath, 'index.js');
      if (fs.existsSync(indexJsPath)) {
        return serveFile(res, indexJsPath);
      }

      return sendNotFound(res);
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
  const rawPath = decodeURIComponent(requestUrl.pathname);
  const normalizedPath = path.posix.normalize(rawPath);
  const safePathSegment = normalizedPath.replace(/^\/+/, '');
  const safePath = '/' + safePathSegment;
  const resolvedPath = path.resolve(rootDir, '.' + safePath);

  if (!resolvedPath.startsWith(rootDir)) {
    res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Forbidden');
    return;
  }

  fs.stat(resolvedPath, (statErr, stats) => {
    if (!statErr && stats.isDirectory() && !safePath.endsWith('/')) {
      const redirectPath = encodeURI(safePath.endsWith('/') ? safePath : safePath + '/');
      const location = requestUrl.search ? redirectPath + requestUrl.search : redirectPath;
      res.writeHead(301, { Location: location });
      res.end();
      return;
    }

    serveFile(res, resolvedPath);
  });
});

server.listen(port, host, () => {
  console.log('Dev server running at http://' + host + ':' + port);
});
