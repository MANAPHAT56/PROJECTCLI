const express = require('express');
const router = express.Router();
const imageController = require('../controllers/imageController');


// 1. อัปโหลดรูปภาพใหม่
// POST /api/products/:category/:subcategory/:productId/images
router.post('/:category/:subcategory/:productId/images', 
  imageController.uploadImage
);

// 2. ดึงรูปภาพทั้งหมดของสินค้า
// GET /api/products/:productId/images
router.get('/:productId/images', 
  imageController.getProductImages
);

// 3. อัปเดตลำดับรูปภาพเดี่ยว
// PUT /api/images/:imageId/order
router.put('/images/:imageId/order', 
  imageController.updateImageOrder
);

// 4. อัปเดตลำดับรูปภาพหลายรูปพร้อมกัน (สำหรับ drag & drop)
// PUT /api/products/:productId/images/reorder
router.put('/:productId/images/reorder', 
  imageController.reorderImages
);

// 5. ลบรูปภาพเดี่ยว
// DELETE /api/products/:category/:subcategory/:productId/images/:imageId
router.delete('/:category/:subcategory/:productId/images/:imageId', 
  imageController.deleteImage
);

// 6. ลบรูปภาพทั้งหมดของสินค้า
// DELETE /api/products/:category/:subcategory/:productId/images
router.delete('/:category/:subcategory/:productId/images', 
  imageController.deleteAllProductImages
);

// 7. ตั้งรูปเป็นรูปหลัก
// PUT /api/images/:imageId/set-main
router.put('/images/:imageId/set-main', 
  imageController.setMainImage
);
router.get('/getProductdata/:productId',imageController.getProductdata);

module.exports = router;
// 