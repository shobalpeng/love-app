const { Router } = require('express');
const auth = require('../middleware/auth');
const requireBinding = require('../middleware/requireBinding');
const ctrl = require('../controllers/integrals.controller');

const router = Router();

router.use(auth);

router.get('/', ctrl.getBalance);
router.get('/partner', requireBinding, ctrl.getPartnerBalance);
router.get('/records', ctrl.getRecords);

module.exports = router;
