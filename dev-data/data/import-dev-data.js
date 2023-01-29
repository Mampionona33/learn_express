/* 
    1/  Run this command to import data to mongodb :
        node ./dev-data/data/import-dev-data.js --import
    2/  Run this command to delet all data to mongodb
        node ./dev-data/data/import-dev-data.js --delete
*/

const fs = require('fs');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

const TourModel = require('../../models/toursModel');

dotenv.config({ path: './.env' });

const DB = process.env.DATABASE_URL.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

// Connecting app to database
mongoose.set('strictQuery', false);
mongoose.connect(DB).then(() => console.log('DB connection successful !'));

// Loading data
const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/tours-simple.json`, 'utf-8')
);

// Import data to dataBase
const importData = async () => {
  try {
    await TourModel.create(tours);
    console.log('Data successfully loaded');
  } catch (error) {
    console.log(error);
  }
  process.exit();
};

// Delete data in mongodb
const deleteData = async () => {
  try {
    await TourModel.deleteMany();
    console.log('Data successfully deleted');
  } catch (error) {
    console.log(error);
  }
  process.exit();
};

/* 
    The process.argv property returns an array containing 
    the command-line arguments passed when the Node.js process 
    was launched. The first element will be execPath. See process.argv0 
    if access to the original value of argv[0] is needed. 
    The second element will be the path to the JavaScript file being executed. 
    The remaining elements will be any additional command-line arguments.

    console.log(process.argv); permet de savoir le process qui est en cours
    par exemple en lançant la commande
        - node ./dev-data/data/import-dev-data.js --import
        on obtient : 
            [
                '/usr/bin/node',
                '/home/mampionona/Learn_Back_End/learn_express/dev-data/data/import-dev-data.js',
                '--import'
            ]
*/
console.log(process.argv);

process.argv.map((item) => {
  if (item.match('--import')) {
    importData();
  }
  if (item.match('--delete')) {
    deleteData();
  }
  return null;
});
