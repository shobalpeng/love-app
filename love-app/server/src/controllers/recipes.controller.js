const recipesService = require('../services/recipes.service');

exports.create = async (req, res, next) => {
  try {
    const { name, category, imageUrls, method } = req.body;
    if (!name || !method) {
      return res.status(400).json({ error: '菜名和制作方法为必填项' });
    }
    const result = await recipesService.create({
      authorId: req.user.id,
      boundPairId: req.binding.id,
      name,
      category,
      imageUrls,
      method
    });
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
};

exports.getList = async (req, res, next) => {
  try {
    const { search, category, page, pageSize } = req.query;
    const result = await recipesService.getList(req.binding.id, { search, category, page: Number(page) || 1, pageSize: Number(pageSize) || 10 });
    res.json(result);
  } catch (err) {
    next(err);
  }
};

exports.getDetail = async (req, res, next) => {
  try {
    const result = await recipesService.getDetail(Number(req.params.id));
    res.json(result);
  } catch (err) {
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    const { name, category, imageUrls, method } = req.body;
    const data = {};
    if (name !== undefined) data.name = name;
    if (category !== undefined) data.category = category;
    if (imageUrls !== undefined) data.image_urls = imageUrls;
    if (method !== undefined) data.method = method;

    await recipesService.update(Number(req.params.id), req.binding.id, data);
    res.json({ status: 'updated' });
  } catch (err) {
    next(err);
  }
};

exports.delete = async (req, res, next) => {
  try {
    await recipesService.delete(Number(req.params.id), req.binding.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};
