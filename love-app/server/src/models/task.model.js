const db = require('../config/db');

const Task = {
  async create({ publisherId, assignedToId, boundPairId, title, description, imageUrls, points, deadline }) {
    const [row] = await db('tasks')
      .insert({
        publisher_id: publisherId,
        assigned_to_id: assignedToId,
        bound_pair_id: boundPairId,
        title,
        description: description || null,
        image_urls: imageUrls ? JSON.stringify(imageUrls) : null,
        points,
        deadline: deadline || null,
        status: 'pending'
      })
      .returning('*');
    return row;
  },

  async findByUserId(userId, boundPairId, filter, search, status, page = 1, pageSize = 10) {
    const offset = (page - 1) * pageSize;

    let baseQuery = db('tasks')
      .join('users as u1', 'tasks.publisher_id', 'u1.id')
      .join('users as u2', 'tasks.assigned_to_id', 'u2.id')
      .where('tasks.bound_pair_id', boundPairId);

    if (filter === 'published') {
      baseQuery = baseQuery.where('tasks.publisher_id', userId);
    } else if (filter === 'assigned') {
      baseQuery = baseQuery.where('tasks.assigned_to_id', userId);
    } else {
      baseQuery = baseQuery.where(function () {
        this.where('tasks.publisher_id', userId).orWhere('tasks.assigned_to_id', userId);
      });
    }

    if (status) {
      baseQuery = baseQuery.where('tasks.status', status);
    }

    if (search) {
      baseQuery = baseQuery.where('tasks.title', 'ilike', `%${search}%`);
    }

    const [records, [{ count }]] = await Promise.all([
      baseQuery.clone().select('tasks.*', 'u1.username as publisher_name', 'u2.username as assigned_name')
        .orderBy('tasks.created_at', 'desc').limit(pageSize).offset(offset),
      baseQuery.clone().count()
    ]);

    return { records, total: Number(count), page, pageSize };
  },

  async findById(id) {
    return db('tasks')
      .join('users as u1', 'tasks.publisher_id', 'u1.id')
      .join('users as u2', 'tasks.assigned_to_id', 'u2.id')
      .where('tasks.id', id)
      .select('tasks.*', 'u1.username as publisher_name', 'u2.username as assigned_name')
      .first();
  },

  async updateStatus(id, status) {
    return db('tasks').where({ id }).update({ status });
  },

  async update(id, data) {
    const [row] = await db('tasks').where({ id }).update(data).returning('*');
    return row;
  },

  async deleteById(id) {
    return db('tasks').where({ id }).del();
  }
};

module.exports = Task;
