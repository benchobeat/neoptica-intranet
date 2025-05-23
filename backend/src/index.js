require('dotenv').config();
const express = require('express');
const app = express();

app.get('/', (req, res) => {
  res.json({ status: 'Backend OK!' });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
