const db = require('../config/db');

const User = {
  async findByUsername(username) {
    return db('users').where({ username }).first();
  },

  async findById(id) {
    return db('users').where({ id }).first();
  },

  async create(username, passwordHash) {
    const [row] = await db('users')
      .insert({ username, password_hash: passwordHash })
      .returning(['id', 'username', 'avatar_url', 'created_at']);
    return row;
  }
};

module.exports = User;
