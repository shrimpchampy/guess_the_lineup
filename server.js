const http = require("http");
const fs = require("fs");
const path = require("path");
const os = require("os");

const PORT = 4174;
const ROOT = __dirname;

function getLocalIP() {
  const nets = os.networkInterfaces();
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      if (net.family === "IPv4" && !net.internal) return net.address;
    }
  }
  return "localhost";
}

http
  .createServer((req, res) => {
    const urlPath = req.url.split("?")[0];
    const filePath = urlPath.startsWith("/day/")
      ? path.join(ROOT, "day", "index.html")
      : path.join(ROOT, urlPath === "/" ? "index.html" : urlPath.slice(1));

    fs.readFile(filePath, (err, data) => {
      if (err) {
        res.writeHead(404);
        res.end("Not found");
        return;
      }
      const ext = path.extname(filePath);
      const types = {
        ".html": "text/html; charset=utf-8",
        ".css": "text/css; charset=utf-8",
        ".js": "application/javascript; charset=utf-8"
      };
      const contentType = types[ext] || "application/octet-stream";
      res.writeHead(200, { "Content-Type": contentType });
      res.end(data);
    });
  })
  .listen(PORT, "0.0.0.0", () => {
    const ip = getLocalIP();
    console.log(`Running at http://localhost:${PORT}`);
    console.log(`On your phone, use: http://${ip}:${PORT}`);
  });
