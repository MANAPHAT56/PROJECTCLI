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
  const {newProductData} = req.boduy;
  
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
    newProductData.name,
    newProductData.price,
    newProductData.description,
    newProductData.image_Main_path,
    newProductData.category_id,
    newProductData.subcategory_id,
    newProductData.total_purchases,
    newProductData.monthly_purchases,
    newProductData.stock
];

     try {
    const [rows] = await db.query(query, values);
    console.log('Product inserted with ID:', rows.insertId);
} catch (error) {
    console.error('Error inserting product:', error);
}
}

exports.EditProducts = async(req,res)=>{
  const {newProductData}= req.body;
  const {productId} = req.params;
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
    newProductData.name,
    newProductData.price,
    newProductData.description,
    newProductData.image_Main_path,
    newProductData.category_id,
    newProductData.subcategory_id,
    newProductData.total_purchases,
    newProductData.monthly_purchases,
    newProductData.stock,
    productId
];

// Assuming 'db' is your database connection pool
try {
    const [rows] = await db.query(query, values);
    console.log('Product inserted with ID:', rows.insertId);
} catch (error) {
    console.error('Error inserting product:', error);
}
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

