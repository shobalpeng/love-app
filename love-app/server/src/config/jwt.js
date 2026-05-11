module.exports = {
  secret: process.env.JWT_SECRET || 'dev-secret-change-in-production',
  expiresIn: '7d'
};
