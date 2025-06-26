// server.test.js
const express = require('express');
const bodyParser = require('express').json;
const vehiculeRoutes = require('./routes/vehicule');

const app = express();
app.use(bodyParser());

// 🔁 Înlocuim db cu un mock (poți face și cu jest.fn() mai târziu)
app.use((req, res, next) => {
  req.db = {}; // mock DB
  next();
});

// 🔓 Scoatem autentificarea pentru test
app.use('/vehicule', vehiculeRoutes);

module.exports = app;
