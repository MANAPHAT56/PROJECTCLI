
import { pool } from '../db.js';
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
require('dotenv').config({ path: path.resolve(__dirname, './.env') });
 const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});
const upload = multer({
  dest: '/tmp/uploads/', // หรือ /tmp/uploads
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB
});
console.log(process.env.AWS_ACCESS_KEY_ID+"nahjjaja")
const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME;
exports.getPromotions = async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, name, image_url FROM promotions ORDER BY id DESC'
    );
    res.json(rows);
  } catch (err) {
    console.error('Error fetching promotions:', err);
    res.status(500).json({ error: 'Server error' });
  }
}
exports.addPromotion = async (req, res) => {
  upload(req, res, async (err) => {
    if (err) return res.status(400).json({ error: 'File upload error' });

    const { name } = req.body;
    if (!name || !req.file) {
      return res.status(400).json({ error: 'Name and image file are required' });
    }

    try {
      // ✅ สร้างชื่อไฟล์ไม่ซ้ำ
      const fileKey = `promotions/${crypto.randomUUID()}-${req.file.originalname}`;
      
      // ✅ อัปโหลดไป S3
      await s3.send(new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: fileKey,
        Body: req.file.buffer,
        ContentType: req.file.mimetype
      }));

      const imageUrl = `https://${BUCKET_NAME}.s3.amazonaws.com/${fileKey}`;

      // ✅ บันทึก DB
      const [result] = await pool.query(
        'INSERT INTO promotions (name, image_url) VALUES (?, ?)',
        [name, imageUrl]
      );

      res.status(201).json({ id: result.insertId, name, image_url: imageUrl });
    } catch (err) {
      console.error('Error adding promotion:', err);
      res.status(500).json({ error: 'Server error' });
    }
  });
};

exports.deletePromotion = async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ error: 'Promotion ID is required' });
  }

  try {
    // ✅ ดึง image_url ก่อน
    const [rows] = await pool.query('SELECT image_url FROM promotions WHERE id = ?', [id]);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Promotion not found' });
    }

    const imageUrl = rows[0].image_url;

    // ✅ ลบไฟล์จาก S3 (ตรวจสอบว่ามีรูปจริงก่อน)
    if (imageUrl) {
      const key = imageUrl.split('.com/')[1]; // แปลง URL เป็น Key
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

    // ✅ ลบข้อมูลจาก Database
    const [result] = await pool.query('DELETE FROM promotions WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Promotion not found' });
    }

    res.json({ message: 'Promotion deleted successfully' });
  } catch (err) {
    console.error('Error deleting promotion:', err);
    res.status(500).json({ error: 'Server error' });
  }
};
exports.UpdatePromotion = async (req, res) => {
  upload(req, res, async (err) => {
    if (err) return res.status(400).json({ error: 'File upload error' });

    const { id } = req.params;
    const { name } = req.body;

    if (!name) return res.status(400).json({ error: 'Name is required' });

    try {
      // ✅ ดึงข้อมูลเก่ามา
      const [rows] = await pool.query('SELECT image_url FROM promotions WHERE id = ?', [id]);
      if (rows.length === 0) return res.status(404).json({ error: 'Promotion not found' });

      let newImageUrl = rows[0].image_url;

      // ✅ ถ้ามีไฟล์ใหม่ ให้อัปโหลด + ลบไฟล์เก่า
      if (req.file) {
        // ลบไฟล์เก่า
        const oldKey = rows[0].image_url.split('.com/')[1];
        await s3.send(new DeleteObjectCommand({ Bucket: BUCKET_NAME, Key: oldKey }));

        // อัปโหลดไฟล์ใหม่
        const newKey = `promotions/${crypto.randomUUID()}-${req.file.originalname}`;
        await s3.send(new PutObjectCommand({
          Bucket: BUCKET_NAME,
          Key: newKey,
          Body: req.file.buffer,
          ContentType: req.file.mimetype
        }));

        newImageUrl = `https://${BUCKET_NAME}.s3.amazonaws.com/${newKey}`;
      }

      // ✅ อัปเดต DB
      const [result] = await pool.query(
        'UPDATE promotions SET name = ?, image_url = ? WHERE id = ?',
        [name, newImageUrl, id]
      );

      res.json({ message: 'Promotion updated successfully', id, name, image_url: newImageUrl });
    } catch (err) {
      console.error('Error updating promotion:', err);
      res.status(500).json({ error: 'Server error' });
    }
  });
};
exports.getPromotions = async (req, res) => {
    try {
        const [rows] = await pool.query(
        'SELECT id, name, image_url FROM promotions ORDER BY id DESC'
        );
        res.json(rows);
    } catch (err) {
        console.error('Error fetching promotions:', err);
        res.status(500).json({ error: 'Server error' });
    }
    }