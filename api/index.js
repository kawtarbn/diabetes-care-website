const express = require('express');
const { createServer } = require('@vercel/express');
const app = require('../server');

module.exports = createServer(app);
