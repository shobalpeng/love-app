const notificationModel = require('../models/notification.model');

const NotificationService = {
  async create({ userId, type, title, content, referenceType, referenceId }) {
    return notificationModel.create({ userId, type, title, content, referenceType, referenceId });
  },

  async getList(userId, page, pageSize) {
    return notificationModel.findByUserId(userId, page, pageSize);
  },

  async getUnreadCount(userId) {
    return notificationModel.getUnreadCount(userId);
  },

  async markRead(id, userId) {
    return notificationModel.markRead(id, userId);
  },

  async markAllRead(userId) {
    return notificationModel.markAllRead(userId);
  }
};

module.exports = NotificationService;
