const {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  DeleteObjectsCommand, // Added for potential batch delete in S3 if needed
} = require('@aws-sdk/client-s3');
const multer = require('multer');
const fs = require('fs');
const mysql = require('mysql2/promise');
require('dotenv').config(); // Make sure your .env file is loaded

// S3 Client setup
const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});
const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME || 'photong'; // Get bucket name from .env or default

// Multer config: stores files in /tmp/uploads temporarily
const upload = multer({ dest: '/tmp/uploads' });

// Database connection pool (assuming ../db.js exports a connection pool)
const pool = require('../db');

// --- Helper Functions ---

/**
 * Releases a database connection back to the pool.
 * @param {mysql.Connection} connection - The database connection to release.
 */
const releaseConnection = (connection) => {
  if (connection) {
    connection.release();
  }
};

/**
 * Re-orders the display_order of images for a specific product sequentially.
 * @param {string} productId - The ID of the product.
 * @param {mysql.Connection} connection - The database connection (must be within a transaction).
 */
const reorderDisplayOrder = async (productId, connection) => {
  const [images] = await connection.query(
    'SELECT id FROM product_images WHERE product_id = ? ORDER BY display_order ASC, created_at ASC',
    [productId]
  );

  for (let i = 0; i < images.length; i++) {
    await connection.query(
      'UPDATE product_images SET display_order = ? WHERE id = ?',
      [i + 1, images[i].id]
    );
  }
};

/**
 * Constructs the full public URL for an S3 object.
 * @param {string} s3Key - The S3 object key (e.g., 'images/category/product/file.jpg').
 * @returns {string} The full public URL.
 */
const getS3PublicUrl = (s3Key) => {
  // Option 1: Direct S3 URL (most reliable)
  return `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${s3Key}`;
  // Option 2: Custom CDN URL (requires CDN configuration to map s3Key correctly)
  // return `https://cdn.toteja.co/${s3Key}`; // Make sure this CDN URL maps to your S3Key properly (e.g., if s3Key is 'images/x', CDN should access 'images/x')
};


// --------------------- API Endpoints ---------------------

/**
 * @route POST /api/images/:category/:subcategory/:productId/batch-upload
 * @desc Uploads multiple images for a product to S3 and saves their info to DB.
 * Handles file processing, S3 upload, and DB insert within a transaction.
 * @access Private (e.g., Admin)
 */
exports.uploadImage = [
  upload.array('images'), // Multer now expects an array of files under the 'images' field
  async (req, res) => {
    const { category, subcategory, productId } = req.params;
    const files = req.files; // `req.files` will be an array of uploaded files

    if (!files || files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded.' });
    }

    const connection = await pool.getConnection(); // Get a connection from the pool
    const uploadedResults = [];

    try {
      await connection.beginTransaction(); // Start a transaction

      for (const file of files) {
        const timestamp = Date.now();
        // Construct the S3 Key. This should match your desired path within the S3 bucket.
        // Using 'images' as the root folder in S3 to match your potential CDN path.
        const s3Key = `images/${category}/${subcategory}/${productId}/${timestamp}-${file.originalname}`;

        // Upload file to S3
        const fileStream = fs.createReadStream(file.path);
        const uploadCmd = new PutObjectCommand({
          Bucket: BUCKET_NAME,
          Key: s3Key, // This is the actual path in S3
          Body: fileStream,
          ContentType: file.mimetype
        });
        await s3Client.send(uploadCmd);

        // Get the next display_order for new images (always append to the end)
        const [maxOrderResult] = await connection.query(
          'SELECT COALESCE(MAX(display_order), 0) + 1 as next_order FROM product_images WHERE product_id = ?',
          [productId]
        );
        const newDisplayOrder = maxOrderResult[0].next_order;

        // Save image information to the database (store the S3 Key, not the full URL)
        const [insertResult] = await connection.query(
          'INSERT INTO product_images (product_id, image_path, display_order) VALUES (?, ?, ?)',
          [productId, s3Key, newDisplayOrder] // Store S3 Key in DB
        );

        // Clean up the temporary file
        fs.unlinkSync(file.path);

        // Prepare response data with the full public URL
        uploadedResults.push({
          imageId: insertResult.insertId,
          imagePath: getS3PublicUrl(s3Key), // Send full URL in response
          displayOrder: newDisplayOrder
        });
      }

      await connection.commit(); // Commit the transaction if all operations succeed
      res.json({ success: true, uploadedImages: uploadedResults, message: 'รูปภาพอัปโหลดสำเร็จ' });

    } catch (err) {
      await connection.rollback(); // Rollback on error
      console.error('Batch upload error:', err);
      // Clean up temp files if any remain due to early error
      if (files) {
        files.forEach(file => {
          try { fs.unlinkSync(file.path); } catch (e) { console.error('Failed to unlink temp file:', e); }
        });
      }
      res.status(500).json({ error: err.message, message: 'เกิดข้อผิดพลาดในการอัปโหลดรูปภาพ' });
    } finally {
      releaseConnection(connection); // Release the connection back to the pool
    }
  }
];

/**
 * @route GET /api/images/:productId/images
 * @desc Retrieves all images (main and supplementary) for a specific product.
 * @access Public
 */
exports.getProductImages = async (req, res) => {
  const { productId } = req.params;
  const connection = await pool.getConnection();

  try {
    // 1. Fetch supplementary images (sorted by display_order)
    const [images] = await connection.query(
      'SELECT id, image_path, display_order, created_at FROM product_images WHERE product_id = ? ORDER BY display_order ASC',
      [productId]
    );

    // 2. Fetch main image path from the Products table
    const [mainImageResult] = await connection.query(
      'SELECT image_Main_path, created_at FROM Products WHERE id = ?',
      [productId]
    );

    let imageList = [];
    let currentMaxDisplayOrder = 0; // Track max display order for supplementary images

    // 3. Add main image if it exists
    if (mainImageResult.length > 0 && mainImageResult[0].image_Main_path) {
      const mainS3Key = mainImageResult[0].image_Main_path; // This is the S3 Key stored in DB
      const mainImageUrl = getS3PublicUrl(mainS3Key); // Construct full URL

      imageList.push({
        id: 'main-placeholder', // Use a unique temporary ID for the main image in frontend logic
                                // Frontend will use `mainImageId` from state for actual DB ID
        image_path: mainImageUrl,
        display_order: 0, // A temporary order for sorting, frontend will re-calculate
        created_at: mainImageResult[0].created_at,
        isMain: true,
        // Also include the actual ID of the main image if it exists in product_images
        // This makes setting main image easier if it's already a supplementary image
        originalMainImageId: null // If main image is a product_images.id, set it here
      });
    }

    // 4. Add supplementary images, ensure their paths are full URLs
    const processedImages = images.map(img => {
      const s3Key = img.image_path; // This is the S3 Key stored in DB
      const imageUrl = getS3PublicUrl(s3Key); // Construct full URL
      currentMaxDisplayOrder = Math.max(currentMaxDisplayOrder, img.display_order); // Keep track

      return {
        id: img.id, // Actual DB ID
        image_path: imageUrl,
        display_order: img.display_order,
        created_at: img.created_at,
        isMain: false
      };
    });

    // Combine all images
    const allImages = [...imageList, ...processedImages];

    // Sort images by their current display_order from DB
    // This allows frontend to easily map them to its display logic
    allImages.sort((a, b) => {
      // Ensure 'main-placeholder' comes first if present and has display_order 0
      if (a.id === 'main-placeholder') return -1;
      if (b.id === 'main-placeholder') return 1;
      return a.display_order - b.display_order;
    });

    res.json({ success: true, images: allImages });
  } catch (err) {
    console.error("❌ Error fetching product images:", err);
    res.status(500).json({ error: err.message });
  } finally {
    releaseConnection(connection);
  }
};

/**
 * @route GET /api/images/getProductdata/:productId
 * @desc Retrieves basic product data (name, category, subcategory) for image management.
 * @access Public
 */
exports.getProductdata = async (req, res) => {
  const { productId } = req.params;
  const connection = await pool.getConnection();

  try {
    const [rows] = await connection.query(`
      SELECT
        p.id,
        p.name,
        c.name AS category,
        s.name AS subcategory,
        p.image_Main_path AS main_image_s3_key -- Also fetch the current main image S3 key
      FROM Products p
      JOIN Categories c ON p.category_id = c.id
      JOIN subcategories s ON p.subcategory_id = s.id
      WHERE p.id = ?
    `, [productId]);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error('Get product data error:', err);
    res.status(500).json({ error: err.message });
  } finally {
    releaseConnection(connection);
  }
};

/**
 * @route POST /api/images/save-all/:productId
 * @desc Saves all changes to product images (deletions, order updates, main image changes).
 * Handles all operations within a single transaction.
 * @access Private (e.g., Admin)
 */
exports.saveAllChanges = async (req, res) => {
  const { productId } = req.params;
  const {
    imageOrders,   // Array of { imageId, displayOrder } for supplementary images
    mainImageId,   // The actual DB ID of the image to be set as main (null if no main)
    deletedImages  // Array of image IDs to be deleted
  } = req.body;

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction(); // Start a transaction

    // 1. Delete images from S3 and DB
    if (deletedImages && deletedImages.length > 0) {
      for (const imageId of deletedImages) {
        // Fetch S3 Key from DB for deletion
        const [imageData] = await connection.query(
          'SELECT image_path FROM product_images WHERE id = ? AND product_id = ?',
          [imageId, productId]
        );

        if (imageData.length > 0) {
          const s3KeyToDelete = imageData[0].image_path; // This is the S3 Key
          try {
            await s3Client.send(new DeleteObjectCommand({
              Bucket: BUCKET_NAME,
              Key: s3KeyToDelete
            }));
          } catch (s3Error) {
            console.warn(`S3 delete warning for ${s3KeyToDelete}:`, s3Error.message);
            // Don't throw error if S3 delete fails (e.g., object not found).
            // Continue to delete from DB to maintain consistency.
          }
        }
        // Delete from database
        await connection.query('DELETE FROM product_images WHERE id = ? AND product_id = ?', [imageId, productId]);
      }
    }

    // 2. Update display order for remaining supplementary images
    if (imageOrders && imageOrders.length > 0) {
      for (const item of imageOrders) {
        // Only update if it's a real supplementary image (not 'main-placeholder' or similar)
        if (item.imageId !== 'main-placeholder') {
          await connection.query(
            'UPDATE product_images SET display_order = ? WHERE id = ? AND product_id = ?',
            [item.displayOrder, item.imageId, productId]
          );
        }
      }
    }

    // 3. Set the main image in the Products table
    if (mainImageId) { // mainImageId will be the actual DB ID of the selected main image
      const [mainImageData] = await connection.query(
        'SELECT image_path FROM product_images WHERE id = ? AND product_id = ?',
        [mainImageId, productId]
      );

      if (mainImageData.length > 0) {
        // Update Products table with the S3 Key of the new main image
        await connection.query(
          'UPDATE Products SET image_Main_path = ? WHERE id = ?',
          [mainImageData[0].image_path, productId]
        );
      }
    } else {
      // If no mainImageId is provided (e.g., the original main image was deleted
      // and no other image was set as main), set the main image path to NULL.
      await connection.query(
        'UPDATE Products SET image_Main_path = NULL WHERE id = ?',
        [productId]
      );
    }

    // 4. Re-order supplementary images to ensure sequential display_order in DB
    // This helps maintain a clean display_order column after deletions/re-ordering
    await reorderDisplayOrder(productId, connection);

    await connection.commit(); // Commit the transaction
    res.json({ success: true, message: 'บันทึกการเปลี่ยนแปลงสำเร็จ!' });

  } catch (err) {
    await connection.rollback(); // Rollback on any error
    console.error('Save all changes error:', err);
    res.status(500).json({ error: err.message, message: 'เกิดข้อผิดพลาดในการบันทึกการเปลี่ยนแปลง' });
  } finally {
    releaseConnection(connection); // Release the connection
  }
};