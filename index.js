// inport module with require
const fs = require("fs");

/* 
    - in generaly, the first param of calback funciton is the error
    - using non block function 
*/
fs.readFile("./txt/input.txt", "utf-8", (err, data) => {
  if (err) return console.log(`error : ${err.message}`);

  console.log(data);
  fs.writeFile(
    "./txt/output.txt",
    `${data} \n This is the output file`,
    "utf-8",
    (err) => {
      console.log("The file has been  writen");
    }
  );
});
