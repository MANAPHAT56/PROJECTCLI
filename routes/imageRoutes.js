const express = require('express');
const router = express.Router();
const imageController = require('../controllers/imageController');

// 1. อัปโหลดรูปภาพใหม่ - ตรงกับ Frontend ที่ใช้ใน uploadImageToAPI
router.post('/upload/:category/:subcategory/:productId', 
  imageController.uploadImage
);

// 2. ดึงรูปภาพทั้งหมดของสินค้า - ตรงกับ Frontend ที่ใช้ใน loadImages
router.get('/:productId/images', 
  imageController.getProductImages
);

// 3. ดึงข้อมูลสินค้า - ตรงกับ Frontend ที่ใช้ใน loadProductData
router.get('/getProductdata/:productId',
  imageController.getProductdata
);

// 4. อัปเดตลำดับรูปภาพหลายรูปพร้อมกัน - ตรงกับ Frontend ที่ใช้ใน handleSave
router.put('/reorder/:productId', 
  imageController.reorderImages
);

// 5. ลบรูปภาพเดี่ยว - ตรงกับ Frontend ที่ใช้ใน handleDelete
router.delete('/delete/:category/:subcategory/:productId/:imageId', 
  imageController.deleteImage
);

// 6. ดูรูปภาพ - ตรงกับ Frontend ที่ใช้ใน getImageUrl
router.get('/view/:imagePath',
  imageController.viewImage
);
router.put('/:productId/set-main',imageController.SetmainImage);
module.exports = router;