const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors()); // ✅ FIX
app.use(express.json());

// test route
app.get('/ping', (req, res) => {
  res.send("PING WORKING");
});

// routes
const routes = require('./routes/index');
app.use('/api/v1', routes);

module.exports = app;