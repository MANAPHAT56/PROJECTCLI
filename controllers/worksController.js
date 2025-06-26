const db = require('../db');

// Get works with filtering, pagination, search, and sorting
exports.getWorksHome = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      category,
      subcategory,
      search,
      sort = 'latest' // latest, oldest, custom_only, sample_only, category_asc, category_desc
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

    // Build ORDER BY clause based on sort parameter
    let orderByClause = '';
    switch (sort) {
      case 'latest':
        orderByClause = 'ORDER BY w.created_at DESC, w.id DESC';
        break;
      case 'oldest':
        orderByClause = 'ORDER BY w.created_at ASC, w.id ASC';
        break;
      case 'custom_only':
        whereConditions.push('w.is_custom = true');
        orderByClause = 'ORDER BY w.created_at DESC, w.id DESC';
        break;
      case 'sample_only':
        whereConditions.push('w.is_sample = true');
        orderByClause = 'ORDER BY w.created_at DESC, w.id DESC';
        break;
      case 'category_asc':
        orderByClause = 'ORDER BY c.name ASC, w.created_at DESC';
        break;
      case 'category_desc':
        orderByClause = 'ORDER BY c.name DESC, w.created_at DESC';
        break;
      default:
        orderByClause = 'ORDER BY w.created_at DESC, w.id DESC';
    }

    // Rebuild WHERE clause if sort added conditions
    const finalWhereClause = whereConditions.length > 0 
      ? `WHERE ${whereConditions.join(' AND ')}` 
      : '';

    // Count total works for pagination
    const countQuery = `
      SELECT COUNT(*) as count 
      FROM Works w
      LEFT JOIN Categories c ON w.main_category_id = c.id
      LEFT JOIN subcategories s ON w.subcategory_id = s.id
      ${finalWhereClause}
    `;

    const [countResult] = await db.query(countQuery, queryParams);
    const totalWorks = countResult[0].count;

    // Get works with pagination and sorting
    const worksQuery = `
      SELECT 
        w.id,
        w.name,
        w.main_description,
        w.sub_description,
        w.cover_image,
        w.secondary_images,
        w.secondary_assets,
        w.main_category_id,
        w.subcategory_id,
        w.product_reference_id,
        w.is_custom,
        w.is_sample,
        w.created_at,
        COALESCE(c.name, 'ไม่ระบุหมวดหมู่') as category_name,
        COALESCE(s.name, 'ไม่ระบุหมวดหมู่ย่อย') as subcategory_name
      FROM Works w
      LEFT JOIN Categories c ON w.main_category_id = c.id
      LEFT JOIN subcategories s ON w.subcategory_id = s.id
      ${finalWhereClause}
      ${orderByClause}
      LIMIT ? OFFSET ?
    `;

    // Add limit and offset to query params
    const finalQueryParams = [...queryParams, parseInt(limit), offset];
    const [works] = await db.query(worksQuery, finalQueryParams);

    // Process works data
    const processedWorks = works.map(work => ({
      ...work,
      secondary_images: work.secondary_images ? 
        (typeof work.secondary_images === 'string' ? JSON.parse(work.secondary_images) : work.secondary_images) : [],
      secondary_assets: work.secondary_assets ? 
        (typeof work.secondary_assets === 'string' ? JSON.parse(work.secondary_assets) : work.secondary_assets) : [],
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

// Get categories with work counts
exports.getCategoriesHome = async (req, res) => {
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

    const categories = [
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

    const subcategories = [
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
    console.error('Error fetching subcategories by category:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'Failed to fetch subcategories',
      details: error.message
    });
  }
};

// Get single work details
exports.getWorkById = async (req, res) => {
  try {
    const { id } = req.params;

    const query = `
      SELECT 
        w.id,
        w.name,
        w.main_description,
        w.sub_description,
        w.cover_image,
        w.secondary_images,
        w.secondary_assets,
        w.main_category_id,
        w.subcategory_id,
        w.product_reference_id,
        w.is_custom,
        w.is_sample,
        w.created_at,
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
      secondary_assets: works[0].secondary_assets ? 
        (typeof works[0].secondary_assets === 'string' ? JSON.parse(works[0].secondary_assets) : works[0].secondary_assets) : [],
      is_custom: Boolean(works[0].is_custom),
      is_sample: Boolean(works[0].is_sample)
    };

    res.json(work);

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
    console.error('Error fetching works statistics:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'Failed to fetch statistics',
      details: error.message
    });
  }
};