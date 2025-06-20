const express = require('express');
const router = express.Router();
const worksController = require('../controllers/worksController');

// แสดงผลงานทั้งหมด
router.get('/', worksController.getAllWorks);

module.exports = router;
