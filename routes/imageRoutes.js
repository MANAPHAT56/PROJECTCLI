const express = require('express');
const router = express.Router();
const imagesController = require('../controllers/imageController');


// 1. อัปโหลดรูปภาพใหม่
// POST /api/products/:category/:subcategory/:productId/images
// GET product data for image manager
router.get('/getProductdata/:productId', imagesController.getProductdata);

// GET all images for a product
router.get('/:productId/images', imagesController.getProductImages);

// NEW: Batch upload images
router.post('/:category/:subcategory/:productId/batch-upload', imagesController.uploadImage);

// NEW: Save all changes (deletions, re-orders, main image) in one go
router.post('/save-all/:productId', imagesController.saveAllChanges);

// คุณสามารถลบ routes เก่าที่จัดการทีละอย่างได้ถ้า save-all ครอบคลุมแล้ว
// router.post('/:category/:subcategory/:productId', imagesController.uploadImage); // Old single upload
// router.put('/update-order/:imageId', imagesController.updateImageOrder); // Old single order update
// router.delete('/:imageId', imagesController.deleteImage); // Old single delete
// router.put('/set-main/:imageId', imagesController.setMainImage); /
module.exports = router;
// 