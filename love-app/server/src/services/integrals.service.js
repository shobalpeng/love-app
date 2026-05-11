const integralRecordModel = require('../models/integralRecord.model');
const db = require('../config/db');

const IntegralsService = {
  async getBalance(userId) {
    const balance = await integralRecordModel.getBalance(userId);

    const rows = await db('purchase_records')
      .where({ buyer_id: userId })
      .whereIn('status', ['frozen', 'verified'])
      .sum('points_frozen as total')
      .first();
    const frozen = Number(rows.total) || 0;

    // 已获得（正数求和）和已消费（负数求和）
    const sums = await db('integral_records')
      .where({ user_id: userId })
      .select(
        db.raw("COALESCE(SUM(CASE WHEN amount > 0 THEN amount ELSE 0 END), 0) as earned"),
        db.raw("COALESCE(SUM(CASE WHEN amount < 0 THEN -amount ELSE 0 END), 0) as spent")
      )
      .first();

    return {
      balance,
      frozen,
      available: balance - frozen,
      earned: Number(sums.earned),
      spent: Number(sums.spent)
    };
  },

  async getRecords(userId, page, pageSize) {
    return integralRecordModel.findByUserId(userId, page, pageSize);
  }
};

module.exports = IntegralsService;
