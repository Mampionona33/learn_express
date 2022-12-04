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

const getPic = async () => {
  try {
    const data = await readFilePromise(`${__dirname}/input.txt`);
    console.log(data);
    const url = `https://random.imagecdn.app/500/${data}`;
    // just save promise inside variable. Not wating it with await
    const res1 = superagent.get(url);
    const res2 = superagent.get(url);
    const res3 = superagent.get(url);

    // then use await Promise.all to store all promise responses in on array
    const allPromise = await Promise.all([res1, res2, res3]);
    const images = allPromise.map((el) => el.redirects[1]);

    console.log(images);

    await writeFilePromise(
      `${__dirname}/output.txt`,
      images.join("\n"),
      "utf8"
    );
  } catch (error) {
    // using throw to return error as respons of promise when there is error
    throw error;
  }
  return "2: ready";
};

// using imediatly invoked function
(async () => {
  try {
    console.log("1- Will get pic");
    const res = await getPic();
    console.log(res);
    console.log("3- task done");
  } catch (error) {
    console.log(error.message);
  }
})();
