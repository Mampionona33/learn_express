// inport module with require
const http = require("http");

// create server using createServer methode
// and past a response for all request
const server = http.createServer((req, res) => {
  // sending back a simple respon from request
  console.log(req);
  res.end(`Hello from the server`);
});

const PORT = 8000;

// listen to the port
server.listen(PORT, "127.0.0.1", () => {
  console.log(`server start on port ${PORT}`);
});

// finaly run the command node index.js