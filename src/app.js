const express = require('express');
const { sum } = require('./sum');

const INVALID_INPUT_MESSAGE = 'The fields "a" and "b" must be valid numbers.';

const app = express();
app.use(express.json());

const isValidNumber = (value) => typeof value === 'number' && Number.isFinite(value);

app.get('/ping', (req, res) => {
  res.json({ status: 'ok' });
});

app.get('/saudacao/:nome', (req, res) => {
  res.json({ mensagem: `Olá, ${req.params.nome}` });
});

const sumHandler = (req, res) => {
  const { a, b } = req.body ?? {};

  if (!isValidNumber(a) || !isValidNumber(b)) {
    res.status(400).json({ erro: INVALID_INPUT_MESSAGE });
    return;
  }

  res.status(200).json({ resultado: sum(a, b) });
};

app.post('/soma', sumHandler);
app.post('/api/soma', sumHandler);

app.use((req, res) => {
  res.status(404).json({ error: 'Route not found.' });
});

module.exports = app;
