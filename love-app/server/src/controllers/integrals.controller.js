const integralsService = require('../services/integrals.service');

exports.getBalance = async (req, res, next) => {
  try {
    const result = await integralsService.getBalance(req.user.id);
    res.json(result);
  } catch (err) { next(err); }
};

exports.getPartnerBalance = async (req, res, next) => {
  try {
    const result = await integralsService.getBalance(req.binding.partnerId);
    res.json(result);
  } catch (err) { next(err); }
};

exports.getRecords = async (req, res, next) => {
  try {
    const page = Math.max(Number(req.query.page) || 1, 1);
    const pageSize = Math.min(Math.max(Number(req.query.pageSize) || 20, 1), 100);
    const result = await integralsService.getRecords(req.user.id, page, pageSize);
    res.json(result);
  } catch (err) { next(err); }
};
