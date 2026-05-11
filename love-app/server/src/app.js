require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');

const authRoutes = require('./routes/auth.routes');
const bindingsRoutes = require('./routes/bindings.routes');
const tasksRoutes = require('./routes/tasks.routes');
const productsRoutes = require('./routes/products.routes');
const integralsRoutes = require('./routes/integrals.routes');
const todosRoutes = require('./routes/todos.routes');
const recipesRoutes = require('./routes/recipes.routes');
const notificationsRoutes = require('./routes/notifications.routes');
const anniversariesRoutes = require('./routes/anniversaries.routes');
const uploadRoutes = require('./routes/upload.routes');
const adminRoutes = require('./routes/admin.routes');
const configRoutes = require('./routes/config.routes');
const errorHandler = require('./middleware/errorHandler');
const { startCleanExpiredJob, startAnniversaryReminderJob } = require('./utils/cleanExpired');
const { initAdmin } = require('./utils/initAdmin');

const app = express();

app.use(cors());
app.use(express.json());

const uploadPath = process.env.UPLOAD_PATH || path.resolve(__dirname, '../uploads');
app.use('/uploads', express.static(uploadPath));

app.use('/api/auth', authRoutes);
app.use('/api/bindings', bindingsRoutes);
app.use('/api/tasks', tasksRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/integrals', integralsRoutes);
app.use('/api/todos', todosRoutes);
app.use('/api/recipes', recipesRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/anniversaries', anniversariesRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/config', configRoutes);

app.use(errorHandler);

startCleanExpiredJob();
startAnniversaryReminderJob();
initAdmin();

module.exports = app;
