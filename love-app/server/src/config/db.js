const knex = require('knex');
const path = require('path');

const db = knex({
  client: 'pg',
  connection: process.env.DATABASE_URL || 'postgresql://love_user:love_pass@localhost:5432/love_app',
  migrations: {
    tableName: 'knex_migrations',
    directory: path.resolve(__dirname, '../../migrations')
  },
  pool: { min: 2, max: 10 }
});

module.exports = db;
