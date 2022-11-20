// inport module with require
const http = require("http");
const url = require("url");
const fs = require("fs");

// read the file first to avoid to read it each time someone request it
// it's executed onece on the beging
const data = fs.readFileSync(`${__dirname}/dev-data/data.json`, "utf-8");
const dataObject = JSON.parse(data);

const templateOverveiw = fs.readFileSync(
  `${__dirname}/templates/templateOverview.html`,
  "utf-8"
);
const templateCard = fs.readFileSync(
  `${__dirname}/templates/templateCard.html`,
  "utf-8"
);

const replaceTemplate = (template, product) => {
  let output = template.replace(/{%PRODUCT_NAME%}/g, product.productName);
  output = output.replace(/{%IMAGE%}/g, product.image);
  output = output.replace(/{%ID%}/g, product.id);
  output = output.replace(/{%FROM%}/g, product.from);
  output = output.replace(/{%FROM%}/g, product.from);
  output = output.replace(/{%QUANTITY%}/g, product.quantity);

  return output;
};

// create server using createServer methode
// and past a response for all request
const server = http.createServer((req, res) => {
  const pathName = req.url;

  // OVERVIEW PAGE
  if (pathName === "/" || pathName === "/overview") {
    const cardHtml = dataObject
      .map((el) => replaceTemplate(templateCard, el))
      .join("");

    const output = templateOverveiw.replace(/{%PRODUCT_CARD%}/g, cardHtml);
    res.writeHead(200, {
      "Content-type": "text/html", // format respons as json
    });
    res.end(output);

    // PRODUCT
  } else if (pathName === "/product") {
    res.end("This is the PRODUCT");

    // API
  } else if (pathName === "/api") {
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
