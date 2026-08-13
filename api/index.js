const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const app = express();

// Basic middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Health check
app.get('/', (req, res) => {
    res.json({ status: 'ok', message: 'API is running' });
});

module.exports = app;
