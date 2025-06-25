const express = require('express');
const router = express.Router();
const worksController = require('../controllers/worksController');
// const asyncHandler = (fn) => (req, res, next) => {
//   Promise.resolve(fn(req, res, next)).catch(next);
// };

// // Middleware for input validation and sanitization
// const validateWorksQuery = (req, res, next) => {
//   const { page, limit, category, subcategory, search } = req.query;
  
//   // Validate page number
//   if (page && (isNaN(page) || parseInt(page) < 1)) {
//     return res.status(400).json({
//       error: 'Invalid page parameter',
//       message: 'Page must be a positive integer'
//     });
//   }
  
//   // Validate limit
//   if (limit && (isNaN(limit) || parseInt(limit) < 1 || parseInt(limit) > 100)) {
//     return res.status(400).json({
//       error: 'Invalid limit parameter',
//       message: 'Limit must be between 1 and 100'
//     });
//   }
  
//   // Sanitize search input
//   if (search && typeof search === 'string') {
//     req.query.search = search.trim().substring(0, 100); // Limit search length
//   }
  
//   next();
// };

// แสดงผลงานทั้งหมด
  router.get('/home', worksController.getWorksHome);
  router.get('/categories', worksController.getCategoriesHome);
  router.get('/subcategories', worksController.getSubcategoriesHome);
  router.get('/subcategories/category/:categoryId', worksController.getSubcategoriesByCategory);
  router.get('/featured', worksController.getFeaturedWorks);
 router.get('/stats', worksController.getWorksStats);
  router.get('/works/:id', worksController.getWorkById);
module.exports = router;
