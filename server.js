const express = require('express');
const app = express();
app.use(express.json());
const storeRouter = require('./routes/store');
const worksRouter = require('./routes/work');
const newsRouter = require('./routes/news');
const Admin = require('./routes/admin');
const Image = require('./routes/imageRoutes');
const cookieParser = require('cookie-parser');
const cors = require('cors');
app.use(cors({
   origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true,
}));
app.use(cookieParser());
// app.use('/api/home', homeRouter); // Base path
app.use('/api/store', storeRouter); // Base path
app.use('/api/works', worksRouter); // Base path
// app.use('/api/contact', contactRouter); // Base path
// app.use('/api/articles', articlesRouter); // Base path
app.use('/api/news', newsRouter); // Base path
app.use('/api/admin', Admin); // Base path
app.use('/api/images',Image); // Base path
app.set('trust proxy', true);
//หน้าขั้นตอนการสั่งซื้อ
//หน้าโชว์รูม
//หน้าเกี่ยวกับเรา
//หน้าใบเสนอราคา
//ตั้งค่าคุกกี้ต้องมีให้กดยอมรับด้วย
app.listen(5000, () => {
  console.log('Server running on port 5000');
});
