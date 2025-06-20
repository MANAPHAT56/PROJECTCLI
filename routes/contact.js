const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contactController');

// POST: รับข้อมูลจากฟอร์มติดต่อ
router.post('/', contactController.submitContactForm);

module.exports = router;
