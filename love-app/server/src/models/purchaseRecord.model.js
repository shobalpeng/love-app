const db = require('../config/db');

const PurchaseRecord = {
  async create({ productId, buyerId, pointsFrozen }) {
    const [row] = await db('purchase_records')
      .insert({
        product_id: productId,
        buyer_id: buyerId,
        points_frozen: pointsFrozen,
        status: 'frozen'
      })
      .returning('*');
    return row;
  },

  async findById(id) {
    return db('purchase_records').where({ id }).first();
  },

  async findByProductAndBuyer(productId, buyerId) {
    return db('purchase_records')
      .where({ product_id: productId, buyer_id: buyerId })
      .first();
  },

  async updateStatus(id, status) {
    const updateData = { status };
    if (status === 'verified') updateData.verified_at = db.fn.now();
    if (status === 'confirmed') updateData.confirmed_at = db.fn.now();
    return db('purchase_records').where({ id }).update(updateData);
  },

  async findByProductId(productId) {
    return db('purchase_records').where({ product_id: productId });
  }
};

module.exports = PurchaseRecord;
