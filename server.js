const dotenv = require('dotenv');
const morgan = require('morgan');
const mongoose = require('mongoose');
const app = require('./app');

/*
  In Node.js, an environment variable is a variable that is set outside of the code and can be accessed within the application. 
  The ".env" file is a file that stores these environment variables in key-value pairs, and is commonly used to store sensitive 
  information such as database credentials or API keys. 
  The variables in the .env file can be accessed using the "dotenv" package, which allows the application to read and use the 
  variables stored in the file. 
  It is important to note that the .env file should not be committed to version control as it contains sensitive information.
 */
dotenv.config({ path: './.env' });

const DB = process.env.DATABASE_URL.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

/* ********************************
 ********************MIDDLEWARES */
// morgan is HTTP request logger middleware for node.js
// Only run the morgan middleware if Node environment is set to development
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

//  set strictQuery to false to force the query identic ass data in database
//  if paramas does not exist in the schema so the response will be
//  an empty array.
mongoose.set({ strictQuery: false });
// Connecting app to database
mongoose.connect(DB).then(() => console.log('DB connection successful !'));

// -------- Run server -----------
const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () =>
  console.log(`Server start on port ${PORT}`)
);

process.on('unhandledRejection', (err) => {
  console.log(err.name, err.message);
  console.log('UNHANDLER REJECTION! Shutting down...');
  /* 
    use it to not close the server directly but waiting for 
    all task on the server is done
  */
  server.close(() => {
    process.exit(1);
  });
});
