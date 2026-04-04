const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static('public'));

// Docs route — Docsify handles client-side routing
app.get('/docs/*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'docs', 'index.html'));
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/trades', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'trades.html'));
});

app.get('/account', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'account.html'));
});

app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`DeadMKT running on port ${PORT}`);
});
