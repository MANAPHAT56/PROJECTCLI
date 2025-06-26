const {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  paginateListObjectsV2,
} = require('@aws-sdk/client-s3');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const mysql = require('mysql2/promise');
const db = require('../db')
const s3 = new S3Client({ region: 'ap-southeast-1' });
const BUCKET_NAME = 'your-bucket-name';

// Database connection
const dbConfig = {
  host: 'db',
  user: 'root',
  password: 'mypassword',
  database: 'my_db'
};

// Multer config
const upload = multer({ dest: '/tmp/uploads' });

// ฟังก์ชันสำหรับ reorder display_order
const reorderDisplayOrder = async (productId, connection) => {
  const [images] = await db.query(
    'SELECT id FROM product_images WHERE product_id = ? ORDER BY display_order ASC, created_at ASC',
    [productId]
  );
  console.log(productId);
  
  for (let i = 0; i < images.length; i++) {
    await db.query (
      'UPDATE product_images SET display_order = ? WHERE id = ?',
      [i + 1, images[i].id]
    );
  }
};

// 1. อัปโหลดรูปภาพใหม่
exports.uploadImage = [
  upload.single('image'),
  async (req, res) => {
    const { category, subcategory, productId } = req.params;
    const { displayOrder } = req.body; // รับ display_order จาก client
    const file = req.file;

    if (!file) return res.status(400).json({ error: 'No file uploaded.' });

    const connection = await mysql.createConnection(dbConfig);
    
    try {
      await connection.beginTransaction();

      // สร้าง unique filename
      const timestamp = Date.now();
      const filename = `${timestamp}-${file.originalname}`;
      const s3Key = `products/${category}/${subcategory}/${productId}/${filename}`;
      
      // อัปโหลดไฟล์ไป S3
      const fileStream = fs.createReadStream(file.path);
      const uploadCmd = new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: s3Key,
        Body: fileStream,
        ContentType: file.mimetype
      });

      await s3.send(uploadCmd);

      // หา display_order ถัดไป ถ้าไม่ระบุ
      let newDisplayOrder = displayOrder;
      if (!newDisplayOrder) {
        const [maxOrderResult] = await connection.execute(
          'SELECT COALESCE(MAX(display_order), 0) + 1 as next_order FROM product_images WHERE product_id = ?',
          [productId]
        );
        newDisplayOrder = maxOrderResult[0].next_order;
      } else {
        // ถ้าระบุ order มา ต้องเลื่อน order ของรูปอื่นๆ
        await connection.execute(
          'UPDATE product_images SET display_order = display_order + 1 WHERE product_id = ? AND display_order >= ?',
          [productId, newDisplayOrder]
        );
      }

      // บันทึกข้อมูลลง database
      const [result] = await connection.execute(
        'INSERT INTO product_images (product_id, image_path, display_order) VALUES (?, ?, ?)',
        [productId, s3Key, newDisplayOrder]
      );

      // ลบไฟล์ชั่วคราว
      fs.unlinkSync(file.path);

      await connection.commit();
      
      res.json({ 
        success: true, 
        imageId: result.insertId,
        imagePath: s3Key,
        displayOrder: newDisplayOrder
      });

    } catch (err) {
      await connection.rollback();
      res.status(500).json({ error: err.message });
    } finally {
      await connection.end();
    }
  }
];

// 2. ดึงรูปภาพทั้งหมดของสินค้า
exports.getProductImages = async (req, res) => {
  const { productId } = req.params;
  console.log("productId received:", productId);

  try {
    // 1. ดึงภาพรอง
    const [images] = await db.query(
      'SELECT id, image_path, display_order, created_at FROM product_images WHERE product_id = ? ORDER BY display_order ASC',
      [productId]
    );

    // 2. ดึงภาพหลัก
    const [mainImageResult] = await db.query(
      'SELECT image_Main_path, created_at FROM Products WHERE id = ?',
      [productId]
    );

    const imageList = [];

    // 3. ถ้ามีภาพหลัก
    if (mainImageResult.length > 0 && mainImageResult[0].image_Main_path) {
      imageList.push({
        id: 'main', // กำหนด id เป็น 'main' หรือ null ก็ได้
        image_path: mainImageResult[0].image_Main_path,
        display_order: 1,
        created_at: mainImageResult[0].created_at,
        isMain: true
      });
    }

    // 4. ภาพรอง + ปรับ display_order + isMain
    const adjustedImages = images.map((img) => ({
      ...img,
      display_order: img.display_order + 1,
      isMain: false
    }));

    imageList.push(...adjustedImages);

    res.json({ success: true, images: imageList });
  } catch (err) {
    console.error("❌ Error:", err);
    res.status(500).json({ error: err.message });
  }
};



// 3. อัปเดต display_order ของรูปภาพ
exports.updateImageOrder = async (req, res) => {
  const { imageId } = req.params;
  const { newDisplayOrder, productId } = req.body;

  const connection = await mysql.createConnection(dbConfig);
  
  try {
    await connection.beginTransaction();

    // ดึงข้อมูลรูปเดิม
    const [currentImage] = await connection.execute(
      'SELECT display_order, product_id FROM product_images WHERE id = ?',
      [imageId]
    );

    if (currentImage.length === 0) {
      return res.status(404).json({ error: 'Image not found' });
    }

    const currentOrder = currentImage[0].display_order;
    const actualProductId = currentImage[0].product_id;

    if (currentOrder === newDisplayOrder) {
      return res.json({ success: true, message: 'No change needed' });
    }

    if (currentOrder < newDisplayOrder) {
      // เลื่อนลง: ลดลำดับของรูปที่อยู่ระหว่าง current+1 ถึง new
      await connection.execute(
        'UPDATE product_images SET display_order = display_order - 1 WHERE product_id = ? AND display_order > ? AND display_order <= ?',
        [actualProductId, currentOrder, newDisplayOrder]
      );
    } else {
      // เลื่อนขึ้น: เพิ่มลำดับของรูปที่อยู่ระหว่าง new ถึง current-1
      await connection.execute(
        'UPDATE product_images SET display_order = display_order + 1 WHERE product_id = ? AND display_order >= ? AND display_order < ?',
        [actualProductId, newDisplayOrder, currentOrder]
      );
    }

    // อัปเดตลำดับของรูปที่เลือก
    await connection.execute(
      'UPDATE product_images SET display_order = ? WHERE id = ?',
      [newDisplayOrder, imageId]
    );

    await connection.commit();
    res.json({ success: true });

  } catch (err) {
    await connection.rollback();
    res.status(500).json({ error: err.message });
  } finally {
    await connection.end();
  }
};

// 4. อัปเดตลำดับรูปหลายรูปพร้อมกัน (drag & drop)
exports.reorderImages = async (req, res) => {
  const { productId } = req.params;
  const { imageOrders } = req.body; // [{ imageId: 1, displayOrder: 1 }, ...]

  const connection = await mysql.createConnection(dbConfig);
  
  try {
    await connection.beginTransaction();

    // อัปเดตลำดับแต่ละรูป
    for (const item of imageOrders) {
      await connection.execute(
        'UPDATE product_images SET display_order = ? WHERE id = ? AND product_id = ?',
        [item.displayOrder, item.imageId, productId]
      );
    }

    await connection.commit();
    res.json({ success: true });

  } catch (err) {
    await connection.rollback();
    res.status(500).json({ error: err.message });
  } finally {
    await connection.end();
  }
};

// 5. ลบรูปภาพ
exports.deleteImage = async (req, res) => {
  const { category, subcategory, productId, imageId } = req.params;

  const connection = await mysql.createConnection(dbConfig);
  
  try {
    await connection.beginTransaction();

    // ดึงข้อมูลรูปที่จะลบ
    const [imageData] = await connection.execute(
      'SELECT image_path, display_order FROM product_images WHERE id = ? AND product_id = ?',
      [imageId, productId]
    );

    if (imageData.length === 0) {
      return res.status(404).json({ error: 'Image not found' });
    }

    const imagePath = imageData[0].image_path;
    const deletedOrder = imageData[0].display_order;

    // ลบจาก S3
    await s3.send(new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: imagePath
    }));

    // ลบจาก database
    await connection.execute(
      'DELETE FROM product_images WHERE id = ?',
      [imageId]
    );

    // อัปเดตลำดับของรูปที่เหลือ
    await connection.execute(
      'UPDATE product_images SET display_order = display_order - 1 WHERE product_id = ? AND display_order > ?',
      [productId, deletedOrder]
    );

    await connection.commit();
    res.json({ success: true });

  } catch (err) {
    await connection.rollback();
    res.status(500).json({ error: err.message });
  } finally {
    await connection.end();
  }
};

// 6. ลบรูปทั้งหมดของสินค้า
exports.deleteAllProductImages = async (req, res) => {
  const { category, subcategory, productId } = req.params;
  const prefix = `products/${category}/${subcategory}/${productId}/`;

  const connection = await mysql.createConnection(dbConfig);
  
  try {
    await connection.beginTransaction();

    // ลบไฟล์จาก S3
    const paginator = paginateListObjectsV2(
      { client: s3 },
      { Bucket: BUCKET_NAME, Prefix: prefix }
    );

    for await (const page of paginator) {
      if (page.Contents) {
        for (const object of page.Contents) {
          await s3.send(new DeleteObjectCommand({
            Bucket: BUCKET_NAME,
            Key: object.Key
          }));
        }
      }
    }

    // ลบจาก database
    await connection.execute(
      'DELETE FROM product_images WHERE product_id = ?',
      [productId]
    );

    await connection.commit();
    res.json({ success: true });

  } catch (err) {
    await connection.rollback();
    res.status(500).json({ error: err.message });
  } finally {
    await connection.end();
  }
};

// 7. ตั้งรูปเป็นรูปหลัก (display_order = 1)
exports.setMainImage = async (req, res) => {
  const { imageId } = req.params;
  const { productId } = req.body;

  const connection = await mysql.createConnection(dbConfig);
  
  try {
    await connection.beginTransaction();

    // ดึงข้อมูลรูปปัจจุบัน
    const [currentImage] = await connection.execute(
      'SELECT display_order FROM product_images WHERE id = ? AND product_id = ?',
      [imageId, productId]
    );

    if (currentImage.length === 0) {
      return res.status(404).json({ error: 'Image not found' });
    }

    const currentOrder = currentImage[0].display_order;

    // เลื่อนรูปอื่นๆ ลงมา
    await connection.execute(
      'UPDATE product_images SET display_order = display_order + 1 WHERE product_id = ? AND display_order < ?',
      [productId, currentOrder]
    );

    // ตั้งรูปนี้เป็น order 1
    await connection.execute(
      'UPDATE product_images SET display_order = 1 WHERE id = ?',
      [imageId]
    );

    await connection.commit();
    res.json({ success: true });

  } catch (err) {
    await connection.rollback();
    res.status(500).json({ error: err.message });
  } finally {
    await connection.end();
  }
};
exports.getProductdata = async(req,res)=>{
  const{productId} = req.params;
  const [rows] = await db.query(`
  SELECT 
    p.id,
    p.name,
    c.name AS category,
    s.name AS subcategory
  FROM Products p
  JOIN Categories c ON p.category_id = c.id
  JOIN subcategories s ON p.subcategory_id = s.id
  WHERE p.id = ?
`, [productId]);
res.json(rows);
}