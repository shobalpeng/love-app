const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const userModel = require('../models/user.model');
const { secret, expiresIn } = require('../config/jwt');

const AuthService = {
  async register(username, password) {
    const existing = await userModel.findByUsername(username);
    if (existing) {
      const err = new Error('用户名已存在');
      err.status = 409;
      throw err;
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await userModel.create(username, passwordHash);

    const token = jwt.sign({ id: user.id, username: user.username }, secret, { expiresIn });

    return { user: { id: user.id, username: user.username, role: user.role || 'user' }, token };
  },

  async login(username, password) {
    const user = await userModel.findByUsername(username);
    if (!user) {
      const err = new Error('用户名或密码错误');
      err.status = 401;
      throw err;
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      const err = new Error('用户名或密码错误');
      err.status = 401;
      throw err;
    }

    const token = jwt.sign({ id: user.id, username: user.username }, secret, { expiresIn });

    return { user: { id: user.id, username: user.username, role: user.role || 'user', avatar_url: user.avatar_url }, token };
  }
};

module.exports = AuthService;
