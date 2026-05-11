module.exports = (err, _req, res, _next) => {
  console.error('[ERROR]', err.message || err);

  if (err.status) {
    return res.status(err.status).json({ error: err.message });
  }

  if (err.message && err.message.includes('仅支持')) {
    return res.status(400).json({ error: err.message });
  }

  res.status(500).json({ error: '服务器内部错误' });
};
