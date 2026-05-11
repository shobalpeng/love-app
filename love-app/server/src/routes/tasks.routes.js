const { Router } = require('express');
const auth = require('../middleware/auth');
const requireBinding = require('../middleware/requireBinding');
const ctrl = require('../controllers/tasks.controller');

const router = Router();

router.use(auth);
router.use(requireBinding);

router.post('/', ctrl.create);
router.get('/', ctrl.getList);
router.get('/:id', ctrl.getDetail);
router.post('/:id/submit', ctrl.submit);
router.post('/:id/review', ctrl.review);
router.put('/:id', ctrl.update);
router.delete('/:id', ctrl.delete);

module.exports = router;
