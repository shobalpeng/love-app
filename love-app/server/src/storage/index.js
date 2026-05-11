const LocalProvider = require('./LocalProvider');

let provider = null;

function getProvider() {
  if (!provider) {
    provider = new LocalProvider(process.env.UPLOAD_PATH);
  }
  return provider;
}

module.exports = getProvider();
