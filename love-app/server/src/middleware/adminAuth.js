const db = require('../config/db');

module.exports = async (req, res, next) => {
  try {
    const user = await db('users').where({ id: req.user.id }).first();
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ error: '需要管理员权限' });
    }
    next();
  } catch (err) { next(err); }
};
