const router = require('express').Router();
const { insight, compareVerdict } = require('../controllers/aiController');

router.post('/insight', insight);
router.post('/compare-verdict', compareVerdict);

module.exports = router;
