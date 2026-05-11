const todosService = require('../services/todos.service');

exports.create = async (req, res, next) => {
  try {
    const { title, visibility } = req.body;
    if (!title) {
      return res.status(400).json({ error: '标题为必填项' });
    }
    if (visibility && !['private', 'shared'].includes(visibility)) {
      return res.status(400).json({ error: '可见性只能为 private 或 shared' });
    }
    const result = await todosService.create({
      creatorId: req.user.id,
      ownerId: req.user.id,
      boundPairId: req.binding.id,
      title,
      visibility: visibility || 'private'
    });
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
};

exports.getList = async (req, res, next) => {
  try {
    const { filter } = req.query;
    const partnerId = req.binding ? req.binding.partnerId : null;
    const boundPairId = req.binding ? req.binding.id : null;
    const result = await todosService.getList(req.user.id, partnerId, boundPairId, filter);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    const todoId = Number(req.params.id);
    const partnerId = req.binding ? req.binding.partnerId : null;
    const boundPairId = req.binding ? req.binding.id : null;
    const { title, is_completed, visibility } = req.body;
    const data = {};
    if (title !== undefined) data.title = title;
    if (is_completed !== undefined) data.is_completed = is_completed;
    if (visibility !== undefined) data.visibility = visibility;

    const result = await todosService.update(req.user.id, partnerId, boundPairId, todoId, data);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

exports.delete = async (req, res, next) => {
  try {
    const todoId = Number(req.params.id);
    const partnerId = req.binding ? req.binding.partnerId : null;
    const boundPairId = req.binding ? req.binding.id : null;
    await todosService.delete(req.user.id, partnerId, boundPairId, todoId);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};
