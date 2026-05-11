# 情侣互动 Web 应用

## 快速开始

```bash
# 1. 复制环境变量模板并编辑
cp .env.example .env

# 2. 开发模式启动（热重载）
docker compose -f docker-compose.dev.yml up --build

# 3. 访问 http://localhost:80
```

## 生产部署

```bash
docker compose up -d --build
```

## 技术栈

- 前端：Vue 3 + Vite + Pinia + Vue Router
- 后端：Node.js + Express + Knex.js
- 数据库：PostgreSQL 16
- 部署：Docker + Docker Compose

## 环境变量

| 变量 | 说明 | 默认值 |
|------|------|--------|
| CLIENT_PORT | 前端端口 | 80 |
| SERVER_PORT | 后端端口 | 3000 |
| DB_PORT | 数据库端口 | 5432 |
| DB_NAME | 数据库名 | love_app |
| DB_USER | 数据库用户 | love_user |
| DB_PASSWORD | 数据库密码 | - |
| JWT_SECRET | JWT 密钥 | - |
| UPLOAD_PATH | 上传路径 | ./uploads |
