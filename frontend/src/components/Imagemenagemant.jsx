import React, { useState, useEffect, useRef } from 'react';
import { 
  Upload, 
  Trash2, 
  Save, 
  X, 
  Star, 
  Image as ImageIcon,
  GripVertical,
  Plus,
  Check,
  AlertCircle,
  ArrowUp,
  ArrowDown,
  Eye
} from 'lucide-react';
import { useParams } from 'react-router-dom';
const ProductImageManager = () => {
    const [images, setImages] = useState([]);
    const {productId}= useParams();
       useEffect(() => {
        fetch(`http://localhost:5000/api/images/${productId}/images`)
          .then(res => res.json())
          .then(data => setImages(data.images))
          .catch(err => console.error('Error fetching categories:', err));
      }, [productId]);
      
//   const [images, setImages] = useState([
//     {
//       id: 1,
//       image_path: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400',
//       display_order: 1,
//       isMain: true
//     },
//     {
//       id: 2,
//       image_path: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400',
//       display_order: 2,
//       isMain: false
//     },
//     {
//       id: 3,
//       image_path: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400',
//       display_order: 3,
//       isMain: false
//     },
//     {
//       id: 4,
//       image_path: 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=400',
//       display_order: 4,
//       isMain: false
//     }
//   ]);
  
  const [draggedItem, setDraggedItem] = useState(null);
  const [dragOverItem, setDragOverItem] = useState(null);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [notification, setNotification] = useState(null);
  const fileInputRef = useRef(null);
  const dropZoneRef = useRef(null);
  const [productData,setProductData] = useState({}) ;

  // Mock product data
 useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  fetch(`http://localhost:5000/api/images/getProductdata/${productId}`)
    .then(res => res.json())
    .then(data => setProductData(data))
    .catch(err => console.error('Error fetching categories:', err));
}, [productId]);
  useEffect(() => {
    // Simulate loading images
    console.log('Loading images for product:', productData.id);
  }, []);

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleFileSelect = (event) => {
    const files = Array.from(event.target.files);
    setSelectedFiles(files);
    
    // Create preview URLs
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const newImage = {
          id: Date.now() + Math.random(),
          image_path: e.target.result,
          display_order: images.length + 1,
          isMain: images.length === 0,
          file: file, // Store file for upload
          isNew: true
        };
        setImages(prev => [...prev, newImage]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleDragStart = (e, item) => {
    setDraggedItem(item);
    e.dataTransfer.effectAllowed = 'move';
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
    
    if (!draggedItem || draggedItem.id === dropItem.id) return;

    const draggedIndex = images.findIndex(img => img.id === draggedItem.id);
    const dropIndex = images.findIndex(img => img.id === dropItem.id);
    
    const newImages = [...images];
    const [draggedImage] = newImages.splice(draggedIndex, 1);
    newImages.splice(dropIndex, 0, draggedImage);
    
    // Update display orders
    const updatedImages = newImages.map((img, index) => ({
      ...img,
      display_order: index + 1
    }));
    
    setImages(updatedImages);
    setDraggedItem(null);
    setDragOverItem(null);
    
    showNotification('ลำดับรูปภาพถูกเปลี่ยนแล้ว');
  };

  const handleMoveUp = (imageId) => {
    const currentIndex = images.findIndex(img => img.id === imageId);
    if (currentIndex === 0) return;
    
    const newImages = [...images];
    [newImages[currentIndex - 1], newImages[currentIndex]] = [newImages[currentIndex], newImages[currentIndex - 1]];
    
    const updatedImages = newImages.map((img, index) => ({
      ...img,
      display_order: index + 1
    }));
    
    setImages(updatedImages);
  };

  const handleMoveDown = (imageId) => {
    const currentIndex = images.findIndex(img => img.id === imageId);
    if (currentIndex === images.length - 1) return;
    
    const newImages = [...images];
    [newImages[currentIndex], newImages[currentIndex + 1]] = [newImages[currentIndex + 1], newImages[currentIndex]];
    
    const updatedImages = newImages.map((img, index) => ({
      ...img,
      display_order: index + 1
    }));
    
    setImages(updatedImages);
  };

  const handleSetMain = (imageId) => {
    const updatedImages = images.map(img => ({
      ...img,
      isMain: img.id === imageId
    }));
    setImages(updatedImages);
    showNotification('รูปภาพหลักถูกเปลี่ยนแล้ว');
  };

  const handleDelete = (imageId) => {
    const imageToDelete = images.find(img => img.id === imageId);
    if (imageToDelete?.isMain && images.length > 1) {
      // Set the next image as main
      const otherImages = images.filter(img => img.id !== imageId);
      const newMainImage = otherImages[0];
      const updatedImages = otherImages.map(img => ({
        ...img,
        isMain: img.id === newMainImage.id
      }));
      setImages(updatedImages);
    } else {
      setImages(images.filter(img => img.id !== imageId));
    }
    showNotification('รูปภาพถูกลบแล้ว', 'success');
  };

  const handleSave = async () => {
    setIsUploading(true);
    
    try {
      // Simulate API calls
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Here you would make actual API calls to:
      // 1. Upload new images
      // 2. Update image orders
      // 3. Set main image
      
      console.log('Saving images:', images);
      showNotification('บันทึกสำเร็จ!', 'success');
      
      // Remove isNew flag from images
      const savedImages = images.map(img => ({ ...img, isNew: false }));
      setImages(savedImages);
      
    } catch (error) {
      showNotification('เกิดข้อผิดพลาดในการบันทึก', 'error');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleFileDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const files = Array.from(e.dataTransfer.files);
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    
    if (imageFiles.length > 0) {
      setSelectedFiles(imageFiles);
      imageFiles.forEach(file => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const newImage = {
            id: Date.now() + Math.random(),
            image_path: e.target.result,
            display_order: images.length + 1,
            isMain: images.length === 0,
            file: file,
            isNew: true
          };
          setImages(prev => [...prev, newImage]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  return (
    <div className="mt-15 min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-white">
      {/* Header */}
      <div className="bg-gray-900/80 backdrop-blur-sm border-b border-gray-700/50 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              จัดการรูปภาพสินค้า
            </h1>
            <p className="text-gray-400 mt-1">{productData.name}</p>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 rounded-xl transition-all duration-200 shadow-lg hover:shadow-blue-500/25"
            >
              <Plus size={18} />
              เพิ่มรูปภาพ
            </button>
            
            <button
              onClick={handleSave}
              disabled={isUploading}
              className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:from-gray-600 disabled:to-gray-700 rounded-xl transition-all duration-200 shadow-lg hover:shadow-green-500/25 disabled:cursor-not-allowed"
            >
              {isUploading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Save size={18} />
              )}
              {isUploading ? 'กำลังบันทึก...' : 'บันทึก'}
            </button>
          </div>
        </div>
      </div>

      {/* Notification */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg backdrop-blur-sm transition-all duration-300 ${
          notification.type === 'success' 
            ? 'bg-green-600/90 text-white' 
            : 'bg-red-600/90 text-white'
        }`}>
          {notification.type === 'success' ? <Check size={18} /> : <AlertCircle size={18} />}
          {notification.message}
        </div>
      )}

      <div className="p-6">
        {/* Drop Zone */}
        <div
          ref={dropZoneRef}
          onDragEnter={handleDragEnter}
          onDragOver={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDrop={handleFileDrop}
          className="border-2 border-dashed border-gray-600 hover:border-blue-500 rounded-2xl p-8 mb-6 transition-all duration-200 bg-gray-900/30 backdrop-blur-sm"
        >
          <div className="text-center">
            <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-300 mb-2">ลากและวางไฟล์รูปภาพที่นี่</p>
            <p className="text-gray-500 text-sm">หรือ</p>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="mt-2 px-6 py-2 bg-gray-700 hover:bg-gray-600 rounded-xl transition-colors"
            >
              เลือกไฟล์
            </button>
          </div>
        </div>

        {/* Images Grid */}
        {images.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {images.map((image, index) => (
              <div
                key={image.id}
                draggable
                onDragStart={(e) => handleDragStart(e, image)}
                onDragOver={(e) => handleDragOver(e, image)}
                onDrop={(e) => handleDrop(e, image)}
                onDragEnd={handleDragEnd}
                className={`relative group bg-gray-900/50 backdrop-blur-sm rounded-2xl overflow-hidden border-2 transition-all duration-300 cursor-move hover:shadow-2xl hover:shadow-blue-500/20 ${
                  dragOverItem?.id === image.id ? 'border-blue-500 scale-105' : 'border-gray-700'
                } ${
                  image.isMain ? 'ring-2 ring-yellow-500/50' : ''
                } ${
                  image.isNew ? 'ring-2 ring-green-500/50' : ''
                }`}
              >
                {/* Main Image Badge */}
                {image.isMain && (
                  <div className="absolute top-3 left-3 z-10 flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-xs font-semibold rounded-full shadow-lg">
                    <Star size={12} />
                    หลัก
                  </div>
                )}

                {/* New Image Badge */}
                {image.isNew && (
                  <div className="absolute top-3 right-3 z-10 px-2 py-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs font-semibold rounded-full shadow-lg">
                    ใหม่
                  </div>
                )}

                {/* Order Number */}
                <div className="absolute bottom-3 left-3 z-10 w-8 h-8 bg-gray-900/80 backdrop-blur-sm rounded-full flex items-center justify-center text-white font-bold text-sm border border-gray-600">
                  {image.display_order}
                </div>

                {/* Image */}
                <div className="aspect-square relative overflow-hidden">
                  <img
                    src={image.image_path}
                    alt={`Product image ${image.display_order}`}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/400x400/374151/9CA3AF?text=No+Image';
                    }}
                  />
                  
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>

                {/* Controls */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="flex items-center gap-2 bg-gray-900/90 backdrop-blur-sm rounded-xl p-2 shadow-lg border border-gray-700">
                    {/* Move Up */}
                    <button
                      onClick={() => handleMoveUp(image.id)}
                      disabled={index === 0}
                      className="p-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg transition-colors"
                      title="เลื่อนขึ้น"
                    >
                      <ArrowUp size={16} />
                    </button>

                    {/* Move Down */}
                    <button
                      onClick={() => handleMoveDown(image.id)}
                      disabled={index === images.length - 1}
                      className="p-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg transition-colors"
                      title="เลื่อนลง"
                    >
                      <ArrowDown size={16} />
                    </button>

                    {/* Set as Main */}
                    {!image.isMain && (
                      <button
                        onClick={() => handleSetMain(image.id)}
                        className="p-2 bg-yellow-600 hover:bg-yellow-700 rounded-lg transition-colors"
                        title="ตั้งเป็นรูปหลัก"
                      >
                        <Star size={16} />
                      </button>
                    )}

                    {/* Preview */}
                    <button
                      onClick={() => setPreviewImage(image)}
                      className="p-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
                      title="ดูตัวอย่าง"
                    >
                      <Eye size={16} />
                    </button>

                    {/* Delete */}
                    <button
                      onClick={() => handleDelete(image.id)}
                      className="p-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
                      title="ลบรูปภาพ"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                {/* Drag Handle */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                  <GripVertical size={24} className="text-white drop-shadow-lg" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <ImageIcon className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-300 mb-2">ยังไม่มีรูปภาพ</h3>
            <p className="text-gray-500 mb-4">เริ่มเพิ่มรูปภาพสินค้าของคุณ</p>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-xl transition-all"
            >
              เพิ่มรูปภาพแรก
            </button>
          </div>
        )}

        {/* Instructions */}
        <div className="mt-8 bg-gray-900/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700">
          <h3 className="text-lg font-semibold mb-4 text-gray-200">คำแนะนำการใช้งาน</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-400">
            <div className="flex items-start gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
              <span>ลากและวางรูปภาพเพื่อเปลี่ยนลำดับ</span>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></div>
              <span>คลิกดาวเพื่อตั้งเป็นรูปหลัก</span>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
              <span>รองรับไฟล์ JPG, PNG, WebP</span>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
              <span>ขนาดไฟล์สูงสุด 5MB ต่อรูป</span>
            </div>
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      {previewImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="relative max-w-4xl max-h-[90vh] m-4">
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute -top-4 -right-4 p-2 bg-gray-900 hover:bg-gray-800 rounded-full transition-colors z-10"
            >
              <X size={20} />
            </button>
            <img
              src={previewImage.image_path}
              alt="Preview"
              className="max-w-full max-h-full object-contain rounded-2xl shadow-2xl"
            />
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-gray-900/90 backdrop-blur-sm rounded-xl px-4 py-2 border border-gray-700">
              <p className="text-white text-sm">รูปที่ {previewImage.display_order}</p>
            </div>
          </div>
        </div>
      )}

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
};

export default ProductImageManager;