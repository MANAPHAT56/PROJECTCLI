const express = require('express');
const router = express.Router();

// ตัวอย่าง: ดึงข่าวแบบมี pagination
router.get('/', async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = 6;
  const offset = (page - 1) * limit;

  try {
    const [rows] = await req.db.query(
      'SELECT id, title, summary, image, created_at FROM news ORDER BY created_at DESC LIMIT ? OFFSET ?',
      [limit, offset]
    );

    const [countResult] = await req.db.query('SELECT COUNT(*) as total FROM news');
    const totalItems = countResult[0].total;
    const totalPages = Math.ceil(totalItems / limit);

    res.json({ news: rows, totalPages });
  } catch (err) {
    console.error('Error fetching news:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ตัวอย่าง: ดึงข่าวทีละชิ้น
router.get('/:id', async (req, res) => {
  const id = req.params.id;
  try {
    const [rows] = await req.db.query('SELECT * FROM news WHERE id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'News not found' });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error('Error fetching news detail:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
