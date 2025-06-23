const express = require('express');
const router = express.Router();
const storeController = require('../controllers/storeController');

// GET /store/categories => รายการหมวดหมู่สินค้าเเละสินค้าบางส่วน
router.get('/categories', storeController.getCategoriesWithProducts);
router.get('/subcategories/:categoryId', storeController.getSubCategorieswithProducts);

// GET /store/preview/:categoryId => สินค้าจำนวนจำกัดจากหมวดหมู่ (เช่น 4 ชิ้นแรก)
router.get('/preview/:categoryId', storeController.getCategoryPreview);

// GET /store/category/:categoryId => สินค้าทั้งหมดในหมวดหมู่
router.get('/category/:categoryId', storeController.getCategoryProducts);
router.get('/subcategoryP/:subcategoryId', storeController.getProductsInSCategory);
router.get('/product/:productId',storeController.getProductDetail);
router.get('/newproductsHome',storeController.getNewProducts);
router.get('/topsellerHome',storeController.getTopseller);
router.get('/RealatedPdeatail/:productId',storeController.getRelatedP_detail);
module.exports = router;
