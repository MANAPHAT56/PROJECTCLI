const express = require('express');
const router = express.Router();
const imageController = require('../controllers/imageController');
const verifyAdminToken = require('../middleware/verifyToken'); // Middleware to verify admin token
// 1. อัปโหลดรูปภาพใหม่ - ตรงกับ Frontend ที่ใช้ใน uploadImageToAPI
router.post('/upload/:productId', verifyAdminToken,
  imageController.uploadImage
);
router.put('/:productId/set-main',verifyAdminToken,imageController.SetmainImage);
// 2. ดึงรูปภาพทั้งหมดของสินค้า - ตรงกับ Frontend ที่ใช้ใน loadImages
router.get('/:productId/images', 
  imageController.getProductImages
);

// 3. ดึงข้อมูลสินค้า - ตรงกับ Frontend ที่ใช้ใน loadProductData
router.get('/getProductdata/:productId',
  imageController.getProductdata
);

// 4. อัปเดตลำดับรูปภาพหลายรูปพร้อมกัน - ตรงกับ Frontend ที่ใช้ใน handleSave
router.put('/reorder/:productId',verifyAdminToken, 
  imageController.reorderImages
);

// 5. ลบรูปภาพเดี่ยว - ตรงกับ Frontend ที่ใช้ใน handleDelete
router.delete('/delete/:category/:subcategory/:productId/:imageId', verifyAdminToken,
  imageController.deleteImage
);

// 6. ดูรูปภาพ - ตรงกับ Frontend ที่ใช้ใน getImageUrl
router.get('/view/:imagePath',
  imageController.viewImage
);
router.get('works/:workId',imageController.getWorkData)
router.get('/works/:workId/images',imageController.getWorkImages)
router.put('/works/:workId/set-main',verifyAdminToken,imageController.setMainImageWorks)
router.post('/works/upload/:workId',verifyAdminToken,verifyAdminToken,imageController.uploadImageWorks)
router.delete('/works/delete/:categoryId/:subcategoryId/:workId/:imageId',verifyAdminToken,imageController.deleteImageWorks)
router.put('/works/reorder/:workId',verifyAdminToken,imageController.reorderImagesWorks)
module.exports = router;