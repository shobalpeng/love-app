const db = require('../config/db');

module.exports = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const binding = await db('bindings')
      .where(function () {
        this.where('user_id_1', userId).orWhere('user_id_2', userId);
      })
      .where('status', 'active')
      .first();

    if (!binding) {
      return res.status(403).json({ error: '请先绑定伴侣后才能使用此功能' });
    }

    const partnerId = binding.user_id_1 === userId ? binding.user_id_2 : binding.user_id_1;

    req.binding = {
      id: binding.id,
      partnerId,
      boundAt: binding.bound_at
    };

    next();
  } catch (err) {
    next(err);
  }
};
