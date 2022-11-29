// inport module with require
const http = require("http");
const url = require("url");
const fs = require("fs");
const replaceTemplate = require("./modules/replaceTemplate");

const slugify = require("slugify");
/* 
  slug is the last part of url that contain unique string
  that contain the ressource that the wibe site is displaying
*/
// read the file first to avoid to read it each time someone request it
// it's executed onece on the beging
const data = fs.readFileSync(`${__dirname}/dev-data/data.json`, "utf-8");
const dataObject = JSON.parse(data);

const slugs = dataObject.map((item) =>
  slugify(item.productName, { lower: true })
);
console.log(slugs);
const templateOverveiw = fs.readFileSync(
  `${__dirname}/templates/templateOverview.html`,
  "utf-8"
);
const templateCard = fs.readFileSync(
  `${__dirname}/templates/templateCard.html`,
  "utf-8"
);
const templateProduct = fs.readFileSync(
  `${__dirname}/templates/product.html`,
  "utf-8"
);

// create server using createServer methode
// and past a response for all request
const server = http.createServer((req, res) => {
  const { query, pathname } = url.parse(req.url, true);

  // OVERVIEW PAGE
  if (pathname === "/" || pathname === "/overview") {
    const cardHtml = dataObject
      .map((el) => replaceTemplate(templateCard, el))
      .join("");

    const output = templateOverveiw.replace(/{%PRODUCT_CARD%}/g, cardHtml);
    res.writeHead(200, {
      "Content-type": "text/html", // format respons as json
    });
    res.end(output);

    // PRODUCT
  } else if (pathname === "/product") {
    res.writeHead(200, {
      "Content-type": "text/html", // format respons as json
    });
    const product = dataObject[query.id];
    const output = replaceTemplate(templateProduct, product);
    console.log(query);
    res.end(output);

    // API
  } else if (pathname === "/api") {
    res.writeHead(200, {
      "Content-type": "application/json", // format respons as json
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
