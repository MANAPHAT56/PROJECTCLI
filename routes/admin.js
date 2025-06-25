const express = require('express');
const router = express.Router();
const Admincontroller = require('../controllers/adminController');
router.get("/products",Admincontroller.getProducts);
router.get("/categories",Admincontroller.getCategories);
router.get("/subcategories",Admincontroller.getSubCategories);
module.exports = router;