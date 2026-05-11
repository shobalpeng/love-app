const router = require('express').Router();
const auth = require('../middleware/auth');
const requireBinding = require('../middleware/requireBinding');
const ctrl = require('../controllers/anniversaries.controller');

router.use(auth);
router.use(requireBinding);
router.post('/', ctrl.create);
router.get('/', ctrl.getList);
router.delete('/:id', ctrl.delete);
router.post('/:id/pin', ctrl.togglePin);

module.exports = router;
