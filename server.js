const express = require('express');
const app = express();
const homeRouter = require('./routes/home');
const storeRouter = require('./routes/store');
const worksRouter = require('./routes/work');
const contactRouter = require('./routes/contact');
const articlesRouter = require('./routes/articles');
const newsRouter = require('./routes/news');
const cors = require('cors');
app.use(cors({
   origin: 'http://localhost:5173',
  methods: ['GET', 'POST'],
  credentials: true,
}));
app.use('/api/home', homeRouter); // Base path
app.use('/api/store', storeRouter); // Base path
app.use('/api/works', worksRouter); // Base path
app.use('/api/contact', contactRouter); // Base path
app.use('/api/articles', articlesRouter); // Base path
app.use('/api/news', newsRouter); // Base path
app.set('trust proxy', true);
//หน้าขั้นตอนการสั่งซื้อ
//หน้าโชว์รูม
//หน้าเกี่ยวกับเรา
//หน้าใบเสนอราคา
//ตั้งค่าคุกกี้ต้องมีให้กดยอมรับด้วย
app.listen(5000, () => {
  console.log('Server running on port 5000');
});
