const db = require('../db');
const crypto = require('crypto');
const sharp = require('sharp'); // เพิ่ม sharp สำหรับแปลง WebP
const {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand
} = require('@aws-sdk/client-s3');
const multer = require('multer');
const tmp = require('tmp');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const tmpDirObj = tmp.dirSync({ prefix: 'uploads_' });
const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME;

// ✅ ใช้ memoryStorage เพื่อให้ได้ buffer สำหรับประมวลผลด้วย sharp
const upload = multer({
  storage: multer.memoryStorage(), // เปลี่ยนเป็น memoryStorage
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
  fileFilter: (req, file, cb) => {
    // ตรวจสอบว่าเป็นไฟล์รูปภาพหรือไม่
    const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

exports.uploadMiddleware = upload.single('image');

// ✅ ฟังก์ชันแปลงรูปภาพเป็น WebP
const convertToWebP = async (buffer, quality = 80) => {
  try {
    const webpBuffer = await sharp(buffer)
      .webp({ 
        quality: quality, // คุณภาพ 80%
        effort: 4 // ความพยายามในการบีบอัด (0-6, 4 คือค่าเริ่มต้น)
      })
      .toBuffer();
    
    return webpBuffer;
  } catch (error) {
    console.error('Error converting to WebP:', error);
    throw new Error('Failed to convert image to WebP format');
  }
};

// ✅ ดึงรายการโปรโมชั่น
exports.getPromotions = async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT id, name, image_url FROM promotions ORDER BY id DESC'
    );
    res.json(rows);
  } catch (err) {
    console.error('Error fetching promotions:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// ✅ เพิ่มโปรโมชั่น (แปลงเป็น WebP)
exports.addPromotion = async (req, res) => {
  const { name } = req.body;
  if (!name || !req.file) {
    return res.status(400).json({ error: 'Name and image file are required' });
  }

  try {
    // แปลงรูปภาพเป็น WebP
    const webpBuffer = await convertToWebP(req.file.buffer);
    
    // สร้างชื่อไฟล์ใหม่ด้วยนามสกุล .webp
    const originalName = path.parse(req.file.originalname).name;
    const fileKey = `promotions/${crypto.randomUUID()}-${originalName}.webp`;
    
    // อัพโหลดไฟล์ WebP ไปยัง S3
    await s3.send(new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: fileKey,
      Body: webpBuffer,
      ContentType: 'image/webp',
      CacheControl: 'max-age=31536000', // Cache 1 ปี
      Metadata: {
        'original-format': req.file.mimetype,
        'converted-to': 'webp'
      }
    }));

    const imageUrl = `https://${BUCKET_NAME}.s3.amazonaws.com/${fileKey}`;

    const [result] = await db.query(
      'INSERT INTO promotions (name, image_url) VALUES (?, ?)',
      [name, imageUrl]
    );

    console.log(`✅ Image converted to WebP and uploaded: ${fileKey}`);
    res.status(201).json({ 
      id: result.insertId, 
      name, 
      image_url: imageUrl,
      format: 'webp'
    });
  } catch (err) {
    console.error('Error adding promotion:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// ✅ ลบโปรโมชั่น
exports.deletePromotion = async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ error: 'Promotion ID is required' });
  }

  try {
    const [rows] = await db.query('SELECT image_url FROM promotions WHERE id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Promotion not found' });
    }

    const imageUrl = rows[0].image_url;
    if (imageUrl) {
      const key = imageUrl.split('.com/')[1];
      try {
        await s3.send(new DeleteObjectCommand({
          Bucket: BUCKET_NAME,
          Key: key
        }));
        console.log(`✅ Deleted image from S3: ${key}`);
      } catch (s3Err) {
        console.error('⚠️ Failed to delete from S3:', s3Err.message);
      }
    }

    await db.query('DELETE FROM promotions WHERE id = ?', [id]);
    res.json({ message: 'Promotion deleted successfully' });
  } catch (err) {
    console.error('Error deleting promotion:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// ✅ อัปเดตโปรโมชั่น (แปลงเป็น WebP)
exports.UpdatePromotion = async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;

  if (!name) return res.status(400).json({ error: 'Name is required' });

  try {
    const [rows] = await db.query('SELECT image_url FROM promotions WHERE id = ?', [id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Promotion not found' });

    let newImageUrl = rows[0].image_url;

    // ถ้ามีการอัพโหลดรูปใหม่
    if (req.file) {
      // ลบรูปเก่าจาก S3
      const oldKey = rows[0].image_url.split('.com/')[1];
      try {
        await s3.send(new DeleteObjectCommand({ 
          Bucket: BUCKET_NAME, 
          Key: oldKey 
        }));
        console.log(`✅ Deleted old image: ${oldKey}`);
      } catch (s3Err) {
        console.error('⚠️ Failed to delete old image from S3:', s3Err.message);
      }

      // แปลงรูปใหม่เป็น WebP
      const webpBuffer = await convertToWebP(req.file.buffer);
      
      // สร้างชื่อไฟล์ใหม่
      const originalName = path.parse(req.file.originalname).name;
      const newKey = `promotions/${crypto.randomUUID()}-${originalName}.webp`;
      
      // อัพโหลดรูปใหม่
      await s3.send(new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: newKey,
        Body: webpBuffer,
        ContentType: 'image/webp',
        CacheControl: 'max-age=31536000',
        Metadata: {
          'original-format': req.file.mimetype,
          'converted-to': 'webp'
        }
      }));

      newImageUrl = `https://${BUCKET_NAME}.s3.amazonaws.com/${newKey}`;
      console.log(`✅ New image converted to WebP and uploaded: ${newKey}`);
    }

    await db.query(
      'UPDATE promotions SET name = ?, image_url = ? WHERE id = ?', 
      [name, newImageUrl, id]
    );
    
    res.json({ 
      message: 'Promotion updated successfully', 
      id, 
      name, 
      image_url: newImageUrl,
      format: 'webp'
    });
  } catch (err) {
    console.error('Error updating promotion:', err);
    res.status(500).json({ error: 'Server error' });
  }
};