import React, { useState, useEffect, useRef } from 'react';
import {
  Upload,
  Trash2,
  Save,
  X,
  Star,
  Image,
  GripVertical,
  Plus,
  Check,
  AlertCircle,
  ArrowUp,
  ArrowDown,
  Eye
} from 'lucide-react';

const ProductImageManager = () => {
  const [images, setImages] = useState([]); // Stores current images, including main image
  const [productId] = useState('1'); // You can change this or get from useParams
  const [draggedItem, setDraggedItem] = useState(null);
  const [dragOverItem, setDragOverItem] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [notification, setNotification] = useState(null);
  const [productData, setProductData] = useState({});

  // States to track changes for saving
  const [deletedImages, setDeletedImages] = useState(new Set()); // IDs of images marked for deletion
  const [mainImageId, setMainImageId] = useState(null); // The actual DB ID of the image set as main
  const [hasChanges, setHasChanges] = useState(false); // Flag to enable/disable save button

  const fileInputRef = useRef(null);
  const dropZoneRef = useRef(null);

  // --- Effect Hooks ---
  // Fetch product data and images on component mount or productId change
  useEffect(() => {
    fetchProductData();
    fetchImages();
  }, [productId]);

  // Effect to determine if there are unsaved changes
  useEffect(() => {
    // Check if current `images` array is different from fetched images (after re-ordering)
    // Check if `deletedImages` set is not empty
    // Check if `mainImageId` is different from original `productData.main_image_s3_key`
    // (This part can be complex if you want to track exact pixel-perfect changes.
    // For simplicity, we mark `hasChanges` true on any user interaction that modifies data)
    // The current setup already sets hasChanges to true on any modification, which is fine.
  }, [images, deletedImages, mainImageId, productData]);


  // --- Data Fetching ---
  const fetchProductData = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/images/getProductdata/${productId}`);
      if (!response.ok) throw new Error('Failed to fetch product data');
      const data = await response.json();
      setProductData(data);
      // Initialize mainImageId based on fetched product data (S3 Key)
      // We'll need to map S3 Key to actual image ID from product_images table if it exists there
      // For now, assume `mainImageId` state stores the DB ID.
      // We will adjust the logic for `mainImageId` when fetching images.
    } catch (err) {
      console.error('Error fetching product data:', err);
      showNotification('ไม่สามารถดึงข้อมูลสินค้าได้', 'error');
    }
  };

  const fetchImages = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/images/${productId}/images`);
      if (!response.ok) throw new Error('Failed to fetch images');
      const data = await response.json();

      if (data.success) {
        // Initialize images state with fetched data
        // Sort images based on display_order from backend
        const fetchedImages = data.images.sort((a, b) => a.display_order - b.display_order);

        setImages(fetchedImages.map((img, index) => ({
          ...img,
          display_order: index + 1, // Re-assign 1-based display order for frontend display
                                   // This ensures no gaps if images were deleted previously
        })));

        // Find and set the initial mainImageId (actual DB ID)
        const currentMainImage = fetchedImages.find(img => img.isMain);
        if (currentMainImage && currentMainImage.id !== 'main-placeholder') { // Exclude the temporary placeholder ID
          setMainImageId(currentMainImage.id);
        } else if (currentMainImage && currentMainImage.id === 'main-placeholder' && productData.main_image_s3_key) {
          // If the fetched main image is just a placeholder and we have an S3 key,
          // find the corresponding supplementary image ID if it exists.
          const actualMainImage = fetchedImages.find(img => img.image_path === currentMainImage.image_path && img.id !== 'main-placeholder');
          if (actualMainImage) {
            setMainImageId(actualMainImage.id);
          } else {
            // If main image is just from Products.image_Main_path and not in product_images,
            // its ID is null.
            setMainImageId(null);
          }
        } else {
           setMainImageId(null); // No main image initially
        }


        // Reset deleted images and changes on fresh fetch
        setDeletedImages(new Set());
        setHasChanges(false);

      }
    } catch (err) {
      console.error('Error fetching images:', err);
      showNotification('ไม่สามารถดึงรูปภาพได้', 'error');
    }
  };

  // --- UI Notifications ---
  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // --- File Selection & Upload ---
  const handleFileSelect = async (event) => {
    const files = Array.from(event.target.files);
    // Check if product data is loaded before allowing file selection
    if (!productData.category || !productData.subcategory) {
      showNotification('กรุณารอให้ข้อมูลสินค้าโหลดเสร็จก่อน', 'error');
      return;
    }

    if (files.length === 0) return;

    setSelectedFiles([]); // Clear selected files UI if you have one
    setIsUploading(true);

    const formData = new FormData();
    files.forEach(file => {
      formData.append('images', file); // 'images' must match backend's upload.array('images')
    });

    try {
      const response = await fetch(
        `http://localhost:5000/api/images/${productData.category}/${productData.subcategory}/${productId}/batch-upload`,
        {
          method: 'POST',
          body: formData
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Upload failed');
      }

      const result = await response.json();
      if (result.success) {
        showNotification(result.message || 'อัปโหลดรูปภาพสำเร็จ');
        // Re-fetch images to update the UI with new images and correct orders
        await fetchImages();
        setHasChanges(true); // Mark as changed, though new uploads typically save immediately
      } else {
        showNotification(result.message || 'อัปโหลดรูปภาพล้มเหลว', 'error');
      }
    } catch (err) {
      console.error('Upload error:', err);
      showNotification(err.message || 'เกิดข้อผิดพลาดในการอัปโหลด', 'error');
    } finally {
      setIsUploading(false);
      // Clear file input regardless of success/failure
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // --- Drag & Drop Handlers ---
  const handleDragStart = (e, item) => {
    setDraggedItem(item);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', item.id); // Set data for Firefox compatibility
  };

  const handleDragOver = (e, item) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverItem(item);
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
    setDragOverItem(null);
  };

  const handleDrop = (e, dropItem) => {
    e.preventDefault();
    e.stopPropagation();

    if (!draggedItem || draggedItem.id === dropItem.id) return;

    const newImages = [...images];
    const draggedIndex = newImages.findIndex(img => img.id === draggedItem.id);
    const dropIndex = newImages.findIndex(img => img.id === dropItem.id);

    const [removed] = newImages.splice(draggedIndex, 1);
    newImages.splice(dropIndex, 0, removed);

    // Re-assign display orders based on new visual order
    const updatedImages = newImages.map((img, index) => ({
      ...img,
      display_order: index + 1 // New display order based on current array position
    }));

    setImages(updatedImages);
    setDraggedItem(null);
    setDragOverItem(null);
    setHasChanges(true); // Mark changes for saving
    showNotification('ลำดับรูปภาพถูกเปลี่ยนแล้ว กรุณากดบันทึก', 'warning');
  };

  const handleFileDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!productData.category || !productData.subcategory) {
      showNotification('กรุณารอให้ข้อมูลสินค้าโหลดเสร็จก่อน', 'error');
      return;
    }

    const files = Array.from(e.dataTransfer.files);
    const imageFiles = files.filter(file => file.type.startsWith('image/'));

    if (imageFiles.length > 0) {
      // Call the same batch upload logic as handleFileSelect
      const formData = new FormData();
      imageFiles.forEach(file => {
        formData.append('images', file);
      });

      setIsUploading(true);
      fetch(
        `http://localhost:5000/api/images/${productData.category}/${productData.subcategory}/${productId}/batch-upload`,
        {
          method: 'POST',
          body: formData
        }
      )
        .then(response => {
          if (!response.ok) return response.json().then(err => { throw new Error(err.message || 'Upload failed'); });
          return response.json();
        })
        .then(result => {
          if (result.success) {
            showNotification(result.message || `อัปโหลด ${imageFiles.length} รูปภาพสำเร็จ`);
            fetchImages(); // Re-fetch images to update UI
            setHasChanges(true);
          } else {
            showNotification(result.message || 'เกิดข้อผิดพลาดในการอัปโหลด', 'error');
          }
        })
        .catch(err => {
          console.error('Drop upload error:', err);
          showNotification(err.message || 'เกิดข้อผิดพลาดในการอัปโหลด', 'error');
        })
        .finally(() => {
          setIsUploading(false);
        });
    }
  };

  // --- Image Manipulation Handlers ---
  const handleMoveUp = (imageId) => {
    const currentIndex = images.findIndex(img => img.id === imageId);
    if (currentIndex <= 0) return; // Cannot move main-placeholder up, or first item up

    const newImages = [...images];
    // Swap elements
    [newImages[currentIndex - 1], newImages[currentIndex]] = [newImages[currentIndex], newImages[currentIndex - 1]];

    // Re-assign display orders
    const updatedImages = newImages.map((img, index) => ({
      ...img,
      display_order: index + 1
    }));

    setImages(updatedImages);
    setHasChanges(true);
    showNotification('ลำดับรูปภาพถูกเปลี่ยนแล้ว กรุณากดบันทึก', 'warning');
  };

  const handleMoveDown = (imageId) => {
    const currentIndex = images.findIndex(img => img.id === imageId);
    if (currentIndex === -1 || currentIndex >= images.length - 1) return;

    const newImages = [...images];
    // Swap elements
    [newImages[currentIndex], newImages[currentIndex + 1]] = [newImages[currentIndex + 1], newImages[currentIndex]];

    // Re-assign display orders
    const updatedImages = newImages.map((img, index) => ({
      ...img,
      display_order: index + 1
    }));

    setImages(updatedImages);
    setHasChanges(true);
    showNotification('ลำดับรูปภาพถูกเปลี่ยนแล้ว กรุณากดบันทึก', 'warning');
  };

  const handleSetMain = (imageId) => {
    // Find the image by its ID (which is the actual DB ID, not 'main-placeholder')
    const imageToSetMain = images.find(img => img.id === imageId);

    if (!imageToSetMain || imageToSetMain.isMain) return; // Already main or not found

    // Update isMain flag in images state for display
    const updatedImages = images.map(img => {
      // If this is the new main image (matched by actual DB ID)
      if (img.id === imageToSetMain.id) {
        return { ...img, isMain: true };
      }
      // If this was the old main image placeholder
      if (img.isMain && img.id === 'main-placeholder') {
        return { ...img, isMain: false }; // Turn off old main image flag
      }
      return { ...img, isMain: false }; // Ensure other images are not main
    });

    // Move the newly set main image to the very first position (display_order 1)
    const newImagesArray = updatedImages.filter(img => img.id !== imageToSetMain.id);
    const finalImagesOrder = [{ ...imageToSetMain, isMain: true, display_order: 1 }, ...newImagesArray];

    // Re-assign display_order for all images based on new order
    const reorderedImages = finalImagesOrder.map((img, index) => ({
      ...img,
      display_order: index + 1
    }));

    setImages(reorderedImages);
    setMainImageId(imageId); // Store the actual DB ID as the main image ID
    setHasChanges(true);
    showNotification('รูปภาพหลักถูกเปลี่ยนแล้ว กรุณากดบันทึก', 'warning');
  };

  const handleDelete = (imageId) => {
    const imageToDelete = images.find(img => img.id === imageId);
    if (!imageToDelete) return;

    // Add to deletedImages set if it's a real DB image (not 'main-placeholder')
    if (imageId !== 'main-placeholder') {
      setDeletedImages(prev => new Set([...prev, imageId]));
    }

    // Remove from current images array for immediate UI update
    let newImages = images.filter(img => img.id !== imageId);

    // If the deleted image was the main image, handle promoting another image
    if (imageToDelete.isMain) {
      if (newImages.length > 0) {
        // Promote the first available image to be the new main image
        const newMain = newImages[0];
        newImages = newImages.map((img, idx) => ({
          ...img,
          isMain: (idx === 0) ? true : false,
          display_order: idx + 1 // Re-order after deletion
        }));
        setMainImageId(newMain.id !== 'main-placeholder' ? newMain.id : null); // Update mainImageId
      } else {
        // No images left, mainImageId should be null
        setMainImageId(null);
      }
    } else {
      // If a supplementary image was deleted, just re-order
      newImages = newImages.map((img, idx) => ({
        ...img,
        display_order: idx + 1
      }));
    }

    setImages(newImages);
    setHasChanges(true);
    showNotification('รูปภาพถูกลบแล้ว กรุณากดบันทึก', 'warning');
  };

  // --- Save Changes ---
  const handleSave = async () => {
    setIsUploading(true); // Using isUploading to indicate saving in UI

    try {
      // Prepare image order data for supplementary images only
      const imageOrders = images
        .filter(img => img.id !== 'main-placeholder' && !deletedImages.has(img.id)) // Filter out placeholder and deleted ones
        .map(img => ({
          imageId: img.id,
          displayOrder: img.display_order
        }));

      // Find the actual DB ID of the current main image
      const currentMain = images.find(img => img.isMain);
      const mainImageDbId = currentMain && currentMain.id !== 'main-placeholder' ? currentMain.id : null;

      const saveData = {
        imageOrders,
        mainImageId: mainImageDbId, // Send actual DB ID, or null
        deletedImages: Array.from(deletedImages).filter(id => id !== 'main-placeholder')
      };

      const response = await fetch(`http://localhost:5000/api/images/save-all/${productId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(saveData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Save failed');
      }

      const result = await response.json();

      if (result.success) {
        showNotification(result.message || 'บันทึกสำเร็จ!', 'success');
        // Reset change tracking states after successful save
        setDeletedImages(new Set());
        setHasChanges(false);
        // Re-fetch images to ensure UI reflects the latest state from DB
        await fetchImages();
      } else {
        showNotification(result.message || 'เกิดข้อผิดพลาดในการบันทึก', 'error');
      }

    } catch (error) {
      console.error('Save error:', error);
      showNotification(error.message || 'เกิดข้อผิดพลาดในการบันทึก', 'error');
    } finally {
      setIsUploading(false);
    }
  };

  // --- Image Card Component ---
  const ImageCard = ({ image, index }) => (
    <div
      className={`relative bg-white border-2 rounded-lg overflow-hidden transition-all duration-200 ${
        draggedItem?.id === image.id ? 'opacity-50' : ''
      } ${dragOverItem?.id === image.id ? 'border-blue-400 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}
      draggable
      onDragStart={(e) => handleDragStart(e, image)}
      onDragOver={(e) => handleDragOver(e, image)}
      onDragEnd={handleDragEnd}
      onDrop={(e) => handleDrop(e, image)}
    >
      {/* Main Image Badge */}
      {image.isMain && (
        <div className="absolute top-2 left-2 z-10">
          <div className="bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
            <Star size={12} fill="currentColor" />
            หลัก
          </div>
        </div>
      )}

      {/* Image */}
      <div className="aspect-square bg-gray-100 flex items-center justify-center">
        <img
          src={image.image_path}
          alt={`Product image ${index + 1}`}
          className="w-full h-full object-cover cursor-pointer"
          onClick={() => setPreviewImage(image.image_path)}
        />
      </div>

      {/* Controls */}
      <div className="p-3 bg-white">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-600">#{image.display_order}</span>
          <div className="flex items-center gap-1">
            <GripVertical size={16} className="text-gray-400 cursor-move" />
          </div>
        </div>

        <div className="flex items-center justify-between gap-2">
          {/* Move buttons */}
          <div className="flex gap-1">
            <button
              onClick={() => handleMoveUp(image.id)}
              disabled={index === 0 || image.id === 'main-placeholder'} // Can't move 'main-placeholder'
              className="p-1 text-gray-500 hover:text-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
              title="เลื่อนขึ้น"
            >
              <ArrowUp size={16} />
            </button>
            <button
              onClick={() => handleMoveDown(image.id)}
              disabled={index === images.length - 1 || image.id === 'main-placeholder'} // Can't move 'main-placeholder'
              className="p-1 text-gray-500 hover:text-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
              title="เลื่อนลง"
            >
              <ArrowDown size={16} />
            </button>
          </div>

          {/* Action buttons */}
          <div className="flex gap-1">
            {!image.isMain && (image.id !== 'main-placeholder') && ( // Cannot set placeholder as main
              <button
                onClick={() => handleSetMain(image.id)}
                className="p-1 text-gray-500 hover:text-yellow-600"
                title="ตั้งเป็นรูปหลัก"
              >
                <Star size={16} />
              </button>
            )}
            <button
              onClick={() => setPreviewImage(image.image_path)}
              className="p-1 text-gray-500 hover:text-blue-600"
              title="ดูรูปภาพ"
            >
              <Eye size={16} />
            </button>
            <button
              onClick={() => handleDelete(image.id)}
              disabled={images.length === 1 && image.isMain} // Disable delete if only one image and it's main
              className="p-1 text-gray-500 hover:text-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
              title="ลบรูปภาพ"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">จัดการรูปภาพสินค้า</h1>
        {productData.name && (
          <p className="text-gray-600">
            {productData.name} - {productData.category} / {productData.subcategory}
          </p>
        )}
      </div>

      {/* Notification */}
      {notification && (
        <div className={`mb-4 p-4 rounded-lg border ${
          notification.type === 'error'
            ? 'bg-red-50 border-red-200 text-red-700'
            : notification.type === 'warning'
              ? 'bg-yellow-50 border-yellow-200 text-yellow-700'
              : 'bg-green-50 border-green-200 text-green-700'
        }`}>
          <div className="flex items-center gap-2">
            {notification.type === 'error' && <AlertCircle size={20} />}
            {notification.type === 'warning' && <AlertCircle size={20} className="text-yellow-500" />}
            {notification.type === 'success' && <Check size={20} className="text-green-500" />}
            {notification.message}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          {/* Upload button */}
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading || !productData.category || !productData.subcategory}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Upload size={20} />
            {isUploading ? 'กำลังอัปโหลด...' : !productData.category ? 'กำลังโหลดข้อมูล...' : 'เพิ่มรูปภาพ'}
          </button>

          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />

          {/* Image count */}
          <span className="text-gray-600">
            รูปภาพทั้งหมด: {images.filter(img => img.id !== 'main-placeholder').length} รูป
          </span>
        </div>

        {/* Save button */}
        {hasChanges && (
          <button
            onClick={handleSave}
            disabled={isUploading}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
          >
            <Save size={20} />
            {isUploading ? 'กำลังบันทึก...' : 'บันทึกการเปลี่ยนแปลง'}
          </button>
        )}
      </div>

      {/* Drop zone */}
      <div
        ref={dropZoneRef}
        onDragEnter={(e) => { e.preventDefault(); e.stopPropagation(); }}
        onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
        onDragLeave={(e) => { e.preventDefault(); e.stopPropagation(); }}
        onDrop={handleFileDrop}
        className="border-2 border-dashed border-gray-300 rounded-lg p-8 mb-6 text-center hover:border-gray-400 transition-colors"
      >
        <div className="flex flex-col items-center gap-2">
          <Image size={48} className="text-gray-400" />
          <p className="text-gray-600">ลากและวางรูปภาพที่นี่ หรือคลิกปุ่ม "เพิ่มรูปภาพ"</p>
          <p className="text-sm text-gray-500">รองรับไฟล์ JPG, PNG, GIF</p>
        </div>
      </div>

      {/* Images Grid */}
      {images.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((image, index) => (
            // Only render actual images, filter out main-placeholder if it's not needed for rendering
            // The isMain flag will dictate which is main.
            <ImageCard key={image.id} image={image} index={index} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-gray-500">
          <Image size={64} className="mx-auto mb-4 text-gray-300" />
          <p>ยังไม่มีรูปภาพ</p>
          <p className="text-sm">เพิ่มรูปภาพแรกเพื่อเริ่มต้น</p>
        </div>
      )}

      {/* Image Preview Modal */}
      {previewImage && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="relative max-w-4xl max-h-full">
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute top-4 right-4 z-10 p-2 bg-white rounded-full shadow-lg hover:bg-gray-100"
              title="ปิด"
            >
              <X size={24} />
            </button>
            <img
              src={previewImage}
              alt="Preview"
              className="max-w-full max-h-full object-contain rounded-lg"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductImageManager;