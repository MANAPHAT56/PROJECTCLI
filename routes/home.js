const express = require('express');
const router = express.Router();

// Controller import (คุณจะต้องสร้างพวกนี้ใน /controllers)
const homeController = require('../controllers/homeController');

// GET / => หน้า Home ทั้งหมด
router.get('/', homeController.getHomepage);

// GET /events => ดึงข้อมูลอีเว้นต์
router.get('/events', homeController.getEvents);

// GET /contacts => ช่องทางติดต่อ (line, messenger, เบอร์ ฯลฯ)
router.get('/contacts', homeController.getContacts);

// GET /categories => ดึงหมวดหมู่สินค้า
router.get('/categories', homeController.getCategories);

// GET /promo => ภาพโปรโมทสำหรับลิงก์ไปยังสินค้า premium
router.get('/promo', homeController.getPromoBanner);

// GET /works/latest => ผลงานล่าสุด
router.get('/works/latest', homeController.getLatestWorks);

// GET /works/all => ผลงานทั้งหมด (จากปุ่ม "ดูเพิ่มเติม")
router.get('/works/all', homeController.getAllWorks);

// GET /articles => บทความที่น่าสนใจ
router.get('/articles', homeController.getArticles);

module.exports = router;
