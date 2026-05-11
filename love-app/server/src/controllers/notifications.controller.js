const notificationService = require('../services/notifications.service');

exports.getList = async (req, res, next) => {
  try {
    const page = Math.max(Number(req.query.page) || 1, 1);
    const pageSize = Math.min(Math.max(Number(req.query.pageSize) || 20, 1), 100);
    const result = await notificationService.getList(req.user.id, page, pageSize);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

exports.getUnreadCount = async (req, res, next) => {
  try {
    const count = await notificationService.getUnreadCount(req.user.id);
    res.json({ count });
  } catch (err) {
    next(err);
  }
};

exports.markRead = async (req, res, next) => {
  try {
    await notificationService.markRead(Number(req.params.id), req.user.id);
    res.json({ status: 'ok' });
  } catch (err) {
    next(err);
  }
};

exports.markAllRead = async (req, res, next) => {
  try {
    await notificationService.markAllRead(req.user.id);
    res.json({ status: 'ok' });
  } catch (err) {
    next(err);
  }
};
