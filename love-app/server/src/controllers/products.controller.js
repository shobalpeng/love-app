const productsService = require('../services/products.service');

exports.create = async (req, res, next) => {
  try {
    const { name, description, imageUrls, price, deadline } = req.body;
    if (!name || !price) {
      return res.status(400).json({ error: '名称和所需积分为必填项' });
    }
    if (!Number.isInteger(price) || price <= 0) {
      return res.status(400).json({ error: '价格必须为正整数' });
    }
    const result = await productsService.create({
      publisherId: req.user.id,
      boundPairId: req.binding.id,
      name,
      description,
      imageUrls,
      price,
      deadline
    });
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
};

exports.getList = async (req, res, next) => {
  try {
    const { search, status, page, pageSize } = req.query;
    const result = await productsService.getList(req.binding.id, search, status, Number(page) || 1, Number(pageSize) || 10);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

exports.getDetail = async (req, res, next) => {
  try {
    const result = await productsService.getDetail(Number(req.params.id), req.user.id);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

exports.purchase = async (req, res, next) => {
  try {
    const result = await productsService.purchase({
      productId: Number(req.params.id),
      buyerId: req.user.id
    });
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
};

exports.verify = async (req, res, next) => {
  try {
    const result = await productsService.verify({
      productId: Number(req.params.id),
      publisherId: req.user.id
    });
    res.json(result);
  } catch (err) {
    next(err);
  }
};

exports.confirm = async (req, res, next) => {
  try {
    const result = await productsService.confirm({
      productId: Number(req.params.id),
      buyerId: req.user.id
    });
    res.json(result);
  } catch (err) {
    next(err);
  }
};

exports.extend = async (req, res, next) => {
  try {
    const { new_deadline } = req.body;
    if (!new_deadline) {
      return res.status(400).json({ error: '请提供新的截止时间' });
    }
    const result = await productsService.extend({
      productId: Number(req.params.id),
      publisherId: req.user.id,
      newDeadline: new_deadline
    });
    res.json(result);
  } catch (err) {
    next(err);
  }
};

exports.expire = async (req, res, next) => {
  try {
    const result = await productsService.expire({
      productId: Number(req.params.id),
      publisherId: req.user.id
    });
    res.json(result);
  } catch (err) {
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    const { name, description, imageUrls, price, deadline } = req.body;
    if (!name || !price) { return res.status(400).json({ error: '名称和所需积分为必填项' }); }
    const result = await productsService.update({
      productId: Number(req.params.id), publisherId: req.user.id,
      name, description, imageUrls, price, deadline
    });
    res.json(result);
  } catch (err) { next(err); }
};

exports.delete = async (req, res, next) => {
  try {
    await productsService.delete({ productId: Number(req.params.id), publisherId: req.user.id });
    res.status(204).send();
  } catch (err) { next(err); }
};
