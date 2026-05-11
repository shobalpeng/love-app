const router = require('express').Router();
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');
const db = require('../config/db');

router.use(auth);
router.use(adminAuth);

// 不可手动设置的列
const AUTO_COLS = new Set(['id', 'created_at', 'updated_at', 'bound_at', 'unbound_at', 'frozen_at', 'verified_at', 'confirmed_at', 'submitted_at', 'reviewed_at', 'password_hash']);

function cleanBody(body) {
  const cleaned = {};
  for (const [k, v] of Object.entries(body)) {
    if (!AUTO_COLS.has(k) && v !== undefined) cleaned[k] = v;
  }
  return cleaned;
}

// 通用 CRUD 辅助
function crud(table) {
  router.get(`/${table}`, async (req, res, next) => {
    try {
      const page = Math.max(Number(req.query.page) || 1, 1);
      const pageSize = Math.min(Number(req.query.pageSize) || 50, 200);
      const offset = (page - 1) * pageSize;
      const [rows, [{ count }]] = await Promise.all([
        db(table).orderBy('id', 'desc').limit(pageSize).offset(offset),
        db(table).count()
      ]);
      res.json({ records: rows, total: Number(count) });
    } catch (err) { next(err); }
  });

  router.get(`/${table}/:id`, async (req, res, next) => {
    try {
      const row = await db(table).where({ id: req.params.id }).first();
      if (!row) return res.status(404).json({ error: '不存在' });
      res.json(row);
    } catch (err) { next(err); }
  });

  router.post(`/${table}`, async (req, res, next) => {
    try {
      const data = cleanBody(req.body);
      if (table === 'users' && data.password) {
        data.password_hash = require('bcrypt').hashSync(data.password, 10);
        delete data.password;
      }
      const [row] = await db(table).insert(data).returning('*');
      res.status(201).json(row);
    } catch (err) { next(err); }
  });

  router.put(`/${table}/:id`, async (req, res, next) => {
    try {
      const data = cleanBody(req.body);
      if (table === 'users' && data.password) {
        data.password_hash = require('bcrypt').hashSync(data.password, 10);
        delete data.password;
      }
      const [row] = await db(table).where({ id: req.params.id }).update(data).returning('*');
      if (!row) return res.status(404).json({ error: '不存在' });
      res.json(row);
    } catch (err) { next(err); }
  });

  router.delete(`/${table}/:id`, async (req, res, next) => {
    try {
      await db(table).where({ id: req.params.id }).del();
      res.status(204).send();
    } catch (err) { next(err); }
  });
}

// 所有表
crud('users');
crud('tasks');
crud('products');
crud('todos');
crud('recipes');
crud('bindings');
crud('purchase_records');
crud('integral_records');
crud('notifications');
crud('anniversaries');

// 统计
router.get('/stats/overview', async (req, res, next) => {
  try {
    const tables = ['users','tasks','products','todos','recipes','bindings','purchase_records','integral_records','notifications','anniversaries'];
    const results = {};
    for (const t of tables) {
      const [{ count }] = await db(t).count();
      results[t] = Number(count);
    }
    res.json(results);
  } catch (err) { next(err); }
});

// 绑定详情（含用户名）
router.get('/bindings', async (req, res, next) => {
  try {
    const rows = await db('bindings')
      .join('users as u1', 'bindings.user_id_1', 'u1.id')
      .join('users as u2', 'bindings.user_id_2', 'u2.id')
      .select('bindings.*', 'u1.username as user1', 'u2.username as user2')
      .orderBy('bindings.id', 'desc');
    res.json({ records: rows, total: rows.length });
  } catch (err) { next(err); }
});

module.exports = router;
