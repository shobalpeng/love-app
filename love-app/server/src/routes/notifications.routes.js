const { Router } = require('express');
const auth = require('../middleware/auth');
const ctrl = require('../controllers/notifications.controller');

const router = Router();

router.use(auth);

router.get('/', ctrl.getList);
router.get('/unread-count', ctrl.getUnreadCount);
router.post('/:id/read', ctrl.markRead);
router.post('/read-all', ctrl.markAllRead);

module.exports = router;
