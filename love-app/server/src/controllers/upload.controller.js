const path = require('path');
const uploadService = require('../services/upload.service');

exports.uploadImage = async (req, res, next) => {
  try {
    const result = uploadService.uploadImage(req.file);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
};

exports.serveFile = (req, res) => {
  const { filename } = req.params;
  const dir = process.env.UPLOAD_PATH || path.resolve(__dirname, '../../uploads');
  res.sendFile(path.join(dir, filename));
};
