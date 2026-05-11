const { Router } = require('express');
const auth = require('../middleware/auth');
const upload = require('../config/upload');
const ctrl = require('../controllers/upload.controller');

const router = Router();

router.post('/image', auth, upload.single('image'), ctrl.uploadImage);
router.get('/:filename', ctrl.serveFile);

module.exports = router;
