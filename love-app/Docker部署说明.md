# Docker 部署说明

## 环境要求

- Docker Desktop 或 Docker Engine 20+
- 确保端口 `80`、`3000`、`5432` 未被占用（可在 `.env` 中修改）

---

## 一、快速部署

**1. 创建 `.env` 文件**（在项目根目录）：

```env
# 端口
CLIENT_PORT=80
SERVER_PORT=3000
DB_PORT=5432

# 数据库
DB_NAME=love_app
DB_USER=love_user
DB_PASSWORD=请修改为安全密码

# JWT 密钥（请修改为随机字符串）
JWT_SECRET=请修改为随机字符串

# 管理员（可选）
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123

# 上传路径
UPLOAD_PATH=./uploads
```

**2. 启动**：

```bash
cd love-app
docker compose up -d
```

**3. 访问**：`http://<服务器IP>`

---

## 二、服务架构

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Nginx     │────▶│  Express    │────▶│ PostgreSQL  │
│  (前端 :80) │     │ (后端 :3000)│     │   (:5432)   │
└─────────────┘     └─────────────┘     └─────────────┘
```

- **前端**：Vue 3 静态文件 + Nginx 反向代理 `/api/` 到后端
- **后端**：Node.js + Express，端口 3000
- **数据库**：PostgreSQL 16，数据持久化在 Docker Volume `pg_data`
- **上传文件**：持久化在 Docker Volume `uploads`

---

## 三、常用命令

| 操作 | 命令 |
|------|------|
| 启动 | `docker compose up -d` |
| 停止 | `docker compose down` |
| 重启 | `docker compose restart` |
| 查看日志 | `docker compose logs -f` |
| 查看某服务日志 | `docker compose logs -f server` |
| 重新构建并启动 | `docker compose up -d --build` |
| 停止并删除所有数据 | `docker compose down -v` |

---

## 四、数据备份

```bash
# 备份数据库
docker compose exec database pg_dump -U love_user love_app > backup.sql

# 恢复数据库
docker compose exec -T database psql -U love_user love_app < backup.sql

# 备份上传文件
docker compose cp server:/app/uploads ./uploads_backup
```

---

## 五、更新部署

```bash
# 拉取最新代码后
docker compose down
docker compose up -d --build
```

数据库结构有变化时，需手动执行迁移 SQL 或重建数据库。

---

## 六、部署注意事项

### 数据库密码字符限制
`DB_PASSWORD` 和 `JWT_SECRET` **只能使用字母和数字**（`A-Z a-z 0-9`）。不要使用 `@` `:` `/` `#` `$` `%` 等特殊字符，否则数据库连接 URL 会解析失败。

### 修改环境变量后
修改 `.env` 中的数据库相关变量（DB_NAME/DB_USER/DB_PASSWORD）后，**必须删除旧数据卷重建**，否则新的配置不会生效：

```bash
docker compose down -v
docker compose up -d --build
```

### 数据库结构变更
如果服务端代码新增了数据库表或字段，必须同步更新 `database/schema.sql`，然后用 `down -v` 重建：

```bash
docker compose down -v
docker compose up -d --build
```

### 端口冲突
确保 `.env` 中的三个端口不被其他服务占用。群晖等 NAS 设备通常已占用 80/443/5000/5001 等端口，建议改用高位端口。

### 排查 500 错误
1. 查看后端日志：`docker logs love-server`
2. 常见原因：数据库连接失败（密码错误/特殊字符）、数据库表缺失（schema.sql 未更新）
3. 确认容器都在运行：`docker compose ps`

---

## 七、环境变量说明

| 变量 | 说明 | 默认值 |
|------|------|--------|
| CLIENT_PORT | 前端端口 | 80 |
| SERVER_PORT | 后端端口 | 3000 |
| DB_PORT | 数据库端口 | 5432 |
| DB_NAME | 数据库名 | love_app |
| DB_USER | 数据库用户 | love_user |
| DB_PASSWORD | 数据库密码 | **必须修改** |
| JWT_SECRET | JWT 签名密钥 | **必须修改** |
| ADMIN_USERNAME | 管理员用户名 | 不设则不创建 |
| ADMIN_PASSWORD | 管理员密码 | 不设则不创建 |

---

## 八、故障排查

**容器启动失败**

```bash
docker compose logs  # 查看所有日志
docker compose ps    # 查看容器状态
```

**数据库连接失败**

检查 `DATABASE_URL` 环境变量是否正确，确保数据库容器已启动：

```bash
docker compose logs database
```

**端口被占用**

修改 `.env` 中的端口号，重启即可。
