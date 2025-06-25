const db = require('../db');

// Get works with filtering, pagination, and search
exports.getWorksHome = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      category,
      subcategory,
      search
    } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);
    
    // Build WHERE conditions
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

    if (search && search.trim()) {
      whereConditions.push('(w.name LIKE ? OR w.main_description LIKE ?)');
      const searchTerm = `%${search.trim()}%`;
      queryParams.push(searchTerm, searchTerm);
    }

    const whereClause = whereConditions.length > 0 
      ? `WHERE ${whereConditions.join(' AND ')}` 
      : '';

    // Check if Works table exists and has data, if not create sample data
    const checkTableQuery = `
      SELECT COUNT(*) as count FROM Works 
      ${whereClause}
    `;

    let totalWorks;
    try {
      const [countResult] = await db.query(checkTableQuery, queryParams);
      totalWorks = countResult[0].count;
    } catch (error) {
      // If table doesn't exist, return sample data
      console.log('Works table not found, returning sample data');
      return res.json({
        works: getSampleWorks().slice(offset, offset + parseInt(limit)),
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: getSampleWorks().length,
          totalPages: Math.ceil(getSampleWorks().length / parseInt(limit)),
          hasMore: (offset + parseInt(limit)) < getSampleWorks().length
        },
        hasMore: (offset + parseInt(limit)) < getSampleWorks().length
      });
    }

    // Get works with pagination
    const worksQuery = `
      SELECT 
        w.id,
        w.name,
        w.main_description,
        w.sub_description,
        w.cover_image,
        w.secondary_images,
        w.main_category_id,
        w.subcategory_id,
        w.is_custom,
        w.is_sample,
        w.created_at,
        COALESCE(c.name, 'ไม่ระบุหมวดหมู่') as category_name,
        COALESCE(s.name, 'ไม่ระบุหมวดหมู่ย่อย') as subcategory_name
      FROM Works w
      LEFT JOIN Categories c ON w.main_category_id = c.id
      LEFT JOIN subcategories s ON w.subcategory_id = s.id
      ${whereClause}
      ORDER BY w.created_at DESC, w.id DESC
      LIMIT ? OFFSET ?
    `;

    queryParams.push(parseInt(limit), offset);
    const [works] = await db.query(worksQuery, queryParams);

    // Process works data
    const processedWorks = works.map(work => ({
      ...work,
      secondary_images: work.secondary_images ? 
        (typeof work.secondary_images === 'string' ? JSON.parse(work.secondary_images) : work.secondary_images) : [],
      is_custom: Boolean(work.is_custom),
      is_sample: Boolean(work.is_sample)
    }));

    // Calculate pagination info
    const totalPages = Math.ceil(totalWorks / parseInt(limit));
    const hasMore = parseInt(page) < totalPages;

    res.json({
      works: processedWorks,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalWorks,
        totalPages,
        hasMore
      },
      hasMore
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

// Get categories with work counts
exports.getCategoriesHome = async (req, res) => {
  try {
    let categories;
    
    try {
      const query = `
        SELECT 
          c.id,
          c.name,
          COALESCE(c.description, '') as description,
          COUNT(w.id) as count
        FROM Categories c
        LEFT JOIN Works w ON c.id = w.main_category_id
        GROUP BY c.id, c.name, c.description
        ORDER BY c.name ASC
      `;

      const [rows] = await db.query(query);

      // Calculate total count for "all" option
      const totalCount = rows.reduce((sum, row) => sum + parseInt(row.count || 0), 0);

      categories = [
        { 
          id: 'all', 
          name: 'ทั้งหมด', 
          count: totalCount,
          description: 'แสดงผลงานทั้งหมด'
        },
        ...rows.map(row => ({
          id: row.id.toString(),
          name: row.name,
          count: parseInt(row.count || 0),
          description: row.description || ''
        }))
      ];
    } catch (error) {
      console.log('Categories table not found, returning sample data');
      categories = getSampleCategories();
    }

    res.json(categories);

  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'Failed to fetch categories',
      details: error.message
    });
  }
};

// Get subcategories with work counts
exports.getSubcategoriesHome = async (req, res) => {
  try {
    let subcategories;
    
    try {
      const query = `
        SELECT 
          s.id,
          s.name,
          COALESCE(s.description, '') as description,
          s.category_id,
          COUNT(w.id) as count
        FROM subcategories s
        LEFT JOIN Works w ON s.id = w.subcategory_id
        GROUP BY s.id, s.name, s.description, s.category_id
        ORDER BY s.category_id ASC, s.name ASC
      `;

      const [rows] = await db.query(query);

      // Calculate total count for "all" option
      const totalCount = rows.reduce((sum, row) => sum + parseInt(row.count || 0), 0);

      subcategories = [
        { 
          id: 'all', 
          name: 'ทั้งหมด', 
          count: totalCount,
          description: 'แสดงผลงานทั้งหมด',
          category_id: null
        },
        ...rows.map(row => ({
          id: row.id.toString(),
          name: row.name,
          count: parseInt(row.count || 0),
          description: row.description || '',
          category_id: row.category_id
        }))
      ];
    } catch (error) {
      console.log('Subcategories table not found, returning sample data');
      subcategories = getSampleSubcategories();
    }

    res.json(subcategories);

  } catch (error) {
    console.error('Error fetching subcategories:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'Failed to fetch subcategories',
      details: error.message
    });
  }
};

// Get subcategories by category (for dynamic filtering)
exports.getSubcategoriesByCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;

    if (!categoryId || categoryId === 'all') {
      return exports.getSubcategoriesHome(req, res);
    }

    try {
      const query = `
        SELECT 
          s.id,
          s.name,
          COALESCE(s.description, '') as description,
          s.category_id,
          COUNT(w.id) as count
        FROM subcategories s
        LEFT JOIN Works w ON s.id = w.subcategory_id
        WHERE s.category_id = ?
        GROUP BY s.id, s.name, s.description, s.category_id
        ORDER BY s.name ASC
      `;

      const [rows] = await db.query(query, [categoryId]);

      const totalCount = rows.reduce((sum, row) => sum + parseInt(row.count || 0), 0);

      const subcategories = [
        { 
          id: 'all', 
          name: 'ทั้งหมด', 
          count: totalCount,
          description: 'แสดงผลงานทั้งหมดในหมวดหมู่นี้',
          category_id: parseInt(categoryId)
        },
        ...rows.map(row => ({
          id: row.id.toString(),
          name: row.name,
          count: parseInt(row.count || 0),
          description: row.description || '',
          category_id: row.category_id
        }))
      ];

      res.json(subcategories);
    } catch (error) {
      const sampleSubcategories = getSampleSubcategories().filter(s => 
        s.category_id === parseInt(categoryId) || s.id === 'all'
      );
      res.json(sampleSubcategories);
    }

  } catch (error) {
    console.error('Error fetching subcategories by category:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'Failed to fetch subcategories',
      details: error.message
    });
  }
};

// Sample data functions for when database tables don't exist
function getSampleWorks() {
  return [
    {
      id: 1,
      name: 'เสื้อทีมบริษัท ABC',
      main_description: 'ออกแบบและผลิตเสื้อพนักงานให้บริษัท ABC พร้อมโลโก้และสีตามแบรนด์',
      sub_description: 'ใช้ผ้าคุณภาพดี ระบายอากาศได้ดี เหมาะสำหรับการทำงาน',
      cover_image: 'https://via.placeholder.com/400x300/3B82F6/FFFFFF?text=เสื้อทีมบริษัท',
      secondary_images: [],
      main_category_id: 1,
      subcategory_id: 1,
      is_custom: true,
      is_sample: false,
      created_at: new Date('2024-01-15').toISOString()
    },
    {
      id: 2,
      name: 'กระบอกน้ำพรีเมี่ยม',
      main_description: 'กระบอกน้ำสแตนเลส สกรีนโลโก้ตามต้องการ เหมาะสำหรับของขวัญและงานอีเวนต์',
      sub_description: 'ขนาด 500ml เก็บความเย็นได้นาน 6 ชั่วโมง',
      cover_image: 'https://via.placeholder.com/400x300/10B981/FFFFFF?text=กระบอกน้ำ',
      secondary_images: [],
      main_category_id: 2,
      subcategory_id: 3,
      is_custom: false,
      is_sample: true,
      created_at: new Date('2024-01-10').toISOString()
    },
    {
      id: 3,
      name: 'แฟลชไดรฟ์สกรีนโลโก้',
      main_description: 'แฟลชไดรฟ์ความจุ 16GB สกรีนโลโก้บริษัท เหมาะสำหรับงานประชาสัมพันธ์',
      sub_description: 'USB 3.0 ความเร็วสูง พร้อมสายคล้องคอ',
      cover_image: 'https://via.placeholder.com/400x300/8B5CF6/FFFFFF?text=แฟลชไดรฟ์',
      secondary_images: [],
      main_category_id: 3,
      subcategory_id: 5,
      is_custom: true,
      is_sample: false,
      created_at: new Date('2024-01-05').toISOString()
    },
    {
      id: 4,
      name: 'ถุงผ้าสั่งทำ',
      main_description: 'ถุงผ้าแคนวาส ลายเฉพาะของแบรนด์ เป็นมิตรกับสิ่งแวดล้อม',
      sub_description: 'ขนาด 35x40 ซม. ทนทาน ใส่ของได้เยอะ',
      cover_image: 'https://via.placeholder.com/400x300/EF4444/FFFFFF?text=ถุงผ้า',
      secondary_images: [],
      main_category_id: 1,
      subcategory_id: 2,
      is_custom: true,
      is_sample: false,
      created_at: new Date('2024-01-01').toISOString()
    },
    {
      id: 5,
      name: 'สมุดโน้ตปกแข็ง',
      main_description: 'สมุดโน้ตปกแข็ง สกรีนโลโก้ เหมาะสำหรับงานพรีเมี่ยมหรือของขวัญ',
      sub_description: 'กระดาษ 80 แกรม จำนวน 200 หน้า',
      cover_image: 'https://via.placeholder.com/400x300/F59E0B/FFFFFF?text=สมุดโน้ต',
      secondary_images: [],
      main_category_id: 4,
      subcategory_id: 7,
      is_custom: false,
      is_sample: true,
      created_at: new Date('2023-12-28').toISOString()
    },
    {
      id: 6,
      name: 'หมวกแก๊ป Custom',
      main_description: 'หมวกแก๊ปผ้าทวิล ปักโลโก้ 3D คุณภาพสูง',
      sub_description: 'ขนาดปรับได้ หลากหลายสี',
      cover_image: 'https://via.placeholder.com/400x300/06B6D4/FFFFFF?text=หมวกแก๊ป',
      secondary_images: [],
      main_category_id: 1,
      subcategory_id: 1,
      is_custom: true,
      is_sample: false,
      created_at: new Date('2023-12-25').toISOString()
    }
  ];
}

function getSampleCategories() {
  return [
    { id: 'all', name: 'ทั้งหมด', count: 6, description: 'แสดงผลงานทั้งหมด' },
    { id: '1', name: 'เสื้อผ้า', count: 3, description: 'เสื้อ หมวก และเครื่องแต่งกาย' },
    { id: '2', name: 'ของใช้', count: 1, description: 'อุปกรณ์ใช้ในชีวิตประจำวัน' },
    { id: '3', name: 'อิเล็กทรอนิกส์', count: 1, description: 'อุปกรณ์อิเล็กทรอนิกส์' },
    { id: '4', name: 'เครื่องเขียน', count: 1, description: 'อุปกรณ์เครื่องเขียน' }
  ];
}

function getSampleSubcategories() {
  return [
    { id: 'all', name: 'ทั้งหมด', count: 6, description: 'แสดงผลงานทั้งหมด', category_id: null },
    { id: '1', name: 'เสื้อยืด', count: 2, description: 'เสื้อยืดและเสื้อแขนยาว', category_id: 1 },
    { id: '2', name: 'ถุงผ้า', count: 1, description: 'ถุงผ้าและกระเป๋า', category_id: 1 },
    { id: '3', name: 'กระบอกน้ำ', count: 1, description: 'กระบอกน้ำและแก้วน้ำ', category_id: 2 },
    { id: '5', name: 'USB/แฟลชไดรฟ์', count: 1, description: 'อุปกรณ์จัดเก็บข้อมูล', category_id: 3 },
    { id: '7', name: 'สมุดโน้ต', count: 1, description: 'สมุดและอุปกรณ์เขียน', category_id: 4 }
  ];
}

// Get single work details
exports.getWorkById = async (req, res) => {
  try {
    const { id } = req.params;

    try {
      const query = `
        SELECT 
          w.id,
          w.name,
          w.main_description,
          w.sub_description,
          w.cover_image,
          w.secondary_images,
          w.main_category_id,
          w.subcategory_id,
          w.is_custom,
          w.is_sample,
          w.created_at,
          w.updated_at,
          COALESCE(c.name, 'ไม่ระบุหมวดหมู่') as category_name,
          COALESCE(s.name, 'ไม่ระบุหมวดหมู่ย่อย') as subcategory_name
        FROM Works w
        LEFT JOIN Categories c ON w.main_category_id = c.id
        LEFT JOIN subcategories s ON w.subcategory_id = s.id
        WHERE w.id = ?
      `;

      const [works] = await db.query(query, [id]);

      if (works.length === 0) {
        return res.status(404).json({ 
          error: 'Not found',
          message: 'Work not found' 
        });
      }

      const work = {
        ...works[0],
        secondary_images: works[0].secondary_images ? 
          (typeof works[0].secondary_images === 'string' ? JSON.parse(works[0].secondary_images) : works[0].secondary_images) : [],
        is_custom: Boolean(works[0].is_custom),
        is_sample: Boolean(works[0].is_sample)
      };

      res.json(work);
    } catch (error) {
      // Return sample data if table doesn't exist
      const sampleWorks = getSampleWorks();
      const work = sampleWorks.find(w => w.id.toString() === id);
      
      if (!work) {
        return res.status(404).json({ 
          error: 'Not found',
          message: 'Work not found' 
        });
      }
      
      res.json(work);
    }

  } catch (error) {
    console.error('Error fetching work by ID:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'Failed to fetch work details',
      details: error.message
    });
  }
};

// Get featured/recent works for homepage
exports.getFeaturedWorks = async (req, res) => {
  try {
    const { limit = 8 } = req.query;

    try {
      const query = `
        SELECT 
          w.id,
          w.name,
          w.main_description,
          w.cover_image,
          w.main_category_id,
          w.is_custom,
          w.is_sample,
          w.created_at,
          COALESCE(c.name, 'ไม่ระบุหมวดหมู่') as category_name
        FROM Works w
        LEFT JOIN Categories c ON w.main_category_id = c.id
        ORDER BY w.created_at DESC
        LIMIT ?
      `;

      const [works] = await db.query(query, [parseInt(limit)]);

      const processedWorks = works.map(work => ({
        ...work,
        is_custom: Boolean(work.is_custom),
        is_sample: Boolean(work.is_sample)
      }));

      res.json(processedWorks);
    } catch (error) {
      // Return sample data if table doesn't exist
      const sampleWorks = getSampleWorks().slice(0, parseInt(limit));
      res.json(sampleWorks);
    }

  } catch (error) {
    console.error('Error fetching featured works:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'Failed to fetch featured works',
      details: error.message
    });
  }
};

// Get works statistics
exports.getWorksStats = async (req, res) => {
  try {
    try {
      const queries = {
        total: 'SELECT COUNT(*) as count FROM Works',
        custom: 'SELECT COUNT(*) as count FROM Works WHERE is_custom = true',
        samples: 'SELECT COUNT(*) as count FROM Works WHERE is_sample = true',
        categories: 'SELECT COUNT(DISTINCT main_category_id) as count FROM Works WHERE main_category_id IS NOT NULL'
      };

      const results = await Promise.all([
        db.query(queries.total),
        db.query(queries.custom),
        db.query(queries.samples),
        db.query(queries.categories)
      ]);

      const stats = {
        total: results[0][0][0].count,
        custom: results[1][0][0].count,
        samples: results[2][0][0].count,
        categories: results[3][0][0].count
      };

      res.json(stats);
    } catch (error) {
      // Return sample stats if table doesn't exist
      const sampleWorks = getSampleWorks();
      const stats = {
        total: sampleWorks.length,
        custom: sampleWorks.filter(w => w.is_custom).length,
        samples: sampleWorks.filter(w => w.is_sample).length,
        categories: 4
      };
      res.json(stats);
    }

  } catch (error) {
    console.error('Error fetching works statistics:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'Failed to fetch statistics',
      details: error.message
    });
  }
};