// ตัวอย่าง mock data
// const express = require('express');
// const router = express.Router();
const db = require('../db'); // สมมุติว่ามีโมดูล db สำหรับเชื่อมต่อฐานข้อมูล
const ImageUrl = "https://cdn.toteja.co/"
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
      const product = products.map(product => ({
      id: product.id,
      name: product.name,
      price: Number(product.price).toLocaleString(), // ใส่ , คั่นหลักพัน
      image: ImageUrl+product.image,
      category: product.category
    }));

      result.push({
        id: cat.id,
        name: cat.name,
        icon: cat.icon,
        gradient: cat.gradient,
        products:product
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
          image: ImageUrl+row.image,
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
  const { subcategoryId } = req.params;
  const {
    limit = 12,
    sort = 'newest',
    search = '',
    // Cursor parameters for load more functionality
    lastCreatedAt,
    lastId,
    lastMonthlyPurchases, // สำหรับ hotseller sort
    lastTotalPurchases,   // สำหรับ topseller sort
    lastPrice            // สำหรับ price sort
  } = req.query;

  try {
    const parsedLimit = parseInt(limit);

    // --- Base Query ---
    let baseQuery = `
      SELECT
        p.id,
        p.name,
        p.description,
        p.created_at,
        p.monthly_purchases,
        p.total_purchases,
        CONCAT('฿', FORMAT(p.price, 0)) AS price,
        p.price AS raw_price,
        c.name AS category,
        s.name AS subcategory,
        p.image_Main_path as image,
        CASE
          WHEN p.created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY) THEN 1
          ELSE 0
        END AS isNew
      FROM Products p
      JOIN Categories c ON p.category_id = c.id
      JOIN subcategories s ON p.subcategory_id = s.id
      WHERE p.subcategory_id = ?
    `;
    let queryParams = [subcategoryId];
    let orderByClause = '';

    // --- Search Condition ---
    if (search && search.trim() !== '') {
      baseQuery += ` AND p.name LIKE ?`;
      queryParams.push(`%${search.trim()}%`);
    }

    // --- Sorting and Cursor Logic ---
    switch (sort) {
      case 'newest':
        orderByClause = `ORDER BY p.created_at DESC, p.id DESC`;
        // Cursor condition for load more
        if (lastCreatedAt && lastId) {
          baseQuery += `
            AND (
              p.created_at < ?
              OR (p.created_at = ? AND p.id < ?)
            )
          `;
          queryParams.push(lastCreatedAt, lastCreatedAt, lastId);
        }
        break;

      case 'hotseller':
        orderByClause = `ORDER BY p.monthly_purchases DESC, p.id DESC`;
        if (lastMonthlyPurchases !== undefined && lastId) {
          baseQuery += `
            AND (
              p.monthly_purchases < ?
              OR (p.monthly_purchases = ? AND p.id < ?)
            )
          `;
          queryParams.push(lastMonthlyPurchases, lastMonthlyPurchases, lastId);
        }
        break;

      case 'topseller':
        orderByClause = `ORDER BY p.total_purchases DESC, p.id DESC`;
        if (lastTotalPurchases !== undefined && lastId) {
          baseQuery += `
            AND (
              p.total_purchases < ?
              OR (p.total_purchases = ? AND p.id < ?)
            )
          `;
          queryParams.push(lastTotalPurchases, lastTotalPurchases, lastId);
        }
        break;

      case 'price-high':
        orderByClause = `ORDER BY p.price DESC, p.id DESC`;
        if (lastPrice && lastId) {
          baseQuery += `
            AND (
              p.price < ?
              OR (p.price = ? AND p.id < ?)
            )
          `;
          queryParams.push(lastPrice, lastPrice, lastId);
        }
        break;

      case 'price-low':
        orderByClause = `ORDER BY p.price ASC, p.id ASC`;
        if (lastPrice && lastId) {
          baseQuery += `
            AND (
              p.price > ?
              OR (p.price = ? AND p.id > ?)
            )
          `;
          queryParams.push(lastPrice, lastPrice, lastId);
        }
        break;

      default:
        orderByClause = 'ORDER BY p.created_at DESC, p.id DESC';
        if (lastCreatedAt && lastId) {
          baseQuery += `
            AND (
              p.created_at < ?
              OR (p.created_at = ? AND p.id < ?)
            )
          `;
          queryParams.push(lastCreatedAt, lastCreatedAt, lastId);
        }
    }

    // --- Final Query ---
    const finalQuery = `${baseQuery} ${orderByClause} LIMIT ?`;
    queryParams.push(parsedLimit + 1); // +1 เพื่อเช็คว่ามีข้อมูลเพิ่มเติมไหม

    // --- Execute Main Query ---
    const [rows] = await db.query(finalQuery, queryParams);

    // ตรวจสอบว่ามีข้อมูลเพิ่มเติมไหม
    const hasMore = rows.length > parsedLimit;
    const products = hasMore ? rows.slice(0, parsedLimit) : rows;

    // --- Fetch Max Purchases for Tags ---
    const [[maxPurchases]] = await db.query(`
      SELECT
        MAX(monthly_purchases) AS max_monthly,
        MAX(total_purchases) AS max_total
      FROM Products
    `);

    // --- Data Processing ---
    const processedProducts = products.map(row => {
      const tags = ["แนะนำ"];
      if (row.isNew) {
        tags.push("ใหม่ล่าสุด");
      }
      if (row.monthly_purchases > 0 && row.monthly_purchases === maxPurchases.max_monthly) {
        tags.push("ขายดี");
      }
      if (row.total_purchases > 0 && row.total_purchases === maxPurchases.max_total) {
        tags.push("ยอดขายสูงสุด");
      }

      return {
        id: row.id,
        name: row.name,
        price: row.price,
        description: row.description,
        category: row.category,
        subcategory: row.subcategory,
        monthly_purchases: row.monthly_purchases,
        total_purchases: row.total_purchases,
        created_at: row.created_at,
        raw_price: row.raw_price,
        isNew: row.isNew === 1,
        tags,
        image: ImageUrl+row.image
      };
    });

    // --- Calculate Next Cursor ---
    let nextCursor = null;
    if (hasMore && processedProducts.length > 0) {
      const lastProduct = processedProducts[processedProducts.length - 1];
      nextCursor = {
        lastCreatedAt: lastProduct.created_at,
        lastId: lastProduct.id,
        lastMonthlyPurchases: lastProduct.monthly_purchases,
        lastTotalPurchases: lastProduct.total_purchases,
        lastPrice: lastProduct.raw_price
      };
    }

    // --- Response ---
    res.json({
      products: processedProducts,
      loadMore: {
        hasMore,
        nextCursor,
        currentCount: processedProducts.length,
        requestedLimit: parsedLimit
      }
    });

  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// ฟังก์ชันเดิมสำหรับดูรายละเอียดสินค้า (ปรับปรุงเล็กน้อย)
// Route สำหรับ API (เพิ่มใน routes file)
/*
// routes/products.js หรือ routes/store.js
router.get('/subcategoryP/:subcategoryId', exports.getProductsBySubcategory);
router.get('/product/:productId', exports.getProductDetail);
*/

exports.getProductDetail = async (req, res) => {
  const productId = req.params.productId;

  try {
    // 1. ดึงข้อมูลสินค้า + category/subcategory
    // เราจะดึงรูปภาพแยกกัน เพื่อให้จัดการ main_image และ sub_images ได้ง่าย
    const [productRows] = await db.query(`
      SELECT
        p.id,
        p.name,
        p.description,
        p.created_at,
        p.monthly_purchases,
        p.total_purchases,
        CONCAT('฿', FORMAT(p.price, 0)) AS price,
        p.total_purchases AS sold,
        p.image_Main_path, -- ดึงรูปหลักจาก Products โดยตรง
        c.name AS category,
        s.name AS subcategory
      FROM Products p
      JOIN Categories c ON p.category_id = c.id
      JOIN subcategories s ON p.subcategory_id = s.id
      WHERE p.id = ?
    `, [productId]);

    if (productRows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const product = productRows[0]; // ข้อมูลสินค้าหลัก

    // 2. ดึงรูปภาพย่อยจากตาราง product_images
    const [subImageRows] = await db.query(`
      SELECT image_path
      FROM product_images
      WHERE product_id = ? AND is_main_image = false
      ORDER BY display_order ASC, created_at ASC; -- เรียงลำดับตาม display_order
    `, [productId]);

    const subImages = subImageRows.map(row => ImageUrl+row.image_path);

    // 3. ดึงยอดขายสูงสุดในระบบ (ยังคงเหมือนเดิม)
    const [[maxPurchases]] = await db.query(`
      SELECT
        MAX(monthly_purchases) AS max_monthly,
        MAX(total_purchases) AS max_total
      FROM Products
    `);

    // 4. ตรวจสอบเงื่อนไข tag (ยังคงเหมือนเดิม)
    const tags = ["แนะนำ"];

    const createdAt = new Date(product.created_at);
    const now = new Date();
    const oneWeekAgo = new Date(now);
    oneWeekAgo.setDate(now.getDate() - 7);

    if (createdAt >= oneWeekAgo) {
      tags.push("ใหม่ล่าสุด");
    }

    if (product.monthly_purchases > 0 && product.monthly_purchases === maxPurchases.max_monthly) {
      tags.push("ขายดี");
    }

    if (product.total_purchases > 0 && product.total_purchases === maxPurchases.max_total) {
      tags.push("ยอดขายสูงสุด");
    }

    // 5. สร้าง object ผลลัพธ์
    const productData = {
      id: product.id,
      name: product.name,
      price: product.price,
      description: product.description,
      sold: product.sold,
      category: product.category,
      subcategory: product.subcategory,
      images: [], // เตรียม array สำหรับเก็บ path รูปภาพทั้งหมด
      tags
    };

    // 6. รวมรูปภาพทั้งหมดเข้าด้วยกัน
    // เพิ่มรูปหลักก่อน
    if (product.image_Main_path) {
      productData.images.push(ImageUrl+product.image_Main_path);
    }

    // เพิ่มรูปภาพย่อย
    productData.images.push(...subImages);

    // ถ้าไม่มีรูปภาพเลย (ทั้งหลักและย่อย) ให้ใส่รูป placeholder
    if (productData.images.length === 0) {
      productData.images = [`https://via.placeholder.com/400x300/6366f1/ffffff?text=${encodeURIComponent(productData.name)}`];
    }

    res.json(productData);

  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
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
      ORDER BY p.created_at DESC
      LIMIT 8
    `);

    const formatted = rows.map(product => ({
      id: product.id,
      name: product.name,
      price: Number(product.price).toLocaleString(), // ใส่ , คั่นหลักพัน
      image: ImageUrl + product.image,
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
    p.image_Main_path AS image,
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
  const updated = rows.map(item => ({
    ...item,
    image: `${ImageUrl}${item.image}`
  }));
res.json(updated);
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

  const updatedRelated = related.map(item => ({
    ...item,
    image: `${ImageUrl}${item.image}`
  }));
res.json(updatedRelated);
}
exports.getCategoriesName = async(req,res)=>{
     const [rows] = await db.query('SELECT id, name FROM Categories');
  res.json(rows);
}
// exports.getNewProductsAll = async(req,res)=>{
//   const page = parseInt(req.query.page) || 1;
//   const limit = parseInt(req.query.limit) || 12;
//   const categoryId = req.query.category;

//   const offset = (page - 1) * limit;

//   let query = `
//     SELECT id, name, 
//            CONCAT('฿', FORMAT(price, 0)) AS price, 
//            image_Main_path AS image
//     FROM Products
//     ${categoryId ? 'WHERE category_id = ?' : ''}
//     ORDER BY created_at DESC
//     LIMIT ? OFFSET ?
//   `;

//   try {
//     const [rows] = await db.query(query, categoryId ? [categoryId, limit, offset] : [limit, offset]);
//     res.json(rows);
//   } catch (err) {
//     res.status(500).json({ message: 'Server Error', error: err });
//   }
// }
exports.getCatagoriesHome = async(req,res)=>{
  const [rows] = await db.query(`
  SELECT 
  c.id AS id,
    c.name AS name,
    c.icon AS icon,
    COUNT(p.id) AS count
  FROM Categories c
  LEFT JOIN Products p ON c.id = p.category_id
  GROUP BY c.id, c.name, c.icon
  ORDER BY c.id;
`);

const categories = rows.map(row => ({
  name: row.name,
  id: row.id,
  icon: row.icon,
  count: row.count + '+'
}));
 res.json(categories);
}