const db = require('../config/db');

const Anniversary = {
  async create({ name, date, boundPairId }) {
    const [row] = await db('anniversaries')
      .insert({ name, date, bound_pair_id: boundPairId })
      .returning('*');
    return row;
  },

  async findByBoundPairId(boundPairId) {
    return db('anniversaries')
      .where('bound_pair_id', boundPairId)
      .orderBy('date', 'asc');
  },

  async findById(id) {
    return db('anniversaries').where({ id }).first();
  },

  async deleteById(id) {
    return db('anniversaries').where({ id }).del();
  },

  async updatePin(id, isPinned) {
    const [row] = await db('anniversaries').where({ id }).update({ is_pinned: isPinned }).returning('*');
    return row;
  },

  // 获取所有纪念日（用于提醒任务，跨所有绑定对）
  async findAll() {
    return db('anniversaries').orderBy('date', 'asc');
  }
};

module.exports = Anniversary;
