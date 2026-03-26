const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

// test route
app.get('/ping', (req, res) => {
  res.send("PING WORKING");
});

// routes
const routes = require('./routes/index');
app.use('/api', routes);

module.exports = app;