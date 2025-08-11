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
const sharp = require('sharp'); // เพิ่ม sharp สำหรับแปลงภาพ
const db = require('../db');
const tmp = require('tmp'); 
const tmpDirObj = tmp.dirSync({ prefix: 'uploads_' }); // สร้างโฟลเดอร์ชั่วคราวชื่อสุ่ม
require('dotenv').config({ path: path.resolve(__dirname, './.env') });

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

console.log(process.env.AWS_ACCESS_KEY_ID + "nahjjaja");
const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME;

// Multer config - รับไฟล์ทุกประเภทที่เป็นภาพ
const upload = multer({
  dest: tmpDirObj.name,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
  fileFilter: (req, file, cb) => {
    // ตรวจสอบว่าเป็นไฟล์ภาพหรือไม่
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// ฟังก์ชันแปลงภาพเป็น WebP
const convertToWebP = async (inputPath, outputPath, quality = 80) => {
  try {
    await sharp(inputPath)
      .webp({ quality: quality, effort: 6 }) // quality: 80%, effort: 6 (สูงสุดสำหรับการบีบอัดที่ดีที่สุด)
      .toFile(outputPath);
    return true;
  } catch (error) {
    console.error('Error converting to WebP:', error);
    throw error;
  }
};

// 1. อัปโหลดรูปภาพใหม่
exports.uploadImage = [
  upload.single('image'),
  async (req, res) => {
    const { productId } = req.params;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ success: false, error: 'No file uploaded' });
    }

    let webpPath = null;

    try {
      // สร้าง unique filename สำหรับ WebP
      const timestamp = Date.now();
      const filename = `${timestamp}.webp`;
      const s3Key = `products/${productId}/${filename}`;
      
      // สร้างพาธสำหรับไฟล์ WebP ชั่วคราว
      webpPath = path.join(tmpDirObj.name, `${timestamp}_converted.webp`);
      
      // แปลงภาพเป็น WebP
      await convertToWebP(file.path, webpPath, 85); // quality 85%
      
      // อัปโหลดไฟล์ WebP ไป S3
      const fileStream = fs.createReadStream(webpPath);
      await s3.send(new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: s3Key,
        Body: fileStream,
        ContentType: 'image/webp' // เปลี่ยน ContentType เป็น webp
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

      res.json({ 
        success: true,
        imageId: result.insertId,
        imagePath: s3Key,
        displayOrder: displayOrder,
        format: 'webp'
      });

    } catch (err) {
      console.error('Upload error:', err);
      res.status(500).json({ success: false, error: err.message });
    } finally {
      // ลบไฟล์ชั่วคราวทั้งหมด
      try {
        if (file && file.path) fs.unlinkSync(file.path);
        if (webpPath && fs.existsSync(webpPath)) fs.unlinkSync(webpPath);
      } catch (cleanupError) {
        console.error('Cleanup error:', cleanupError);
      }
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
      .sort((a, b) => a.display_order - b.display_order);

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
        display_order: img.display_order,
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
      res.json(rows[0]);
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
  const { productId, imageId } = req.params;

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

    // ส่งไฟล์ภาพเป็น response (WebP)
    res.setHeader('Content-Type', 'image/webp');
    Body.pipe(res);

  } catch (err) {
    console.error('View image error:', err);
    res.status(500).json({ success: false, error: 'Failed to retrieve image' });
  }
};

// 7. ตั้งรูปหลัก
exports.SetmainImage = async (req, res) => {
  const { productId } = req.params;
  const { imageId, isMain } = req.body;

  try {
    if (isMain === true) {
      // 1. ยกเลิกรูปหลักเดิมทั้งหมด
      await db.query(
        'UPDATE product_images SET is_main_image = FALSE WHERE product_id = ?',
        [productId]
      );

      // 2. ดึงข้อมูลรูปที่จะตั้งเป็นหลัก
      const [imageRows] = await db.query(
        'SELECT image_path FROM product_images WHERE id = ? AND product_id = ?',
        [imageId, productId]
      );

      if (imageRows.length === 0) {
        return res.status(404).json({ success: false, error: 'Image not found for this product.' });
      }
      const newMainImagePath = imageRows[0].image_path;

      // 3. ตั้งรูปที่เลือกเป็นรูปหลัก
      await db.query(
        'UPDATE product_images SET is_main_image = TRUE WHERE id = ? AND product_id = ?',
        [imageId, productId]
      );

      // 4. อัปเดต image_Main_path ในตาราง Products
      await db.query(
        'UPDATE Products SET image_Main_path = ? WHERE id = ?',
        [newMainImagePath, productId]
      );

      return res.json({ success: true });

    } else if (isMain === false) {
      // ยกเลิกการเป็นรูปหลัก
      await db.query(
        'UPDATE product_images SET is_main_image = FALSE WHERE id = ? AND product_id = ?',
        [imageId, productId]
      );

    } else {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid value for isMain. Must be true or false.' 
      });
    }

    return res.json({ 
      success: true, 
      message: `Image ${imageId} isMain status updated for product ${productId}.` 
    });

  } catch (error) {
    console.error('Error in set-main API:', error);
    return res.status(500).json({ success: false, error: 'Internal server error.' });
  } 
};

// === ส่วนของ Works Images ===

// 1. อัปโหลดรูปภาพใหม่สำหรับ Works
exports.uploadImageWorks = [
  upload.single('image'),
  async (req, res) => {
    const { workId } = req.params;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ success: false, error: 'No file uploaded' });
    }

    let webpPath = null;

    try {
      // สร้าง unique filename สำหรับ WebP
      const timestamp = Date.now();
      const filename = `${timestamp}.webp`;
      const s3Key = `works/${workId}/${filename}`;
      
      // สร้างพาธสำหรับไฟล์ WebP ชั่วคราว
      webpPath = path.join(tmpDirObj.name, `${timestamp}_works_converted.webp`);
      
      // แปลงภาพเป็น WebP
      await convertToWebP(file.path, webpPath, 85); // quality 85%
      
      // อัปโหลดไฟล์ WebP ไป S3
      const fileStream = fs.createReadStream(webpPath);
      await s3.send(new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: s3Key,
        Body: fileStream,
        ContentType: 'image/webp'
      }));

      // หาจำนวนรูปที่มีอยู่เพื่อกำหนด display_order
      const [countResult] = await db.query(
        'SELECT COUNT(*) as count FROM WorksImages WHERE work_id = ?',
        [workId]
      );
      const displayOrder = countResult[0].count + 1;

      // บันทึกข้อมูลลง database
      const [result] = await db.query(
        'INSERT INTO WorksImages (work_id, image_path, display_order) VALUES (?, ?, ?)',
        [workId, s3Key, displayOrder]
      );

      res.json({ 
        success: true,
        imageId: result.insertId,
        imagePath: s3Key,
        displayOrder: displayOrder,
        format: 'webp'
      });

    } catch (err) {
      console.error('Upload error:', err);
      res.status(500).json({ success: false, error: err.message });
    } finally {
      // ลบไฟล์ชั่วคราวทั้งหมด
      try {
        if (file && file.path) fs.unlinkSync(file.path);
        if (webpPath && fs.existsSync(webpPath)) fs.unlinkSync(webpPath);
      } catch (cleanupError) {
        console.error('Cleanup error:', cleanupError);
      }
    }
  }
];

// 2. ดึงรูปภาพทั้งหมดของ Work
exports.getWorkImages = async (req, res) => {
  const { workId } = req.params;

  try {
    // ดึงรูปภาพทั้งหมดของ Work จาก WorksImages
    const [images] = await db.query(
      'SELECT id, image_path, display_order, is_main FROM WorksImages WHERE work_id = ?',
      [workId]
    );

    // แยกภาพหลักออกจากภาพอื่น
    const mainImage = images.find(img => img.is_main);
    const otherImages = images
      .filter(img => !img.is_main)
      .sort((a, b) => a.display_order - b.display_order);

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
        display_order: img.display_order,
        isMain: false
      }))
    );

    res.json(response);
  } catch (err) {
    console.error('Get images error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// 3. ดึงข้อมูล Work
exports.getWorkData = async (req, res) => {
  const { workId } = req.params;

  try {
    const [rows] = await db.query(`
      SELECT 
        w.id,
        w.name,
        w.main_category_id AS category,
        w.subcategory_id AS subcategory,
        w.main_description,
        w.sub_description,
        w.product_reference_id,
        w.is_custom,
        w.is_sample
      FROM Works w
      WHERE w.id = ?
    `, [workId]);

    if (rows.length > 0) {
      res.json(rows[0]);
    } else {
      res.status(404).json({ success: false, error: 'Work not found' });
    }
  } catch (err) {
    console.error('Get work data error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// 4. อัปเดตลำดับรูปภาพหลายรูปพร้อมกัน
exports.reorderImagesWorks = async (req, res) => {
  const { workId } = req.params;
  const { imageOrders } = req.body;

  try {
    // อัปเดตลำดับแต่ละรูป
    for (const item of imageOrders) {
      await db.query(
        'UPDATE WorksImages SET display_order = ? WHERE id = ? AND work_id = ?',
        [item.displayOrder, item.imageId, workId]
      );
    }

    res.json({ success: true });

  } catch (err) {
    console.error('Reorder error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// 5. ลบรูปภาพเดี่ยว
exports.deleteImageWorks = async (req, res) => {
  const { category, subcategory, workId, imageId } = req.params;

  try {
    // ดึงข้อมูลรูปที่จะลบ
    const [image] = await db.query(
      'SELECT image_path, display_order FROM WorksImages WHERE id = ? AND work_id = ?',
      [imageId, workId]
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
      'DELETE FROM WorksImages WHERE id = ?',
      [imageId]
    );

    // ปรับลำดับรูปที่เหลือ
    await db.query(
      'UPDATE WorksImages SET display_order = display_order - 1 WHERE work_id = ? AND display_order > ?',
      [workId, image[0].display_order]
    );
    
    res.json({ success: true });

  } catch (err) {
    console.error('Delete error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// 6. ดูรูปภาพ
exports.viewImageWorks = async (req, res) => {
  const { imagePath } = req.params;

  try {
    // ดึงข้อมูลรูปจาก S3
    const { Body } = await s3.send(new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: imagePath
    }));

    // ส่งไฟล์ภาพเป็น response (WebP)
    res.setHeader('Content-Type', 'image/webp');
    Body.pipe(res);

  } catch (err) {
    console.error('View image error:', err);
    res.status(500).json({ success: false, error: 'Failed to retrieve image' });
  }
};

// 7. ตั้งรูปหลักสำหรับ Work
exports.setMainImageWorks = async (req, res) => {
  const { workId } = req.params;
  const { imageId, isMain } = req.body;

  try {
    if (isMain === true) {
      // 1. ยกเลิกรูปหลักเดิมทั้งหมด
      await db.query(
        'UPDATE WorksImages SET is_main = FALSE WHERE work_id = ?',
        [workId]
      );

      // 2. ตั้งรูปที่เลือกเป็นรูปหลัก
      await db.query(
        'UPDATE WorksImages SET is_main = TRUE WHERE id = ? AND work_id = ?',
        [imageId, workId]
      );

      res.json({ 
        success: true, 
        message: `Image ${imageId} set as main image for work ${workId}` 
      });

    } else if (isMain === false) {
      // ยกเลิกการเป็นรูปหลัก
      await db.query(
        'UPDATE WorksImages SET is_main = FALSE WHERE id = ? AND work_id = ?',
        [imageId, workId]
      );

      res.json({ 
        success: true, 
        message: `Image ${imageId} unset as main image for work ${workId}` 
      });

    } else {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid value for isMain. Must be true or false.' 
      });
    }

  } catch (error) {
    console.error('Error in set-main API:', error);
    res.status(500).json({ success: false, error: 'Internal server error.' });
  }
};