const anniversariesService = require('../services/anniversaries.service');

exports.create = async (req, res, next) => {
  try {
    const { name, date } = req.body;
    if (!name || !date) {
      return res.status(400).json({ error: '名称和日期为必填项' });
    }
    const result = await anniversariesService.create({
      name,
      date,
      boundPairId: req.binding.id
    });
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
};

exports.getList = async (req, res, next) => {
  try {
    const result = await anniversariesService.getList(req.binding.id);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

exports.delete = async (req, res, next) => {
  try {
    await anniversariesService.delete({
      id: Number(req.params.id),
      boundPairId: req.binding.id
    });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};

exports.togglePin = async (req, res, next) => {
  try {
    const result = await anniversariesService.togglePin({
      id: Number(req.params.id),
      boundPairId: req.binding.id
    });
    res.json(result);
  } catch (err) {
    next(err);
  }
};
