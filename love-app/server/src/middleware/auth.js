const jwt = require('jsonwebtoken');
const { secret } = require('../config/jwt');

module.exports = (req, res, next) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: '未提供认证令牌' });
  }

  try {
    const token = header.split(' ')[1];
    const payload = jwt.verify(token, secret);
    req.user = { id: payload.id, username: payload.username };
    next();
  } catch {
    return res.status(401).json({ error: '令牌无效或已过期' });
  }
};
