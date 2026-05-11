const db = require('../config/db');

const IntegralRecord = {
  async create({ userId, amount, type, referenceId, balanceAfter, description }) {
    const [row] = await db('integral_records')
      .insert({
        user_id: userId,
        amount,
        type,
        reference_id: referenceId || null,
        balance_after: balanceAfter,
        description: description || null
      })
      .returning('*');
    return row;
  },

  async getBalance(userId) {
    const row = await db('integral_records')
      .where({ user_id: userId })
      .orderBy('id', 'desc')
      .select('balance_after')
      .first();
    return row ? Number(row.balance_after) : 0;
  },

  async findByUserId(userId, page = 1, pageSize = 20) {
    const offset = (page - 1) * pageSize;
    const [records, [{ count }]] = await Promise.all([
      db('integral_records')
        .where({ user_id: userId })
        .orderBy('created_at', 'desc')
        .limit(pageSize)
        .offset(offset),
      db('integral_records')
        .where({ user_id: userId })
        .count()
    ]);
    return { records, total: Number(count), page, pageSize };
  }
};

module.exports = IntegralRecord;
