const db = require('../db');
const redisClient = require('./redis'); // ระบุ path ไปยังไฟล์ redis.js
const ImageUrl = "https://cdn.toteja.co/";

// Utility function สำหรับ cache
const getFromCacheOrDB = async (cacheKey, dbQuery, ttl = 300) => {
  try {
    // ลองดึงจาก cache ก่อน
    const cached = await redisClient.get(cacheKey);
    if (cached) {
      console.log(`✅ Cache hit: ${cacheKey}`);
      return JSON.parse(cached);
    }

    // ถ้าไม่มีใน cache ให้ query จาก DB
    console.log(`❌ Cache miss: ${cacheKey}`);
    const result = await dbQuery();
    
    // เก็บลง cache
    await redisClient.setEx(cacheKey, ttl, JSON.stringify(result));
    
    return result;
  } catch (error) {
    console.error('Cache error:', error);
    // ถ้า cache error ให้ query จาก DB ตรงๆ
    return await dbQuery();
  }
};

// 1. Categories with Products - cache 5 นาที
exports.getCategoriesWithProducts = async (req, res) => {
  try {
    const cacheKey = 'categories:with-products';
    
    const result = await getFromCacheOrDB(cacheKey, async () => {
      const [categories] = await db.query(`
        SELECT id, name, icon, gradient FROM Categories
      `);

      const categoryData = [];
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
          price: Number(product.price).toLocaleString(),
          image: ImageUrl + product.image,
          category: product.category
        }));

        categoryData.push({
          id: cat.id,
          name: cat.name,
          icon: cat.icon,
          gradient: cat.gradient,
          products: product
        });
      }
      
      return categoryData;
    }, 300); // 5 minutes

    res.json(result);
  } catch (err) {
    console.error('❌ Error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// 2. Subcategories with Products - cache 10 นาที
exports.getSubCategorieswithProducts = async (req, res) => {
  const { categoryId } = req.params;
  
  try {
    const cacheKey = `subcategories:${categoryId}:with-products`;
    
    const result = await getFromCacheOrDB(cacheKey, async () => {
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
      `, [categoryId]);
      
      const subcategoryData = [];
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
          subcategoryData.push(subcategory);
        }

        if (row.product_id && map.get(row.subcategory_id).products.length < 8) {
          map.get(row.subcategory_id).products.push({
            id: row.product_id,
            name: row.product_name,
            price: row.price,
            rating: 5,
            reviews: 50,
            image: ImageUrl + row.image,
            category: row.category
          });
        }
      }

      return subcategoryData;
    }, 600); // 10 minutes

    res.json(result);
  } catch (err) {
    console.error('Error fetching subcategories:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// 3. Product Detail - cache 15 นาที
exports.getProductDetail = async (req, res) => {
  const productId = req.params.productId;

  try {
    const cacheKey = `product:${productId}:detail`;
    
    const result = await getFromCacheOrDB(cacheKey, async () => {
      // Query product data
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
          p.image_Main_path,
          c.name AS category,
          s.name AS subcategory
        FROM Products p
        JOIN Categories c ON p.category_id = c.id
        JOIN subcategories s ON p.subcategory_id = s.id
        WHERE p.id = ?
      `, [productId]);

      if (productRows.length === 0) {
        return null;
      }

      const product = productRows[0];

      // Get sub images
      const [subImageRows] = await db.query(`
        SELECT image_path
        FROM product_images
        WHERE product_id = ? AND is_main_image = false
        ORDER BY display_order ASC, created_at ASC
      `, [productId]);

      const subImages = subImageRows.map(row => ImageUrl + row.image_path);

      // Get max purchases (cache this separately)
      const maxCacheKey = 'system:max-purchases';
      let maxPurchases = await redisClient.get(maxCacheKey);
      
      if (!maxPurchases) {
        const [[maxPurchasesData]] = await db.query(`
          SELECT
            MAX(monthly_purchases) AS max_monthly,
            MAX(total_purchases) AS max_total
          FROM Products
        `);
        maxPurchases = maxPurchasesData;
        await redisClient.setEx(maxCacheKey, 3600, JSON.stringify(maxPurchases)); // 1 hour
      } else {
        maxPurchases = JSON.parse(maxPurchases);
      }

      // Generate tags
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

      const productData = {
        id: product.id,
        name: product.name,
        price: product.price,
        description: product.description,
        sold: product.sold,
        category: product.category,
        subcategory: product.subcategory,
        images: [],
        tags
      };

      if (product.image_Main_path) {
        productData.images.push(ImageUrl + product.image_Main_path);
      }

      productData.images.push(...subImages);

      if (productData.images.length === 0) {
        productData.images = [`https://via.placeholder.com/400x300/6366f1/ffffff?text=${encodeURIComponent(productData.name)}`];
      }

      return productData;
    }, 900); // 15 minutes

    if (!result) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json(result);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// 4. New Products - cache 5 นาที
exports.getNewProducts = async (req, res) => {
  try {
    const cacheKey = 'products:new:8';
    
    const result = await getFromCacheOrDB(cacheKey, async () => {
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

      return rows.map(product => ({
        id: product.id,
        name: product.name,
        price: Number(product.price).toLocaleString(),
        image: ImageUrl + product.image,
        category: product.category
      }));
    }, 300); // 5 minutes

    res.json(result);
  } catch (error) {
    console.error('Error fetching new products:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// 5. Top Sellers - cache 10 นาที
exports.getTopseller = async (req, res) => {
  try {
    const cacheKey = 'products:topseller:8';
    
    const result = await getFromCacheOrDB(cacheKey, async () => {
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
      
      return rows.map(item => ({
        ...item,
        image: `${ImageUrl}${item.image}`
      }));
    }, 600); // 10 minutes

    res.json(result);
  } catch (error) {
    console.error('Error fetching top sellers:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// 6. Categories Name - cache 1 ชั่วโมง
exports.getCategoriesName = async (req, res) => {
  try {
    const cacheKey = 'categories:names';
    
    const result = await getFromCacheOrDB(cacheKey, async () => {
      const [rows] = await db.query('SELECT id, name FROM Categories');
      return rows;
    }, 3600); // 1 hour

    res.json(result);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// 7. Categories Home - cache 30 นาที
exports.getCatagoriesHome = async (req, res) => {
  try {
    const cacheKey = 'categories:home';
    
    const result = await getFromCacheOrDB(cacheKey, async () => {
      const [rows] = await db.query(`
        SELECT 
          c.id AS id,
          c.name AS name,
          c.icon AS icon,
          COUNT(p.id) AS count
        FROM Categories c
        LEFT JOIN Products p ON c.id = p.category_id
        GROUP BY c.id, c.name, c.icon
        ORDER BY c.id
      `);

      return rows.map(row => ({
        name: row.name,
        id: row.id,
        icon: row.icon,
        count: row.count + '+'
      }));
    }, 1800); // 30 minutes

    res.json(result);
  } catch (error) {
    console.error('Error fetching categories home:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// 8. Related Products - cache 20 นาที
exports.getRelatedP_detail = async (req, res) => {
  const productId = req.params.productId;
  
  try {
    const cacheKey = `product:${productId}:related`;
    
    const result = await getFromCacheOrDB(cacheKey, async () => {
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

      return related.map(item => ({
        ...item,
        image: `${ImageUrl}${item.image}`
      }));
    }, 1200); // 20 minutes

    res.json(result);
  } catch (error) {
    console.error('Error fetching related products:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// 9. Products in Subcategory - cache เฉพาะ page แรก
exports.getProductsInSCategory = async (req, res) => {
  const { subcategoryId } = req.params;
  const {
    limit = 12,
    sort = 'newest',
    search = '',
    lastCreatedAt,
    lastId,
    lastMonthlyPurchases,
    lastTotalPurchases,
    lastPrice
  } = req.query;

  try {
    const parsedLimit = parseInt(limit);
    
    // Cache เฉพาะ page แรก (ไม่มี cursor) และไม่มี search
    const isFirstPage = !lastCreatedAt && !lastId && !lastMonthlyPurchases && !lastTotalPurchases && !lastPrice;
    const hasNoSearch = !search || search.trim() === '';
    
    if (isFirstPage && hasNoSearch) {
      const cacheKey = `subcategory:${subcategoryId}:products:${sort}:${limit}`;
      
      const result = await getFromCacheOrDB(cacheKey, async () => {
        return await executeProductQuery();
      }, 300); // 5 minutes
      
      return res.json(result);
    }
    
    // สำหรับ page อื่นๆ หรือมี search ให้ query ตรงๆ
    const result = await executeProductQuery();
    res.json(result);

    async function executeProductQuery() {
      // ใช้โค้ดเดิมของคุณ...
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

      if (search && search.trim() !== '') {
        baseQuery += ` AND p.name LIKE ?`;
        queryParams.push(`%${search.trim()}%`);
      }

      switch (sort) {
        case 'newest':
          orderByClause = `ORDER BY p.created_at DESC, p.id DESC`;
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

      const finalQuery = `${baseQuery} ${orderByClause} LIMIT ?`;
      queryParams.push(parsedLimit + 1);

      const [rows] = await db.query(finalQuery, queryParams);

      const hasMore = rows.length > parsedLimit;
      const products = hasMore ? rows.slice(0, parsedLimit) : rows;

      const [[maxPurchases]] = await db.query(`
        SELECT
          MAX(monthly_purchases) AS max_monthly,
          MAX(total_purchases) AS max_total
        FROM Products
      `);

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
          image: ImageUrl + row.image
        };
      });

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

      return {
        products: processedProducts,
        loadMore: {
          hasMore,
          nextCursor,
          currentCount: processedProducts.length,
          requestedLimit: parsedLimit
        }
      };
    }
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Utility functions สำหรับ invalidate cache
exports.invalidateProductCache = async (productId, categoryId, subcategoryId) => {
  const keysToDelete = [
    `product:${productId}:detail`,
    `product:${productId}:related`,
    'products:new:8',
    'products:topseller:8',
    'categories:with-products',
    `subcategories:${categoryId}:with-products`,
    `subcategory:${subcategoryId}:products:*`, // ใช้ pattern matching
    'system:max-purchases'
  ];

  try {
    for (const key of keysToDelete) {
      if (key.includes('*')) {
        // Handle pattern matching
        const pattern = key;
        const keys = await redisClient.keys(pattern);
        if (keys.length > 0) {
          await redisClient.del(keys);
        }
      } else {
        await redisClient.del(key);
      }
    }
    console.log('Cache invalidated for product:', productId);
  } catch (error) {
    console.error('Error invalidating cache:', error);
  }
};

// เพิ่ม middleware สำหรับ cache headers
exports.setCacheHeaders = (req, res, next) => {
  // Set cache headers for client-side caching
  res.set({
    'Cache-Control': 'public, max-age=300', // 5 minutes
    'ETag': `"${Date.now()}"` // Simple ETag
  });
  next();
};

module.exports = exports;