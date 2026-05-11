const bindingsService = require('../services/bindings.service');

exports.sendRequest = async (req, res, next) => {
  try {
    const { to_username } = req.body;
    if (!to_username) {
      return res.status(400).json({ error: '请输入要绑定的用户名' });
    }
    const result = await bindingsService.sendRequest(req.user.id, to_username);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
};

exports.getRequests = async (req, res, next) => {
  try {
    const result = await bindingsService.getRequests(req.user.id);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

exports.acceptRequest = async (req, res, next) => {
  try {
    const result = await bindingsService.acceptRequest(req.user.id, Number(req.params.id));
    res.json(result);
  } catch (err) {
    next(err);
  }
};

exports.rejectRequest = async (req, res, next) => {
  try {
    const result = await bindingsService.rejectRequest(req.user.id, Number(req.params.id));
    res.json(result);
  } catch (err) {
    next(err);
  }
};

exports.unbind = async (req, res, next) => {
  try {
    const result = await bindingsService.unbind(req.user.id);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

exports.getStatus = async (req, res, next) => {
  try {
    const result = await bindingsService.getStatus(req.user.id);
    res.json(result);
  } catch (err) {
    next(err);
  }
};
