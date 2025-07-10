const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const app = express();
app.use(helmet());
app.use(express.json());

const allowedOrigins = [
  'https://frontreact.pages.dev',
  'https://toteja.co',
  'http://localhost:5173', // 👈 frontend origin
];

// Middleware
app.use(cors({
  origin: allowedOrigins, // 👈 frontend origin
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true,
}));
app.use(cookieParser());
app.set('trust proxy', true);

// Route imports
const storeRouter = require('./routes/store');
const worksRouter = require('./routes/work');
const adminRouter = require('./routes/admin');
const imageRouter = require('./routes/imageRoutes');
const authRoutes = require('./routes/auth');               // 👈 add this
const verifyToken = require('./middleware/verifyToken');   // 👈 add this

// Mount Routes
app.use('/api/store', storeRouter);
app.use('/api/works', worksRouter);
app.use('/api/admin', adminRouter);
app.use('/api/images', imageRouter);
app.use('/auth', authRoutes); // ⬅ Login with Google

// Protected route example
app.get('/api/protected', verifyToken, (req, res) => {
  res.json({ message: 'เข้าถึงได้เพราะ JWT ถูกต้อง', user: req.user });
});

// Start server
app.listen(5000, () => {
  console.log('Server running on port 5000');
});
