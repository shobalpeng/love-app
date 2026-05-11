const { Router } = require('express');
const auth = require('../middleware/auth');
const requireBinding = require('../middleware/requireBinding');
const ctrl = require('../controllers/products.controller');

const router = Router();

router.use(auth);
router.use(requireBinding);

router.post('/', ctrl.create);
router.get('/', ctrl.getList);
router.get('/:id', ctrl.getDetail);
router.post('/:id/purchase', ctrl.purchase);
router.post('/:id/verify', ctrl.verify);
router.post('/:id/confirm', ctrl.confirm);
router.post('/:id/extend', ctrl.extend);
router.post('/:id/expire', ctrl.expire);
router.put('/:id', ctrl.update);
router.delete('/:id', ctrl.delete);

module.exports = router;
