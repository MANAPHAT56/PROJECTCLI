const db = require('../db'); // สมมุติว่ามีโมดูล db สำหรับเชื่อมต่อฐานข้อมูล


exports.getProducts = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 12;
  const offset = (page - 1) * limit;

  const { categoryId, subcategoryId, searchTerm } = req.query;

  let whereClauses = [];
  let params = [];

  // กรองหมวดหมู่
  if (categoryId) {
    whereClauses.push('p.category_id = ?');
    params.push(categoryId);
  }

  if (subcategoryId) {
    whereClauses.push('p.subcategory_id = ?');
    params.push(subcategoryId);
  }


  if (typeof searchTerm === 'string' && searchTerm.trim() !== '') {
  const trimmedSearch = searchTerm.trim();

  if (!isNaN(trimmedSearch)) {
    // ค้นหาด้วย id เท่านั้น
    whereClauses.push('p.id = ?');
    params.push(parseInt(trimmedSearch));
  } else {
    // ถ้าไม่ใช่ตัวเลข → ค้นจากชื่อหรือคำอธิบาย
    const searchLike = `%${trimmedSearch}%`;
    whereClauses.push('(p.name LIKE ? OR p.description LIKE ?)');
    params.push(searchLike, searchLike);
  }
}

  const whereSQL = whereClauses.length ? `WHERE ${whereClauses.join(' AND ')}` : '';

  // ดึงสินค้าตามเงื่อนไข
  const [products] = await db.query(
    `
    SELECT 
      p.id,
      p.name,
      p.price,
      p.description,
      p.image_Main_path AS image_Main_path,
      p.category_id,
      p.subcategory_id,
      p.stock,
      p.total_purchases,
      p.monthly_purchases,
      p.created_at
    FROM Products p
    ${whereSQL}
    ORDER BY p.created_at DESC
    LIMIT ? OFFSET ?;
  `,
    [...params, limit, offset]
  );

  // นับจำนวนรวมทั้งหมด
  const [[{ total }]] = await db.query(
    `SELECT COUNT(*) AS total FROM Products p ${whereSQL};`,
    params
  );

  res.json({
    data: products,
    pagination: {
      total,
      page,
      pageSize: limit,
      totalPages: Math.ceil(total / limit),
    },
  });
};

exports.InsertNewProducts = async(req,res)=>{
  const productData = req.body;
   // Validate numeric fields
  productData.price = parseFloat(productData.price);
  productData.stock = parseInt(productData.stock);
  productData.category_id = parseInt(productData.category_id);
  productData.subcategory_id = parseInt(productData.subcategory_id);
  productData.total_purchases = parseInt(productData.total_purchases || 0);
  productData.monthly_purchases = parseInt(productData.monthly_purchases || 0);
    if (isNaN(productData.stock)) {
    productData.stock=0;
  }
  const query =    ` INSERT INTO Products (
       
        name,
        price,
        description,
        image_Main_path,
        category_id,
        subcategory_id,
        total_purchases,
        monthly_purchases,
        stock
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);`
  const values = [
    productData.name,
    productData.price,
     productData.description,
    productData.image_Main_path,
    productData.category_id,
    productData.subcategory_id,
     productData.total_purchases,
     productData.monthly_purchases,
   productData.stock
];


     try {
    const [rows] = await db.query(query, values);
    console.log('Product inserted with ID:', rows.insertId);
    const newProductId = rows.insertId; 
            res.json({ productId: newProductId });
} catch (error) {
    console.error('Error inserting product:', error);
}
}

exports.EditProducts = async(req,res)=>{
  const {productId} = req.params;
    const productData = req.body;

  // Validate numeric fields
  productData.price = parseFloat(productData.price);
  productData.stock = parseInt(productData.stock);
  productData.category_id = parseInt(productData.category_id);
  productData.subcategory_id = parseInt(productData.subcategory_id);
  productData.total_purchases = parseInt(productData.total_purchases || 0);
  productData.monthly_purchases = parseInt(productData.monthly_purchases || 0);
    if (isNaN(productData.stock)) {
    productData.stock=0;
  }
     const query = `
   UPDATE Products
SET
    name = ?,
    price = ?,
    description = ?,
    image_Main_path = ?,
    category_id = ?,
    subcategory_id = ?,
    total_purchases = ?,
    monthly_purchases = ?,
    stock = ?
WHERE
    id = ?; 
`;

const values = [
    productData.name,
    productData.price,
     productData.description,
    productData.image_Main_path,
    productData.category_id,
    productData.subcategory_id,
     productData.total_purchases,
     productData.monthly_purchases,
   productData.stock,
    productId
];

// Assuming 'db' is your database connection pool
try {
    const [rows] = await db.query(query, values);
    console.log('Product inserted with ID:', rows.insertId);
} catch (error) {
    console.error('Error inserting product:', error);
}
res.json({success:true})
}
//catogories
exports.getCategories=async (req,res)=>{
    const [categories] =await db.query( `SELECT 
  id,
  name,
  icon,
  gradient,
  description
FROM Categories
ORDER BY id ASC;
`);
res.json({categories:categories})
}


//subcategories
exports.getSubCategories=async (req,res)=>{
    const [subcategories] =await db.query( `SELECT 
  id,
  name,
  category_id,
  icon,
  gradient
FROM subcategories
ORDER BY id ASC;
`);
res.json({subcategories:subcategories})
}

exports.deleteProduct = async(req,res)=>{
    const { productId } = req.params;
 
  try {
    // ลบจาก Products — รูปภาพจะลบอัตโนมัติเพราะมี ON DELETE CASCADE
    const [result] = await db.query('DELETE FROM Products WHERE id = ?', [productId]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'ไม่พบสินค้าเพื่อทำการลบ' });
    }

    res.json({ message: 'ลบสินค้าสำเร็จ' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในการลบสินค้า' });
  }
}
exports.InsertNewCategory = async (req, res) => {
    const categoryData = req.body;
    // No numeric conversions needed for categories based on your schema

    // Default values if not provided from frontend (adjust as needed)
    categoryData.image_path = categoryData.image_path || null;
    categoryData.description = categoryData.description || null;
    categoryData.icon = categoryData.icon || 'default-icon'; // Ensure icon is provided
    categoryData.gradient = categoryData.gradient || 'from-purple-600 to-blue-600';

    const query = `
        INSERT INTO Categories (
            name,
            image_path,
            description,
            icon,
            gradient
        ) VALUES (?, ?, ?, ?, ?);
    `;
    const values = [
        categoryData.name,
        categoryData.image_path,
        categoryData.description,
        categoryData.icon,
        categoryData.gradient
    ];

    try {
        const [result] = await db.query(query, values);
        const newCategoryId = result.insertId;
        res.status(201).json({
            success: true,
            message: 'เพิ่มหมวดหมู่สำเร็จ',
            categoryId: newCategoryId// Return the complete new category object
        });
    } catch (error) {
        console.error('Error inserting category:', error);
        if (error.code === 'ER_DUP_ENTRY') { // MySQL error code for duplicate unique key
            return res.status(409).json({ success: false, message: 'ชื่อหมวดหมู่นี้มีอยู่แล้ว' });
        }
        res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในการเพิ่มหมวดหมู่' });
    }
};
exports.EditCategory = async (req, res) => {
    const { categoryId } = req.params;
    const categoryData = req.body;

    // Default values if not provided from frontend (adjust as needed)
    categoryData.image_path = categoryData.image_path || null;
    categoryData.description = categoryData.description || null;
    categoryData.icon = categoryData.icon || 'default-icon'; // Ensure icon is provided
    categoryData.gradient = categoryData.gradient || 'from-purple-600 to-blue-600';

    const query = `
        UPDATE Categories
        SET
            name = ?,
            image_path = ?,
            description = ?,
            icon = ?,
            gradient = ?
        WHERE id = ?;
    `;
    const values = [
        categoryData.name,
        categoryData.image_path,
        categoryData.description,
        categoryData.icon,
        categoryData.gradient,
        categoryId
    ];

    try {
        const [result] = await db.query(query, values);

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'ไม่พบหมวดหมู่เพื่อทำการแก้ไข หรือไม่มีการเปลี่ยนแปลงข้อมูล' });
        }

        // Optional: Fetch the updated category to return its complete data
       

        res.json({ success: true, message: 'แก้ไขหมวดหมู่สำเร็จ'});
    } catch (error) {
        console.error('Error editing category:', error);
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ success: false, message: 'ชื่อหมวดหมู่นี้มีอยู่แล้ว' });
        }
        res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในการแก้ไขหมวดหมู่' });
    }
};
exports.DeleteCategory = async (req, res) => {
    const { categoryId } = req.params;

    try {
        const [result] = await db.query('DELETE FROM Categories WHERE id = ?', [categoryId]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'ไม่พบหมวดหมู่เพื่อทำการลบ' });
        }

        res.json({ success: true, message: 'ลบหมวดหมู่สำเร็จ' });
    } catch (error) {
        console.error('Error deleting category:', error);
        res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในการลบหมวดหมู่' });
    }
};
//
exports.InsertNewSubcategory = async (req, res) => {
    const subcategoryData = req.body;

    // Validate and convert numeric fields
    subcategoryData.category_id = parseInt(subcategoryData.category_id);

    // Default values if not provided from frontend (adjust as needed)
    subcategoryData.description = subcategoryData.description || null;
    subcategoryData.image_path = subcategoryData.image_path || null;
    subcategoryData.icon = subcategoryData.icon || null;
    subcategoryData.gradient = subcategoryData.gradient || 'from-purple-600 to-blue-600';
    subcategoryData.bgGradient = subcategoryData.bgGradient || 'from-purple-600 to-blue-600';
    subcategoryData.accentColor = subcategoryData.accentColor || '#FFFFFF';

    // Basic validation
    if (isNaN(subcategoryData.category_id) || !subcategoryData.name) {
        return res.status(400).json({ success: false, message: 'ข้อมูลไม่ถูกต้อง: ต้องมีชื่อและ Category ID' });
    }

    const query = `
        INSERT INTO subcategories (
            name,
            description,
            image_path,
            category_id,
            icon,
            gradient,
            bgGradient,
            accentColor
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?);
    `;
    const values = [
        subcategoryData.name,
        subcategoryData.description,
        subcategoryData.image_path,
        subcategoryData.category_id,
        subcategoryData.icon,
        subcategoryData.gradient,
        subcategoryData.bgGradient,
        subcategoryData.accentColor
    ];

    try {
        const [result] = await db.query(query, values);
        const newSubcategoryId = result.insertId;
        res.status(201).json({
            success: true,
            message: 'เพิ่มหมวดหมู่ย่อยสำเร็จ',
            subcategoryId: newSubcategoryId // Return the complete new subcategory object
        });
    } catch (error) {
        console.error('Error inserting subcategory:', error);
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ success: false, message: 'ชื่อหมวดหมู่ย่อยนี้มีอยู่แล้วในหมวดหมู่หลักนี้' });
        }
        res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในการเพิ่มหมวดหมู่ย่อย' });
    }
};
exports.EditSubcategory = async (req, res) => {
    const { subcategoryId } = req.params;
    const subcategoryData = req.body;

    // เริ่ม Transaction
    const connection = await db.getConnection();
    await connection.beginTransaction();

    try {
        // 1. ตรวจสอบ category ใหม่ว่ามีจริงหรือไม่ (ถ้ามีการเปลี่ยน)
        if (subcategoryData.category_id) {
            const [categoryCheck] = await connection.query(
                'SELECT id FROM Categories WHERE id = ?',
                [subcategoryData.category_id]
            );
            if (categoryCheck.length === 0) {
                await connection.rollback();
                return res.status(404).json({
                    success: false,
                    message: 'ไม่พบหมวดหมู่หลักที่ระบุ'
                });
            }
        }

        // 2. อัปเดต subcategory
        const [currentSubcategory] = await connection.query(
            'SELECT category_id FROM subcategories WHERE id = ?', 
            [subcategoryId]
        );

        const updateQuery = `
            UPDATE subcategories
            SET
                name = ?,
                description = ?,
                image_path = ?,
                category_id = ?,
                icon = ?,
                gradient = ?,
                bgGradient = ?,
                accentColor = ?
            WHERE id = ?;
        `;
        
        const values = [
            subcategoryData.name || null,
            subcategoryData.description || null,
            subcategoryData.image_path || null,
            subcategoryData.category_id || currentSubcategory[0].category_id,
            subcategoryData.icon || null,
            subcategoryData.gradient || 'from-purple-600 to-blue-600',
            subcategoryData.bgGradient || 'from-purple-600 to-blue-600',
            subcategoryData.accentColor || '#FFFFFF',
            subcategoryId
        ];

        const [result] = await connection.query(updateQuery, values);

        if (result.affectedRows === 0) {
            await connection.rollback();
            return res.status(404).json({ 
                success: false, 
                message: 'ไม่พบหมวดหมู่ย่อยเพื่อทำการแก้ไข' 
            });
        }

        // 3. ถ้าเปลี่ยน category_id ให้อัปเดตตารางที่เกี่ยวข้อง
        if (subcategoryData.category_id && 
            subcategoryData.category_id !== currentSubcategory[0].category_id) {
            
            // อัปเดต Works
            await connection.query(`
                UPDATE Works
                SET main_category_id = ?
                WHERE subcategory_id = ?
            `, [subcategoryData.category_id, subcategoryId]);

            // อัปเดต Products
            await connection.query(`
                UPDATE Products
                SET category_id = ?
                WHERE subcategory_id = ?
            `, [subcategoryData.category_id, subcategoryId]);
        }

        await connection.commit();
        res.json({ success: true, message: 'แก้ไขหมวดหมู่ย่อยสำเร็จ' });

    } catch (error) {
        await connection.rollback();
        console.error('Error editing subcategory:', error);
        
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ 
                success: false, 
                message: 'ชื่อหมวดหมู่ย่อยนี้มีอยู่แล้วในหมวดหมู่หลักนี้' 
            });
        }
        
        res.status(500).json({ 
            success: false, 
            message: 'เกิดข้อผิดพลาดในการแก้ไขหมวดหมู่ย่อย',
            error: error.message // เพิ่มเพื่อ debug
        });
    } finally {
        connection.release();
    }
};
exports.DeleteSubcategory = async (req, res) => {
    const { subcategoryId } = req.params;

    try {
        const [result] = await db.query('DELETE FROM subcategories WHERE id = ?', [subcategoryId]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'ไม่พบหมวดหมู่ย่อยเพื่อทำการลบ' });
        }

        res.json({ success: true, message: 'ลบหมวดหมู่ย่อยสำเร็จ' });
    } catch (error) {
        console.error('Error deleting subcategory:', error);
        res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในการลบหมวดหมู่ย่อย' });
    }
};
exports.addNewWork = async (req, res) => {
  try {
    const {
      name,
      main_description,
      sub_description,
      main_category_id,
      subcategory_id,
      product_reference_id,
      is_custom = false,
      is_sample = false
    } = req.body;

    // ตรวจสอบข้อมูลเบื้องต้น
    if (!name || !main_description || !main_category_id || !subcategory_id) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'กรุณากรอกข้อมูลให้ครบถ้วน'
      });
    }

    const insertQuery = `
      INSERT INTO Works (
        name, 
        main_description, 
        sub_description, 
        main_category_id, 
        subcategory_id, 
        product_reference_id,
        is_custom, 
        is_sample
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const [result] = await db.query(insertQuery, [
      name,
      main_description,
      sub_description || null,
      main_category_id,
      subcategory_id,
      product_reference_id || null,
      is_custom,
      is_sample
    ]);

    const newWorkId = result.insertId;

    res.status(201).json({
      worksId: newWorkId,
      name,
      main_description,
      sub_description,
      main_category_id,
      subcategory_id,
      product_reference_id,
      is_custom,
      is_sample
    });

  } catch (error) {
    console.error('Error adding new work:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'ไม่สามารถเพิ่มผลงานได้',
      details: error.message
    });
  }
};
// controllers/worksController.js

exports.updateWork = async (req, res) => {
  try {
    const { worksId } = req.params;
    const {
      name,
      main_description,
      sub_description,
      main_category_id,
      subcategory_id,
      product_reference_id,
      is_custom = false,
      is_sample = false
    } = req.body;
    
    if (!name || !main_description || !main_category_id || !subcategory_id) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'กรุณากรอกข้อมูลให้ครบถ้วน'
      });
    }

    const updateQuery = `
      UPDATE Works
      SET name = ?, 
          main_description = ?, 
          sub_description = ?, 
          main_category_id = ?, 
          subcategory_id = ?, 
          product_reference_id = ?, 
          is_custom = ?, 
          is_sample = ?
      WHERE id = ?
    `;

    const [result] = await db.query(updateQuery, [
      name,
      main_description,
      sub_description || null,
      main_category_id,
      subcategory_id,
      product_reference_id || null,
      is_custom,
      is_sample,
      worksId
    ]);
    if (result.affectedRows === 0) {
      return res.status(404).json({
        error: 'Not found',
        message: 'ไม่พบผลงานที่จะแก้ไข'
      });
    }

    res.json({
      Message : "success"
    });
  } catch (error) {
    console.error('Error updating work:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'ไม่สามารถแก้ไขผลงานได้',
      details: error.message
    });
  }
};
// controllers/worksController.js

exports.deleteWork = async (req, res) => {
  try {
     let worksId = req.params.worksId?.trim?.();
    console.log('RAW worksId:', worksId); // ✅ Debug
    const deleteQuery = `DELETE FROM Works WHERE id = ?`;
    const [result] = await db.query(deleteQuery, [worksId]);
   console.log(worksId+"worksId")
    if (result.affectedRows === 0) {
      return res.status(404).json({
        error: 'Not found',
        message: 'ไม่พบผลงานที่ต้องการลบ'
      });
    }

    res.json({
      message: 'ลบผลงานสำเร็จ',
      deletedId: worksId
    });
  } catch (error) {
    console.error('Error deleting work:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'ไม่สามารถลบผลงานได้',
      details: error.message
    });
  }
};
exports.getWorksHome = async (req, res) => {
  try {
    const {
      page,
      limit = 12,
      category,
      subcategory,
      search,
      sort
    } = req.query;
    const pageNumber = parseInt(page) || 1;
    const offset = (pageNumber - 1) * parseInt(limit);

    let whereConditions = [];
    let queryParams = [];

    if (category && category !== 'all') {
      whereConditions.push('w.main_category_id = ?');
      queryParams.push(category);
    }

    if (subcategory && subcategory !== 'all') {
      whereConditions.push('w.subcategory_id = ?');
      queryParams.push(subcategory);
    }
if (typeof search === 'string' && search.trim() !== '') {
  const trimmedSearch = search.trim();

  if (!isNaN(trimmedSearch)) {
    // ค้นหาด้วย id เท่านั้น
    whereConditions.push('w.id = ?');
    queryParams.push(parseInt(trimmedSearch));
  } else {
    // ถ้าไม่ใช่ตัวเลข → ค้นจากชื่อหรือคำอธิบาย
    const searchTerm = `%${trimmedSearch}%`;
    whereConditions.push('(w.name LIKE ? OR w.main_description LIKE ?)');
    queryParams.push(searchTerm, searchTerm);
  }
}
    let orderByClause = '';
    switch (sort) {
      case 'all':
        orderByClause = 'ORDER BY w.created_at DESC, w.id DESC';
        break;
      case 'oldest':
        orderByClause = 'ORDER BY w.created_at ASC, w.id ASC';
        break;
      case 'custom':
        whereConditions.push('w.is_custom = true');
        orderByClause = 'ORDER BY w.created_at DESC, w.id DESC';
        break;
      case 'sample':
        whereConditions.push('w.is_sample = true');
        orderByClause = 'ORDER BY w.created_at DESC, w.id DESC';
        break;
      // case 'category_asc':
      //   orderByClause = 'ORDER BY c.name ASC, w.created_at DESC';
      //   break;
      // case 'category_desc':
      //   orderByClause = 'ORDER BY c.name DESC, w.created_at DESC';
      //   break;
      default:
        orderByClause = 'ORDER BY w.created_at DESC, w.id DESC';
    }

    const finalWhereClause = whereConditions.length > 0 
      ? `WHERE ${whereConditions.join(' AND ')}` 
      : '';

    const countQuery = `
      SELECT COUNT(*) as count 
      FROM Works w
      LEFT JOIN Categories c ON w.main_category_id = c.id
      LEFT JOIN subcategories s ON w.subcategory_id = s.id
      ${finalWhereClause}
    `;

    const [countResult] = await db.query(countQuery, queryParams);
    const totalWorks = countResult[0].count;

    const worksQuery = `
      SELECT 
        w.id,
        w.name,
        w.main_description,
        w.sub_description,
        w.main_category_id,
        w.subcategory_id,
        w.product_reference_id,
        w.is_custom,
        w.is_sample,
        w.created_at,
        COALESCE(c.name, 'ไม่ระบุหมวดหมู่') as category_name,
        COALESCE(s.name, 'ไม่ระบุหมวดหมู่ย่อย') as subcategory_name,
        wi.image_path AS cover_image
      FROM Works w
      LEFT JOIN Categories c ON w.main_category_id = c.id
      LEFT JOIN subcategories s ON w.subcategory_id = s.id
      LEFT JOIN WorksImages wi ON wi.work_id = w.id AND wi.is_main = true
      ${finalWhereClause}
      ${orderByClause}
      LIMIT ? OFFSET ?
    `;

    const finalQueryParams = [...queryParams, parseInt(limit), offset];
    const [works] = await db.query(worksQuery, finalQueryParams);

    const processedWorks = works.map(work => ({
      ...work,
      is_custom: Boolean(work.is_custom),
      is_sample: Boolean(work.is_sample)
    }));

    const totalPages = Math.ceil(totalWorks / parseInt(limit));
    const hasMore = pageNumber < totalPages;

    res.json({
      works: processedWorks,
      pagination: {
        page: pageNumber,
        limit: parseInt(limit),
        total: totalWorks,
        totalPages,
        hasMore
      },
      hasMore,
      filters: {
        category,
        subcategory,
        search,
        sort
      }
    });

  } catch (error) {
    console.error('Error fetching works:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'Failed to fetch works',
      details: error.message
    });
  }
};
