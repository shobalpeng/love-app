const router = require('express').Router();

router.get('/', (req, res) => {
  res.json({
    siteTitle: process.env.SITE_TITLE || '情侣互动'
  });
});

module.exports = router;
