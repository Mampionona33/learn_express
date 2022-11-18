// inport module with require
const http = require("http");
const url = require("url");
const fs = require("fs");

// read the fille first to avoid to read it each time someone request it
// it's executed onece on the beging
const data = fs.readFileSync(`${__dirname}/dev-data/data.json`, "utf-8");
const dataObject = JSON.parse(data);

// create server using createServer methode
// and past a response for all request
const server = http.createServer((req, res) => {
  // request url is /  and /favicon.ico by default
  // console.log(req.url);

  const pathName = req.url;

  if (pathName === "/" || pathName === "/overview") {
    // if path is equal to /  or /overview, then send respons :
    res.end("This is the OVERVIEW");
  } else if (pathName === "/product") {
    res.end("This is the PRODUCT");
  } else if (pathName === "/api") {
    res.writeHead(200, {     
      "Content-type": "application/json",  // format respons as json
    });
    res.end(data);
  } else {
    // this header alwas to be set before sending response
    res.writeHead(404, {
      "content-type": "text/html", //format the respons to html
      "my-own-header": "helllo-world",
    });
    res.end("<h1>Page not found</h1>");
  }
});

const PORT = 8000;

// listen to the port
server.listen(PORT, "127.0.0.1", () => {
  console.log(`server start on port ${PORT}`);
});

// finaly run the command node index.js
