const db = require('../db'); // สมมุติว่ามีโมดูล db สำหรับเชื่อมต่อฐานข้อมูล
exports.getProducts=async (req,res)=>{
    const page = parseInt(req.query.page) || 1;
const limit = parseInt(req.query.limit) || 12;
const offset = (page - 1) * limit;
    const [products] =await db.query( `SELECT 
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
ORDER BY p.created_at DESC
LIMIT ? OFFSET ?;
`,[limit, offset]);
const [[{ total }]] = await db.query(`SELECT COUNT(*) AS total FROM Products`);
res.json({
  data: products,
  pagination: {
    total,
    page,
    pageSize: limit,
    totalPages: Math.ceil(total / limit),
  }});
 
}
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
  image_path AS image_path
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

