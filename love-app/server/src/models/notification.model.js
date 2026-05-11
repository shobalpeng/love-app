const db = require('../config/db');

const Notification = {
  async create({ userId, type, title, content, referenceType, referenceId }) {
    const [row] = await db('notifications')
      .insert({
        user_id: userId,
        type,
        title,
        content: content || null,
        reference_type: referenceType || null,
        reference_id: referenceId || null
      })
      .returning('*');
    return row;
  },

  async findByUserId(userId, page = 1, pageSize = 20) {
    const offset = (page - 1) * pageSize;
    const [records, [{ count }]] = await Promise.all([
      db('notifications')
        .where({ user_id: userId })
        .orderBy('created_at', 'desc')
        .limit(pageSize)
        .offset(offset),
      db('notifications')
        .where({ user_id: userId })
        .count()
    ]);
    return { records, total: Number(count), page, pageSize };
  },

  async getUnreadCount(userId) {
    const [{ count }] = await db('notifications')
      .where({ user_id: userId, is_read: false })
      .count();
    return Number(count);
  },

  async markRead(id, userId) {
    return db('notifications').where({ id, user_id: userId }).update({ is_read: true });
  },

  async markAllRead(userId) {
    return db('notifications').where({ user_id: userId, is_read: false }).update({ is_read: true });
  }
};

module.exports = Notification;
