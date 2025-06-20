
const express = require('express');
const router = express.Router();
const articlesController = require('../controllers/articlesController');

// GET: แสดงบทความตามหน้า
router.get('/', articlesController.getArticlesPaginated);

// GET: อ่านบทความรายตัว
router.get('/:id', articlesController.getArticleById);

module.exports = router;
