const express = require('express');
const router = express.Router();
const Admincontroller = require('../controllers/adminController');
router.get("/products",Admincontroller.getProducts);
router.get("/categories",Admincontroller.getCategories);
router.get("/subcategories",Admincontroller.getSubCategories);
router.put("/edit/:productId",Admincontroller.EditProducts);
router.post("/new",Admincontroller.InsertNewProducts);
router.delete('/delete/:productId',Admincontroller.deleteProduct);
router.put('/edit/category/:categoryId',Admincontroller.EditCategory);
router.delete('/delete/category/:categoryId',Admincontroller.DeleteCategory);
router.post('/new/category',Admincontroller.InsertNewCategory);
router.put('/edit/subcategory/:subcategoryId',Admincontroller.EditSubcategory);
router.post('/new/subcategory',Admincontroller.InsertNewSubcategory);
router.delete('/delete/subcategory/:subcategoryId',Admincontroller.DeleteSubcategory);
router.post('/new/works',Admincontroller.addNewWork)
router.delete('/delete/works/:worksId',Admincontroller.deleteWork)
router.put('/edit/works/:worksId',Admincontroller.updateWork)
module.exports = router;