// ตัวอย่าง mock data
const express = require('express');
const router = express.Router();
const db = require('../db'); // สมมุติว่ามีโมดูล db สำหรับเชื่อมต่อฐานข้อมูล

// const categories = [
//   { id: 1, name: 'ของขวัญ' },
//   { id: 2, name: 'ของใช้สำนักงาน' },
//   { id: 3, name: 'ของพรีเมี่ยม' }
// ];

// const products = [
//   { id: 1, name: 'แก้วกาแฟ', image: '/products/mug.jpg', categoryId: 1 },
//   { id: 2, name: 'สมุดโน้ต', image: '/products/notebook.jpg', categoryId: 1 },
//   { id: 3, name: 'พวงกุญแจ', image: '/products/keychain.jpg', categoryId: 1 },
//   { id: 4, name: 'ปากกา', image: '/products/pen.jpg', categoryId: 1 },
//   { id: 5, name: 'กระบอกน้ำ', image: '/products/bottle.jpg', categoryId: 2 },
//   { id: 6, name: 'USB', image: '/products/usb.jpg', categoryId: 2 },
//   { id: 7, name: 'แฟลชไดรฟ์', image: '/products/flash.jpg', categoryId: 2 },
//   { id: 8, name: 'ถุงผ้า', image: '/products/bag.jpg', categoryId: 3 }
// ];
exports.getCategoriesWithProducts = (req, res) => {
  const sql = `
    SELECT 
      c.id AS categoryId,
      c.name AS categoryName,
      c.icon,
      p.id AS productId,
      p.name AS productName,
      p.price,
      p.image_Main_path AS image
    FROM Categories c
    LEFT JOIN Products p ON p.category_id = c.id
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error('Error fetching categories with products:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }

    // กลุ่มข้อมูลตาม category
    const categoriesMap = {};

    results.forEach(row => {
      if (!categoriesMap[row.categoryId]) {
        categoriesMap[row.categoryId] = {
          id: row.categoryId,
          name: row.categoryName,
          icon: row.icon,
          products: []
        };
      }

      if (row.productId) {
        categoriesMap[row.categoryId].products.push({
          id: row.productId,
          name: row.productName,
          price: row.price,
          image: row.image,
        });
      }
    });

    // แปลง map เป็น array
    const categories = Object.values(categoriesMap);
    res.json(categories);
  });
};


// exports.getCategories = (req, res) => {
//   res.json(categories);
// };

exports.getCategoryPreview = (req, res) => {
  const { categoryId } = req.params;
  const limitedProducts = products
    .filter(p => p.categoryId === parseInt(categoryId))
    .slice(0, 4); // เอาแค่ 4 ชิ้นแรก
  res.json(limitedProducts);
};

exports.getCategoryProducts = (req, res) => {
  const { categoryId } = req.params;
  const allProducts = products.filter(p => p.categoryId === parseInt(categoryId));
  res.json(allProducts);
};
