const app = require('./app');

// -------- Run server -----------
const PORT = 3000;

app.listen(PORT, () => console.log(`Server start on port ${PORT}`));
