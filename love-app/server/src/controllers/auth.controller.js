const authService = require('../services/auth.service');

exports.register = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: '用户名和密码为必填项' });
    }
    if (username.length < 2 || username.length > 20) {
      return res.status(400).json({ error: '用户名长度需在2-20个字符之间' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: '密码长度不能少于6位' });
    }
    const result = await authService.register(username.trim(), password);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: '用户名和密码为必填项' });
    }
    const result = await authService.login(username.trim(), password);
    res.json(result);
  } catch (err) {
    next(err);
  }
};
