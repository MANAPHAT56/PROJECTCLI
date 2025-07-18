const db = require('../db');
const crypto = require('crypto');
const {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand
} = require('@aws-sdk/client-s3');
const multer = require('multer');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME;

// ✅ ใช้ memoryStorage เพราะต้องใช้ buffer อัปโหลด S3
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB
});

exports.uploadMiddleware = upload.single('image'); // key ชื่อ image

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

// ✅ เพิ่มโปรโมชั่น
exports.addPromotion = async (req, res) => {
  const { name } = req.body;
  if (!name || !req.file) {
    return res.status(400).json({ error: 'Name and image file are required' });
  }

  try {
    const fileKey = `promotions/${crypto.randomUUID()}-${req.file.originalname}`;
    await s3.send(new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: fileKey,
      Body: req.file.buffer,
      ContentType: req.file.mimetype
    }));

    const imageUrl = `https://${BUCKET_NAME}.s3.amazonaws.com/${fileKey}`;

    const [result] = await db.query(
      'INSERT INTO promotions (name, image_url) VALUES (?, ?)',
      [name, imageUrl]
    );

    res.status(201).json({ id: result.insertId, name, image_url: imageUrl });
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

// ✅ อัปเดตโปรโมชั่น
exports.UpdatePromotion = async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;

  if (!name) return res.status(400).json({ error: 'Name is required' });

  try {
    const [rows] = await db.query('SELECT image_url FROM promotions WHERE id = ?', [id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Promotion not found' });

    let newImageUrl = rows[0].image_url;

    if (req.file) {
      const oldKey = rows[0].image_url.split('.com/')[1];
      await s3.send(new DeleteObjectCommand({ Bucket: BUCKET_NAME, Key: oldKey }));

      const newKey = `promotions/${crypto.randomUUID()}-${req.file.originalname}`;
      await s3.send(new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: newKey,
        Body: req.file.buffer,
        ContentType: req.file.mimetype
      }));

      newImageUrl = `https://${BUCKET_NAME}.s3.amazonaws.com/${newKey}`;
    }

    await db.query('UPDATE promotions SET name = ?, image_url = ? WHERE id = ?', [name, newImageUrl, id]);
    res.json({ message: 'Promotion updated successfully', id, name, image_url: newImageUrl });
  } catch (err) {
    console.error('Error updating promotion:', err);
    res.status(500).json({ error: 'Server error' });
  }
};
