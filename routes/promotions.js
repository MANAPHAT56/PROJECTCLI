const express = require('express');
const router = express.Router();
const verifyAdminToken = require('../middleware/verifyToken');
const promotionsController = require('../controllers/promotionsController');

// ✅ ดึงรายการโปรโมชั่น
router.get('/', promotionsController.getPromotions);

// ✅ เพิ่มโปรโมชั่น (แอดมินเท่านั้น)
router.post('/', verifyAdminToken, promotionsController.uploadMiddleware, promotionsController.addPromotion);

// ✅ อัปเดตโปรโมชั่น
router.put('/:id', verifyAdminToken, promotionsController.uploadMiddleware, promotionsController.UpdatePromotion);

// ✅ ลบโปรโมชั่น
router.delete('/:id', verifyAdminToken, promotionsController.deletePromotion);

module.exports = router;
