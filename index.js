const fs = require("fs");
const http = require("http");

var cwd = process.cwd();

try {
  fs.mkdirSync(cwd + "/files/");
} catch (err) {}
http
  .createServer(function (req, res) {
    const url = req.url.toLowerCase();
    const method = req.method.toLowerCase();
    console.log(url);
    if (url == "/" || url == "" || url == "/index") {
      res.writeHead(200, { "Content-Type": "text/html" });
      const data = fs.readFileSync("./index.html");
      return res.end(data);
    }
    if (url.startsWith("/api/upload") && method == "post") {
      try {
        let binary = [];
        if (!url.includes("?") || !url.includes("filename=")) {
          res.writeHead(400);
          res.end("bad request");
        }
        const fileName = url.match(/\?.*?filename=([^&]*)&{0,1}/)[1];
        const fpath = `${cwd}/files/${fileName}`;
        req.on("data", (chunk) => {
          binary.push(...chunk);
        });
        req.on("end", () => {
          fs.writeFile(fpath, new Uint8Array(binary), (err) =>
            err ? console.log(err) : undefined
          );
          res.writeHead(200);
          res.end("ok");
        });
      } catch (error) {
        res.writeHead(400);
        res.end(error.toString());
      }

      return;
    }
    if (url.startsWith("/api/download")) {
      try {
        if (!url.includes("?") || !url.includes("filename=")) {
          res.writeHead(400);
          res.end("bad request");
        }
        const fileName = url.match(/\?.*?filename=([^&]*)&{0,1}/)[1];
        const fpath = `${cwd}/files/${fileName.toLowerCase()}`;
        if (!fs.existsSync(fpath)) {
          res.writeHead(404);
          res.end("requested file not found");
        }
        const fileData = fs.readFileSync(fpath);
        res.writeHead(200, { "content-type": "image/png" });
        res.end(fileData);
      } catch (err) {
        res.writeHead(400);
        res.end(err.toString());
      }
      return;
    }
    if (url.startsWith("/download")) {
      res.writeHead(200, { "Content-Type": "text/html" });
      const data = fs.readFileSync("./downloads.html");
      return res.end(data);
    }
    if (url.startsWith("/api/files-list")) {
      const files = fs.readdirSync("./files/");
      res.writeHead(200, { "Content-Type": "application/json" });
      return res.end(JSON.stringify({ files }));
    }
    res.writeHead(404, { "Content-Type": "text/html" });
    res.end(
      "<!DOCTYPE html>\n<html><head></head><body><h1>Requested URL Not Found</h1></body></html>"
    );
  })
  .listen(8080);
