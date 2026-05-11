const db = require('../config/db');

const BindRequest = {
  async create(fromUserId, toUserId) {
    const [row] = await db('bind_requests')
      .insert({ from_user_id: fromUserId, to_user_id: toUserId, status: 'pending' })
      .returning('*');
    return row;
  },

  async findPendingByToUser(toUserId) {
    return db('bind_requests')
      .join('users', 'bind_requests.from_user_id', 'users.id')
      .where({ to_user_id: toUserId, status: 'pending' })
      .select('bind_requests.*', 'users.username as from_username');
  },

  async findById(id) {
    return db('bind_requests').where({ id }).first();
  },

  async findPendingBetween(fromUserId, toUserId) {
    return db('bind_requests')
      .where({ from_user_id: fromUserId, to_user_id: toUserId, status: 'pending' })
      .first();
  },

  async updateStatus(id, status) {
    return db('bind_requests').where({ id }).update({ status });
  }
};

module.exports = BindRequest;
