const bcrypt = require('bcrypt');
const db = require('../config/db');

async function initAdmin() {
  const username = process.env.ADMIN_USERNAME;
  const password = process.env.ADMIN_PASSWORD;

  if (!username || !password) {
    console.log('[INIT] ADMIN_USERNAME or ADMIN_PASSWORD not set, skipping admin init');
    return;
  }

  try {
    // 确保 role 列存在（兼容旧数据库）
    await db.raw("ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'user'");
    const existing = await db('users').where({ username }).first();
    if (!existing) {
      const hash = await bcrypt.hash(password, 10);
      await db('users').insert({ username, password_hash: hash, role: 'admin' });
      console.log(`[INIT] Admin account created: ${username}`);
    } else {
      await db('users').where({ username }).update({ role: 'admin' });
      console.log(`[INIT] Admin account updated: ${username}`);
    }
  } catch (err) {
    console.error('[INIT] Admin init failed:', err.message);
  }
}

module.exports = { initAdmin };
