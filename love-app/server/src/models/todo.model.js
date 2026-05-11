const db = require('../config/db');

const Todo = {
  async create({ creatorId, ownerId, boundPairId, title, visibility }) {
    const [row] = await db('todos')
      .insert({
        creator_id: creatorId,
        owner_id: ownerId,
        bound_pair_id: boundPairId,
        title,
        visibility: visibility || 'private'
      })
      .returning('*');
    return row;
  },

  async findByOwnerId(ownerId, boundPairId, visibility) {
    let query = db('todos').where({ owner_id: ownerId }).where('bound_pair_id', boundPairId);
    if (visibility) {
      query = query.where({ visibility });
    }
    return query.orderBy('created_at', 'desc');
  },

  async findById(id) {
    return db('todos').where({ id }).first();
  },

  async update(id, data) {
    return db('todos').where({ id }).update(data);
  },

  async deleteById(id) {
    return db('todos').where({ id }).del();
  }
};

module.exports = Todo;
