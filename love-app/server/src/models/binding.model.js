const db = require('../config/db');

const Binding = {
  async findActiveByUserId(userId) {
    return db('bindings')
      .where(function () {
        this.where('user_id_1', userId).orWhere('user_id_2', userId);
      })
      .where('status', 'active')
      .first();
  },

  async create(userId1, userId2) {
    const user1 = Math.min(userId1, userId2);
    const user2 = Math.max(userId1, userId2);
    const [row] = await db('bindings')
      .insert({ user_id_1: user1, user_id_2: user2, status: 'active' })
      .returning('*');
    return row;
  },

  async deactivate(bindingId) {
    return db('bindings')
      .where({ id: bindingId })
      .update({ status: 'inactive', unbound_at: db.fn.now() });
  },

  async reactivate(bindingId) {
    return db('bindings')
      .where({ id: bindingId })
      .update({ status: 'active', unbound_at: null, bound_at: db.fn.now() });
  },

  async findInactiveByUserPair(userId1, userId2) {
    const user1 = Math.min(userId1, userId2);
    const user2 = Math.max(userId1, userId2);
    return db('bindings')
      .where({ user_id_1: user1, user_id_2: user2, status: 'inactive' })
      .first();
  }
};

module.exports = Binding;
