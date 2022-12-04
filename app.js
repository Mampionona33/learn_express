const express = require('express');

const app = express();

app.get('/', (req, res) => {
  res.status(200).json({ message: 'Hello from server', app: 'My app' });
});

app.post('/', (req, res) => {
  res.send('You can post from this url');
});

const PORT = 3000;

app.listen(PORT, () => console.log(`Server start on port ${PORT}`));
