const db = require('../config/db');

const Product = {
  async create({ publisherId, boundPairId, name, description, imageUrls, price, deadline }) {
    const [row] = await db('products')
      .insert({
        publisher_id: publisherId,
        bound_pair_id: boundPairId,
        name,
        description: description || null,
        image_urls: imageUrls ? JSON.stringify(imageUrls) : null,
        price,
        deadline,
        status: 'available'
      })
      .returning('*');
    return row;
  },

  async findAll(boundPairId, search, status, page = 1, pageSize = 10) {
    const offset = (page - 1) * pageSize;
    let baseQuery = db('products')
      .join('users', 'products.publisher_id', 'users.id')
      .where('products.bound_pair_id', boundPairId);

    if (search) {
      baseQuery = baseQuery.where('products.name', 'ilike', `%${search}%`);
    }
    if (status) {
      baseQuery = baseQuery.where('products.status', status);
    }

    const [records, [{ count }]] = await Promise.all([
      baseQuery.clone().select('products.*', 'users.username as publisher_name')
        .orderBy('products.created_at', 'desc').limit(pageSize).offset(offset),
      baseQuery.clone().count()
    ]);

    return { records, total: Number(count), page, pageSize };
  },

  async findById(id) {
    return db('products')
      .join('users', 'products.publisher_id', 'users.id')
      .where('products.id', id)
      .select('products.*', 'users.username as publisher_name')
      .first();
  },

  async updateStatus(id, status) {
    return db('products').where({ id }).update({ status });
  },

  async update(id, data) {
    const [row] = await db('products').where({ id }).update(data).returning('*');
    return row;
  },

  async deleteById(id) {
    return db('products').where({ id }).del();
  },

  async findExpired() {
    return db('products')
      .where('status', 'available')
      .where('deadline', '<', db.fn.now());
  }
};

module.exports = Product;
