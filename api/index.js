module.exports = (req, res) => {
  res.status(200).json({ 
    status: 'ok', 
    message: 'API is running',
    method: req.method,
    url: req.url
  });
};
