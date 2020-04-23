const fs = require("fs");
const http = require("http");

var cwd = process.cwd();
console.log("cwd = ", cwd);

try {
  fs.mkdirSync(cwd + "/files/");
} catch (err) {}
http
  .createServer(function (req, res) {
    const url = req.url;
    const method = req.method.toLowerCase();
    console.log(url);
    if (url == "/" || url == "" || url == "/index") {
      console.log("req for index");
      res.writeHead(200, { "Content-Type": "text/html" });
      data = fs.readFileSync("./index.html");
      return res.end(data);
    }
    if (url.startsWith("/upload") && method == "post") {
      try {
        let binary = [];
        const fileEntry = url.split("/");
        const fileName = unescape(fileEntry[fileEntry.length - 1]);
        req.on("data", (chunk) => {
          binary.push(...chunk);
        });
        req.on("end", () => {
          fs.writeFile(
            `${cwd}/files/${fileName}`,
            new Uint8Array(binary),
            (err) => (err ? console.log(err) : undefined)
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
    res.writeHead(404, { "Content-Type": "text/html" });
    res.end(
      "<!DOCTYPE html>\n<html><head></head><body><h1>Not Found</h1></body></html>"
    );
  })
  .listen(8080);
