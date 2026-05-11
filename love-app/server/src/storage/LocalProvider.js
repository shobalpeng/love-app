const path = require('path');
const fs = require('fs');
const IStorageProvider = require('./IStorageProvider');

class LocalProvider extends IStorageProvider {
  constructor(basePath) {
    super();
    this.basePath = basePath || path.resolve(__dirname, '../../uploads');
  }

  upload(file) {
    return {
      filename: file.filename,
      url: this.getUrl(file.filename)
    };
  }

  delete(filename) {
    const filePath = path.join(this.basePath, filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }

  getUrl(filename) {
    return `/api/upload/${filename}`;
  }
}

module.exports = LocalProvider;
