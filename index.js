// inport module with require
const fs = require("fs");

// using the fs module to read file
const myText = fs.readFileSync("./txt/input.txt", "utf-8");
console.log(myText);


const txtOut = `this is the output text : ${myText}. \n Created onn ${Date.now()}`;
// write file 
fs.writeFileSync("./txt/output.txt", txtOut);
console.log('File writen');