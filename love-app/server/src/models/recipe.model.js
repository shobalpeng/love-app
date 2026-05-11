const db = require('../config/db');

const Recipe = {
  async create({ authorId, boundPairId, name, category, imageUrls, method }) {
    const [row] = await db('recipes')
      .insert({
        author_id: authorId,
        bound_pair_id: boundPairId,
        name,
        category: category || null,
        image_urls: imageUrls ? JSON.stringify(imageUrls) : null,
        method
      })
      .returning('*');
    return row;
  },

  async findByBoundPairId(boundPairId, { search, category, page = 1, pageSize = 10 } = {}) {
    const offset = (page - 1) * pageSize;
    let baseQuery = db('recipes')
      .join('users', 'recipes.author_id', 'users.id')
      .where('recipes.bound_pair_id', boundPairId);

    if (search) {
      baseQuery = baseQuery.where('recipes.name', 'ilike', `%${search}%`);
    }
    if (category) {
      baseQuery = baseQuery.where('recipes.category', category);
    }

    const [records, [{ count }]] = await Promise.all([
      baseQuery.clone().select('recipes.*', 'users.username as author_name')
        .orderBy('recipes.updated_at', 'desc').limit(pageSize).offset(offset),
      baseQuery.clone().count()
    ]);

    return { records, total: Number(count), page, pageSize };
  },

  async findById(id) {
    return db('recipes')
      .join('users', 'recipes.author_id', 'users.id')
      .where('recipes.id', id)
      .select('recipes.*', 'users.username as author_name')
      .first();
  },

  async update(id, data) {
    const updateData = { ...data, updated_at: db.fn.now() };
    if (updateData.image_urls && Array.isArray(updateData.image_urls)) {
      updateData.image_urls = JSON.stringify(updateData.image_urls);
    }
    return db('recipes').where({ id }).update(updateData);
  },

  async deleteById(id) {
    return db('recipes').where({ id }).del();
  }
};

module.exports = Recipe;
