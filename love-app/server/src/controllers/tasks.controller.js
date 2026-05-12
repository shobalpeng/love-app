const tasksService = require('../services/tasks.service');

exports.create = async (req, res, next) => {
  try {
    const { title, description, imageUrls, points, deadline } = req.body;
    if (!title || !points) {
      return res.status(400).json({ error: '标题和积分奖励为必填项' });
    }
    if (!Number.isInteger(points) || points <= 0) {
      return res.status(400).json({ error: '积分必须为正整数' });
    }
    const result = await tasksService.create({
      publisherId: req.user.id,
      assignedToId: req.binding.partnerId,
      boundPairId: req.binding.id,
      title,
      description,
      imageUrls,
      points,
      deadline
    });
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
};

exports.getList = async (req, res, next) => {
  try {
    const { filter, search, status, page, pageSize } = req.query;
    const result = await tasksService.getList(req.user.id, req.binding.id, filter, search, status, Number(page) || 1, Number(pageSize) || 10);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

exports.getDetail = async (req, res, next) => {
  try {
    const result = await tasksService.getDetail(Number(req.params.id));
    res.json(result);
  } catch (err) {
    next(err);
  }
};

exports.submit = async (req, res, next) => {
  try {
    const { content, imageUrls } = req.body;
    const result = await tasksService.submit({
      taskId: Number(req.params.id),
      submitterId: req.user.id,
      content,
      imageUrls
    });
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
};

exports.review = async (req, res, next) => {
  try {
    const { status, comment } = req.body;
    if (!status || !['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ error: '审核状态必须为 approved 或 rejected' });
    }
    const result = await tasksService.review({
      taskId: Number(req.params.id),
      reviewerId: req.user.id,
      status,
      comment
    });
    res.json(result);
  } catch (err) {
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    const { title, description, points, deadline } = req.body;
    if (!title || !points) {
      return res.status(400).json({ error: '标题和积分奖励为必填项' });
    }
    const result = await tasksService.update({
      taskId: Number(req.params.id),
      publisherId: req.user.id,
      title, description, points, deadline
    });
    res.json(result);
  } catch (err) { next(err); }
};

exports.delete = async (req, res, next) => {
  try {
    await tasksService.delete({
      taskId: Number(req.params.id),
      publisherId: req.user.id
    });
    res.status(204).send();
  } catch (err) { next(err); }
};
