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
    // 1. ดึงหมวดหมู่ทั้งหมดก่อน
    const [categories] = await db.query(`
      SELECT id, name, icon, gradient FROM Categories
    `);

    // 2. ดึงสินค้าแบบสุ่ม 8 ชิ้น ต่อหมวด
    const result = [];

    for (const cat of categories) {
      const [products] = await db.query(`
        SELECT id, name, price, image_Main_path AS image
        FROM Products
        WHERE category_id = ?
        ORDER BY RAND()
        LIMIT 8
      `, [cat.id]);

      result.push({
        id: cat.id,
        name: cat.name,
        icon: cat.icon,
        gradient: cat.gradient,
        products
      });
    }

    res.json(result);
  } catch (err) {
    console.error('❌ Error:', err);
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
exports.getProductsInSCategory = async (req, res) => {
  const subcategoryId = req.params.subcategoryId;

  try {
    const [rows] = await db.query(
      `
      SELECT 
        p.id,
        p.name,
        p.image_Main_path AS image,
        p.created_at,
        p.monthly_purchases,
        p.total_purchases,
        c.name AS category_name
      FROM Products p
      JOIN Categories c ON p.category_id = c.id
      WHERE p.subcategory_id = ?
      `,
      [subcategoryId]
    );

    const now = new Date();
    const oneWeekAgo = new Date(now);
    oneWeekAgo.setDate(now.getDate() - 7);

    const result = rows.map(product => {
      return {
        id: product.id,
        name: product.name,
        image: product.image,
        isNew: new Date(product.created_at) >= oneWeekAgo,
        category: product.category_name,
        monthlyPurchases: product.monthly_purchases,
        totalPurchases: product.total_purchases
      };
    });

    res.status(200).json(result);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
exports.getProductDetail = async(req,res)=>{
     const productId = req.params.productId;

  try {
    // 1. ดึงข้อมูลสินค้า + category/subcategory + images
    const [rows] = await db.query(`
      SELECT 
        p.id,
        p.name,
        p.description,
        p.created_at,
        p.monthly_purchases,
        p.total_purchases,
        p.total_purchases AS sold,
        c.name AS category,
        s.name AS subcategory,
        pi.image_path
      FROM Products p
      JOIN Categories c ON p.category_id = c.id
      JOIN subcategories s ON p.subcategory_id = s.id
      LEFT JOIN product_images pi ON p.id = pi.product_id
      WHERE p.id = ?
    `, [productId]);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const row = rows[0];

    // 2. ดึงยอดขายสูงสุดในระบบ
    const [[maxPurchases]] = await db.query(`
      SELECT 
        MAX(monthly_purchases) AS max_monthly,
        MAX(total_purchases) AS max_total
      FROM Products
    `);

    // 3. ตรวจสอบเงื่อนไข tag
    const tags = ["แนะนำ"];

    const createdAt = new Date(row.created_at);
    const now = new Date();
    const oneWeekAgo = new Date(now);
    oneWeekAgo.setDate(now.getDate() - 7);

    if (createdAt >= oneWeekAgo) {
      tags.push("ใหม่ล่าสุด");
    }

    if (row.monthly_purchases === maxPurchases.max_monthly) {
      tags.push("ขายดี");
    }

    if (row.total_purchases === maxPurchases.max_total) {
      tags.push("ยอดขายสูงสุด");
    }

    // 4. สร้าง object หลัก
    const productData = {
      id: row.id,
      name: row.name,
      description: row.description,
      sold: row.sold,
      category: row.category,
      subcategory: row.subcategory,
      images: [],
      tags // <-- ใส่ tags เข้าไปตรงนี้
    };

    // รวมรูปภาพทั้งหมด
    for (const r of rows) {
      if (r.image_path) {
        productData.images.push(r.image_path);
      }
    }

    res.json(productData);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
exports.getNewProducts = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        p.id,
        p.name,
        p.price,
        p.image_Main_path AS image,
        c.name AS category
      FROM Products p
      JOIN Categories c ON p.category_id = c.id
      WHERE p.created_at >= NOW() - INTERVAL 7 DAY
      ORDER BY RAND()
      LIMIT 8
    `);

    const formatted = rows.map(product => ({
      id: product.id,
      name: product.name,
      price: Number(product.price).toLocaleString(), // ใส่ , คั่นหลักพัน
      image: product.image,
      category: product.category
    }));

    res.json(formatted);
  } catch (error) {
    console.error('Error fetching new products:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getTopseller = async(req,res)=>{
  const [rows] = await db.query(`
  SELECT 
    p.id,
    p.name,
    p.price,
    p.description,
    p.image_Main_path,
    p.image_Sub_path,
    p.monthly_purchases,
    p.total_purchases,
    c.name AS category,
    s.name AS subcategory
  FROM Products p
  JOIN Categories c ON p.category_id = c.id
  JOIN subcategories s ON p.subcategory_id = s.id
  ORDER BY p.total_purchases DESC
  LIMIT 8
`);

res.json(rows);
}
exports.getRelatedP_detail = async(req,res)=>{
  const productId = req.params.productId;

const [related] = await db.query(`
  SELECT 
    id, 
    name, 
    CONCAT('฿', FORMAT(price, 0)) AS price,
    image_Main_path AS image
  FROM Products
  WHERE category_id = (
    SELECT category_id FROM Products WHERE id = ?
  ) 
  AND id != ?
  ORDER BY RAND()
  LIMIT 4
`, [productId, productId]);

res.json(related);
}