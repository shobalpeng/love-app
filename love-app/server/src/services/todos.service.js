const todoModel = require('../models/todo.model');
const db = require('../config/db');

const TodosService = {
  async create({ creatorId, ownerId, boundPairId, title, visibility }) {
    return todoModel.create({ creatorId, ownerId, boundPairId, title, visibility });
  },

  async getList(userId, partnerId, boundPairId, filter) {
    if (filter === 'private') {
      return todoModel.findByOwnerId(userId, boundPairId, 'private');
    }

    if (filter === 'shared') {
      const todoIds = partnerId ? [userId, partnerId] : [userId];
      return db('todos')
        .where('bound_pair_id', boundPairId)
        .whereIn('owner_id', todoIds)
        .where('visibility', 'shared')
        .orderBy('created_at', 'desc');
    }

    const todoIds = partnerId ? [userId, partnerId] : [userId];
    return db('todos')
      .where(function () {
        this.where('visibility', 'private').andWhere('owner_id', userId).andWhere('bound_pair_id', boundPairId);
      })
      .orWhere(function () {
        this.where('visibility', 'shared').whereIn('owner_id', todoIds).andWhere('bound_pair_id', boundPairId);
      })
      .orderBy('created_at', 'desc');
  },

  async update(userId, partnerId, boundPairId, todoId, data) {
    const todo = await todoModel.findById(todoId);
    if (!todo) {
      const err = new Error('待办不存在');
      err.status = 404;
      throw err;
    }
    if (todo.bound_pair_id && todo.bound_pair_id !== boundPairId) {
      const err = new Error('该待办不属于当前绑定关系');
      err.status = 403;
      throw err;
    }

    const allowedIds = [userId];
    if (partnerId && todo.visibility === 'shared') {
      allowedIds.push(partnerId);
    }
    if (!allowedIds.includes(todo.owner_id)) {
      const err = new Error('无权限编辑此待办');
      err.status = 403;
      throw err;
    }

    return todoModel.update(todoId, data);
  },

  async delete(userId, partnerId, boundPairId, todoId) {
    const todo = await todoModel.findById(todoId);
    if (!todo) {
      const err = new Error('待办不存在');
      err.status = 404;
      throw err;
    }
    if (todo.bound_pair_id && todo.bound_pair_id !== boundPairId) {
      const err = new Error('该待办不属于当前绑定关系');
      err.status = 403;
      throw err;
    }

    const allowedIds = [userId];
    if (partnerId && todo.visibility === 'shared') {
      allowedIds.push(partnerId);
    }
    if (!allowedIds.includes(todo.owner_id)) {
      const err = new Error('无权限删除此待办');
      err.status = 403;
      throw err;
    }

    return todoModel.deleteById(todoId);
  }
};

module.exports = TodosService;
