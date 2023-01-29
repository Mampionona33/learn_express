const dotenv = require('dotenv');
const app = require('./app');

dotenv.config({ path: './.env' });

// -------- Run server -----------
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => console.log(`Server start on port ${PORT}`));
