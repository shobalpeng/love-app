/**
 * 存储接口定义。
 * 后续新增 S3Provider / OSSProvider / WebDAVProvider 需实现此接口：
 *   - upload(file) → { filename, url }
 *   - delete(filename) → void
 *   - getUrl(filename) → string
 */
class IStorageProvider {
  upload(_file) { throw new Error('未实现'); }
  delete(_filename) { throw new Error('未实现'); }
  getUrl(_filename) { throw new Error('未实现'); }
}

module.exports = IStorageProvider;
