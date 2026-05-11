const recipeModel = require('../models/recipe.model');

const RecipesService = {
  async create({ authorId, boundPairId, name, category, imageUrls, method }) {
    return recipeModel.create({ authorId, boundPairId, name, category, imageUrls, method });
  },

  async getList(boundPairId, query) {
    return recipeModel.findByBoundPairId(boundPairId, query);
  },

  async getDetail(recipeId) {
    const recipe = await recipeModel.findById(recipeId);
    if (!recipe) {
      const err = new Error('菜谱不存在');
      err.status = 404;
      throw err;
    }
    return recipe;
  },

  async update(recipeId, boundPairId, data) {
    const recipe = await recipeModel.findById(recipeId);
    if (!recipe) {
      const err = new Error('菜谱不存在');
      err.status = 404;
      throw err;
    }
    if (recipe.bound_pair_id !== boundPairId) {
      const err = new Error('无权限编辑');
      err.status = 403;
      throw err;
    }
    return recipeModel.update(recipeId, data);
  },

  async delete(recipeId, boundPairId) {
    const recipe = await recipeModel.findById(recipeId);
    if (!recipe) {
      const err = new Error('菜谱不存在');
      err.status = 404;
      throw err;
    }
    if (recipe.bound_pair_id !== boundPairId) {
      const err = new Error('无权限删除');
      err.status = 403;
      throw err;
    }
    return recipeModel.deleteById(recipeId);
  }
};

module.exports = RecipesService;
