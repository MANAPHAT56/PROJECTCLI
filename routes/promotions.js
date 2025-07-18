const express = require('express');
const router = express.Router();
const verifyAdminToken = require('../middleware/verifyToken');
const promotionsController = require('../controllers/promotionsController');

// ✅ ดึงรายการโปรโมชั่น
router.get('/promotions', promotionsController.getPromotions);

// ✅ เพิ่มโปรโมชั่น (ต้องเป็นแอดมิน)
router.post('/promotions', verifyAdminToken, promotionsController.addPromotion);

// ✅ อัปเดตโปรโมชั่น
router.put('/promotions/:id', verifyAdminToken, promotionsController.UpdatePromotion);

// ✅ ลบโปรโมชั่น
router.delete('/promotions/:id', verifyAdminToken, promotionsController.deletePromotion);

module.exports = router;
