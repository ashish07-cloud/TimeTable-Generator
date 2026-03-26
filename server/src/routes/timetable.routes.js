const { protect } = require('../middlewares/auth.middleware');

router.use(protect);