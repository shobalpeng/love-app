const storageProvider = require('../storage');
const upload = require('../config/upload');

const UploadService = {
  uploadImage(file) {
    if (!file) {
      const err = new Error('请选择文件');
      err.status = 400;
      throw err;
    }
    return {
      filename: file.filename,
      url: storageProvider.getUrl(file.filename)
    };
  }
};

module.exports = UploadService;
