const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = Number(process.env.PORT || 4174);
const ROOT = __dirname;

const MIME_TYPES = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.txt': 'text/plain; charset=utf-8',
};

function safeJoin(base, targetPath) {
  const resolved = path.resolve(base, `.${targetPath}`);
  if (!resolved.startsWith(base)) {
    return null;
  }
  return resolved;
}

function resolveRequestPath(urlPath) {
  if (urlPath === '/') {
    return path.join(ROOT, 'index.html');
  }

  if (urlPath.startsWith('/day/')) {
    const maybeFile = safeJoin(ROOT, urlPath);
    if (maybeFile && fs.existsSync(maybeFile) && fs.statSync(maybeFile).isFile()) {
      return maybeFile;
    }
    return path.join(ROOT, 'day', 'index.html');
  }

  const fullPath = safeJoin(ROOT, urlPath);
  if (!fullPath) {
    return null;
  }

  if (fs.existsSync(fullPath) && fs.statSync(fullPath).isDirectory()) {
    return path.join(fullPath, 'index.html');
  }

  return fullPath;
}

http
  .createServer((req, res) => {
    const requestUrl = new URL(req.url, `http://${req.headers.host}`);
    const filePath = resolveRequestPath(requestUrl.pathname);

    if (!filePath || !fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('404 Not Found');
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    res.writeHead(200, { 'Content-Type': contentType });
    fs.createReadStream(filePath).pipe(res);
  })
  .listen(PORT, () => {
    console.log(`Missing Man local server running at http://localhost:${PORT}`);
  });

