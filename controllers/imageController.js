// controllers/imageController.js
const {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand
} = require('@aws-sdk/client-s3');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const db = require('../db');
require('dotenv').config();
 const s3 = new S3Client({
  region: "ap-southeast-1",
  credentials: {
    accessKeyId: "AKIA2YICAB362GH27UST",
    secretAccessKey: "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"
  }
});
console.log(process.env.AWS_ACCESS_KEY_ID+"nahjjaja")
const BUCKET_NAME = 'photong';

// Multer config
const upload = multer({ dest: '/tmp/uploads' });

// 1. อัปโหลดรูปภาพใหม่
exports.uploadImage = [
  upload.single('image'),
  async (req, res) => {
    const { category, subcategory, productId } = req.params;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ success: false, error: 'No file uploaded' });
    }

    try {
      // สร้าง unique filename
      const timestamp = Date.now();
      const ext = path.extname(file.originalname);
      const filename = `${timestamp}${ext}.webp`;
      const s3Key = `products/${category}/${subcategory}/${productId}/${filename}`;
      
      // อัปโหลดไฟล์ไป S3
      const fileStream = fs.createReadStream(file.path);
      await s3.send(new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: s3Key,
        Body: fileStream,
        ContentType: file.mimetype
      }));

      // หาจำนวนรูปที่มีอยู่เพื่อกำหนด display_order
      const [countResult] = await db.query(
        'SELECT COUNT(*) as count FROM product_images WHERE product_id = ?',
        [productId]
      );
      const displayOrder = countResult[0].count + 1;

      // บันทึกข้อมูลลง database
      const [result] = await db.query(
        'INSERT INTO product_images (product_id, image_path, display_order) VALUES (?, ?, ?)',
        [productId, s3Key, displayOrder]
      );

      // ลบไฟล์ชั่วคราว
      fs.unlinkSync(file.path);

      res.json({ 
        success: true,
        imageId: result.insertId,
        imagePath: s3Key,
        displayOrder: displayOrder
      });

    } catch (err) {
      console.error('Upload error:', err);
      res.status(500).json({ success: false, error: err.message });
    }
  }
];

// 2. ดึงรูปภาพทั้งหมดของสินค้า
exports.getProductImages = async (req, res) => {
  const { productId } = req.params;

  try {
    // ดึงรูปภาพทั้งหมดของสินค้าจาก product_images
    const [images] = await db.query(
      'SELECT id, image_path, display_order, is_main_image FROM product_images WHERE product_id = ?',
      [productId]
    );

    // แยกภาพหลักออกจากภาพอื่น
    const mainImage = images.find(img => img.is_main_image);
    const otherImages = images
      .filter(img => !img.is_main_image)
      .sort((a, b) => a.display_order - b.display_order); // เรียงตาม display_order

    const response = {
      success: true,
      images: []
    };

    // ใส่ภาพหลักเป็นลำดับแรกถ้ามี
    if (mainImage) {
      response.images.push({
        id: mainImage.id,
        image_path: mainImage.image_path,
        display_order: 0,
        isMain: true
      });
    }

    // ใส่ภาพที่เหลือ
    response.images.push(
      ...otherImages.map((img, index) => ({
        id: img.id,
        image_path: img.image_path,
        display_order: img.display_order, // เริ่มจาก 1 ต่อจาก main
        isMain: false
      }))
    );

    res.json(response);
  } catch (err) {
    console.error('Get images error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};


// 3. ดึงข้อมูลสินค้า
exports.getProductdata = async (req, res) => {
  const { productId } = req.params;

  try {
    const [rows] = await db.query(`
      SELECT 
        p.id,
        p.name,
       p.category_id AS category,
       p.subcategory_id AS subcategory
      FROM Products p
      WHERE p.id = ?
    `, [productId]);

    if (rows.length > 0) {
      res.json(rows[0]); // ส่งเป็น array ตามที่ Frontend ต้องการ
    } else {
      res.status(404).json({ success: false, error: 'Product not found' });
    }
  } catch (err) {
    console.error('Get product data error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// 4. อัปเดตลำดับรูปภาพหลายรูปพร้อมกัน
exports.reorderImages = async (req, res) => {
  const { productId } = req.params;
  const { imageOrders } = req.body;

  try {

    // อัปเดตลำดับแต่ละรูป
    for (const item of imageOrders) {
      await db.query(
        'UPDATE product_images SET display_order = ? WHERE id = ? AND product_id = ?',
        [item.displayOrder, item.imageId, productId]
      );
    }

    res.json({ success: true });

  } catch (err) {
    console.error('Reorder error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// 5. ลบรูปภาพเดี่ยว
exports.deleteImage = async (req, res) => {
  const { category, subcategory, productId, imageId } = req.params;

  try {

    // ดึงข้อมูลรูปที่จะลบ
    const [image] = await db.query(
      'SELECT image_path, display_order FROM product_images WHERE id = ? AND product_id = ?',
      [imageId, productId]
    );

    if (image.length === 0) {
      return res.status(404).json({ success: false, error: 'Image not found' });
    }

    // ลบจาก S3
    await s3.send(new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: image[0].image_path
    }));

    // ลบจาก database
    await db.query(
      'DELETE FROM product_images WHERE id = ?',
      [imageId]
    );

    // ปรับลำดับรูปที่เหลือ
    await db.query(
      'UPDATE product_images SET display_order = display_order - 1 WHERE product_id = ? AND display_order > ?',
      [productId, image[0].display_order]
    );
    res.json({ success: true });

  } catch (err) {
    console.error('Delete error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// 6. ดูรูปภาพ
exports.viewImage = async (req, res) => {
  const { imagePath } = req.params;

  try {
    // ดึงข้อมูลรูปจาก S3
    const { Body } = await s3.send(new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: imagePath
    }));

    // ส่งไฟล์ภาพเป็น response
    res.setHeader('Content-Type', 'image/jpeg');
    Body.pipe(res);

  } catch (err) {
    console.error('View image error:', err);
    res.status(500).json({ success: false, error: 'Failed to retrieve image' });
  }
};