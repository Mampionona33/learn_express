const fs = require("fs");
const superagent = require("superagent");

const readFilePromise = (file) => {
  return new Promise((resolve, reject) => {
    fs.readFile(file, "utf8", (err, data) => {
      if (err) return reject("Can not read file 😞");
      resolve(data);
    });
  });
};

const writeFilePromise = (file, data) => {
  return new Promise((resolve, reject) => {
    fs.writeFile(file, data, (err) => {
      if (err) reject("Can not write this file 🥺");
      resolve("file create succesfuly");
    });
  });
};

// Use promise to prevent calback hell > form of calbacks
// use return at the end of each then

// readFilePromise(`${__dirname}/input.txt`)
//   .then((data) => {
//     const url = `https://random.imagecdn.app/500/${data}`;
//     return superagent.get(url);
//   })
//   .then((res) => {
//     return writeFilePromise(
//       `${__dirname}/output.txt`,
//       res.redirects[1],
//       "utf8"
//     );
//   })
//   .then(() => console.log("File successfully create"))
//   .catch((error) => {
//     console.log(error.message);
//   });

// this code is work as before but it is more readable

const getPic = async () => {
  const data = await readFilePromise(`${__dirname}/input.txt`);
  console.log(data);

  const url = `https://random.imagecdn.app/500/${data}`;
  const res = await superagent.get(url);
  console.log(res.redirects[1]);
  await writeFilePromise(`${__dirname}/output.txt`, res.redirects[1], "utf8");
};

getPic();
