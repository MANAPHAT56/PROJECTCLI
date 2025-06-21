// ตัวอย่าง mock data
// const express = require('express');
// const router = express.Router();
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
exports.getCategoriesWithProducts = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        c.id AS categoryId,
        c.name AS categoryName,
        c.icon,
        c.gradient,
        p.id AS productId,
        p.name AS productName,
        p.price,
        p.image_Main_path AS image
      FROM Categories c
      LEFT JOIN Products p ON p.category_id = c.id
    `);

    console.log('rows:', rows); // สำหรับ debug

    const categoriesMap = {};

    rows.forEach(row => {
      if (!categoriesMap[row.categoryId]) {
        categoriesMap[row.categoryId] = {
          id: row.categoryId,
          name: row.categoryName,
          icon: row.icon,
          gradient: row.gradient,
          products: []
        };
      }

      if (row.productId && categoriesMap[row.categoryId].products.length < 8) {
        console.log('Adding product:', row.productName);
        categoriesMap[row.categoryId].products.push({
          id: row.productId,
          name: row.productName,
          price: row.price,
          image: row.image,
        });
      }
    });

    const categories = Object.values(categoriesMap);
    res.json(categories);

  } catch (err) {
    console.error('❌ Error fetching categories with products:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
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
exports.getSubCategorieswithProducts = async (req, res) => {
    const { categoryId } = req.params;
  try {
     const [rows] = await db.query(`
      SELECT 
        s.id AS subcategory_id,
        s.name AS subcategory_name,
        s.icon,
        s.gradient,
        s.bgGradient,
        s.accentColor,
        p.id AS product_id,
        p.name AS product_name,
        p.price,
        p.image_Main_path AS image,
        p.category_id AS category
      FROM subcategories s
      LEFT JOIN Products p ON p.subcategory_id = s.id
      WHERE s.category_id = ?
      ORDER BY s.id, p.id
    `, [categoryId]); // <== ใช้ parameterized query ปลอดภัยกว่า
    const result = [];
    
    const map = new Map();

      for (const row of rows) {
      if (!map.has(row.subcategory_id)) {
        const subcategory = {
          id: row.subcategory_id,
          name: row.subcategory_name,
          icon: row.icon,
          gradient: row.gradient,
          bgGradient: row.bgGradient,
          accentColor: row.accentColor,
          products: []
        };
        map.set(row.subcategory_id, subcategory);
        result.push(subcategory);
      }

      if (row.product_id &&  map.get(row.subcategory_id).products.length<8) {
        map.get(row.subcategory_id).products.push({
          id: row.product_id,
          name: row.product_name,
          price: row.price,
          rating: 5,
          reviews: 50,
          image: row.image,
          category: row.category
        });
      }
    }

    res.json(result); // ✅ ส่งผลลัพธ์ออกไป
  } catch (err) {
    console.error('Error fetching subcategories:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

