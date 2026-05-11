const { Router } = require('express');
const auth = require('../middleware/auth');
const ctrl = require('../controllers/bindings.controller');

const router = Router();

router.use(auth);

router.post('/request', ctrl.sendRequest);
router.get('/requests', ctrl.getRequests);
router.post('/requests/:id/accept', ctrl.acceptRequest);
router.post('/requests/:id/reject', ctrl.rejectRequest);
router.delete('/', ctrl.unbind);
router.get('/status', ctrl.getStatus);

module.exports = router;
