import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
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
  Eye,
  Loader,
  Menu,
  Home
} from 'lucide-react';

const WorksImageManager = () => {
  const [images, setImages] = useState([]);
  const [workData, setWorkData] = useState({});
  const [draggedItem, setDraggedItem] = useState(null);
  const [dragOverItem, setDragOverItem] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [notification, setNotification] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const fileInputRef = useRef(null);
  const dropZoneRef = useRef(null);
       const apiBaseUrl = 'http://localhost:5000';
  // Mock workId, category, subcategory - ในการใช้งานจริงจะได้จาก URL params
  const {workId,categoryId,subcategoryId} = useParams();


  // โหลดข้อมูลเมื่อเริ่มต้น
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    loadWorkData();
    loadImages();
  }, []);

  // โหลดข้อมูล Work
  const loadWorkData = async () => {
    try {
      const response = await fetch(`${apiBaseUrl}/api/works/works/${workId}`);
      const data = await response.json();
      console.log(data)
      setWorkData(data);
    } catch (err) {
      console.error('Error fetching work data:', err);
      showNotification('ไม่สามารถโหลดข้อมูลงานได้', 'error');
    }
  };

  // โหลดรูปภาพทั้งหมด
  const loadImages = async () => {
    try {
      const response = await fetch(`${apiBaseUrl}/api/images/works/${workId}/images`);
      const data = await response.json();
      if (data.success) {
        // Ensure main image is always first, then sort others by display_order
        const mainImg = data.images.find(img => img.isMain);
        const otherImgs = data.images.filter(img => !img.isMain).sort((a, b) => a.display_order - b.display_order);
        setImages(mainImg ? [mainImg, ...otherImgs] : otherImgs);
      }
    } catch (err) {
      console.error('Error fetching images:', err);
      showNotification('ไม่สามารถโหลดรูปภาพได้', 'error');
    }
  };

  // แสดงการแจ้งเตือน
  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // อัปโหลดรูปภาพไปยัง API
  const uploadImageToAPI = async (file) => {
    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await fetch(
        `${apiBaseUrl}/api/images/works/upload/${workId}`,
        {
          method: 'POST',
          body: formData,
          // Multer handles Content-Type for formData
        }
      );

      const result = await response.json();
      if (result.success) {
        return result;
      } else {
        throw new Error(result.error || 'Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      throw error;
    }
  };

  // จัดการการเลือกไฟล์
  const handleFileSelect = async (event) => {
    const files = Array.from(event.target.files);
    await handleFilesUpload(files);
    // Clear the input after selection to allow re-uploading the same file
    event.target.value = '';
  };

  // จัดการการอัปโหลดไฟล์
  const handleFilesUpload = async (files) => {
    if (files.length === 0) return;

    setIsUploading(true);
    const uploadedImages = [];
    const filesToProcess = files.map(file => ({
      file,
      id: `upload-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`, // Unique ID for temp images
      previewUrl: URL.createObjectURL(file)
    }));

    // Add temporary images to state immediately for visual feedback
    setImages(prev => [
      ...prev,
      ...filesToProcess.map((temp, i) => ({
        id: temp.id,
        image_path: temp.previewUrl,
        display_order: prev.length + i + 1, // Temporary order
        isMain: prev.length === 0 && i === 0, // First uploaded image becomes main if no others exist
        isUploading: true,
        file: temp.file
      }))
    ]);

    for (const tempFile of filesToProcess) {
      try {
        const result = await uploadImageToAPI(tempFile.file);

        // Update the temporary image with actual server data
        setImages(prev => prev.map(img =>
          img.id === tempFile.id
            ? {
              id: result.imageId,
              image_path: result.imagePath,
              display_order: result.displayOrder,
              isMain: result.displayOrder === 1, // Backend determines if it's main (display_order 1)
              isUploading: false
            }
            : img
        ));
        uploadedImages.push(result);
        URL.revokeObjectURL(tempFile.previewUrl); // Clean up the Blob URL

      } catch (error) {
        console.error('Upload failed for file:', tempFile.file.name, error);
        // Remove the failed temporary image
        setImages(prev => prev.filter(img => img.id !== tempFile.id));
        URL.revokeObjectURL(tempFile.previewUrl); // Clean up the Blob URL
        showNotification(`ไม่สามารถอัปโหลด ${tempFile.file.name} ได้: ${error.message}`, 'error');
      }
    }

    if (uploadedImages.length > 0) {
      showNotification(`อัปโหลดรูปภาพสำเร็จ ${uploadedImages.length} รูป`, 'success');
      await loadImages(); // Reload images to get correct order and main status from backend
    }

    setIsUploading(false);
  };


  // Drag and Drop handlers
  const handleDragStart = (e, item) => {
    if (item.isUploading) {
      e.preventDefault();
      return;
    }
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

    if (!draggedItem || draggedItem.id === dropItem.id || draggedItem.isUploading || dropItem.isUploading) return;

    const draggedIndex = images.findIndex(img => img.id === draggedItem.id);
    const dropIndex = images.findIndex(img => img.id === dropItem.id);

    const newImages = [...images];
    const [draggedImage] = newImages.splice(draggedIndex, 1);
    newImages.splice(dropIndex, 0, draggedImage);

    // Reassign display_order based on new array index
    const updatedImages = newImages.map((img, index) => ({
      ...img,
      display_order: index + 1 // display_order starts from 1
    }));

    setImages(updatedImages);
    setDraggedItem(null);
    setDragOverItem(null);

    showNotification('ลำดับรูปภาพถูกเปลี่ยนแล้ว (โปรดบันทึก)');
  };

  // เลื่อนรูปขึ้น/ลง
  const handleMoveUp = (imageId) => {
    const currentIndex = images.findIndex(img => img.id === imageId);
    if (currentIndex <= 0) return; // Cannot move up if it's the first or not found

    const newImages = [...images];
    [newImages[currentIndex - 1], newImages[currentIndex]] = [newImages[currentIndex], newImages[currentIndex - 1]];

    const updatedImages = newImages.map((img, index) => ({
      ...img,
      display_order: index + 1
    }));

    setImages(updatedImages);
    showNotification('เลื่อนรูปภาพขึ้นแล้ว (โปรดบันทึก)');
  };

  const handleMoveDown = (imageId) => {
    const currentIndex = images.findIndex(img => img.id === imageId);
    if (currentIndex === -1 || currentIndex >= images.length - 1) return; // Cannot move down if last or not found

    const newImages = [...images];
    [newImages[currentIndex], newImages[currentIndex + 1]] = [newImages[currentIndex + 1], newImages[currentIndex]];

    const updatedImages = newImages.map((img, index) => ({
      ...img,
      display_order: index + 1
    }));

    setImages(updatedImages);
    showNotification('เลื่อนรูปภาพลงแล้ว (โปรดบันทึก)');
  };

  // ตั้งรูปหลัก
  const handleSetMain = async (imageId) => {
    const imageToSetMain = images.find(img => img.id === imageId);
    if (!imageToSetMain || imageToSetMain.isMain) return; // Already main or not found

    // Optimistically update UI
    setImages(prevImages => prevImages.map(img => ({
      ...img,
      isMain: img.id === imageId // Set the selected image as main, others as not main
    })));

    showNotification('กำลังเปลี่ยนรูปภาพหลัก...');

    try {
      const response = await fetch(`${apiBaseUrl}/api/images/works/${workId}/set-main`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageId: imageId, isMain: true }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to set main image');
      }

      await loadImages(); // Reload to ensure true state from backend
      showNotification('รูปภาพหลักถูกเปลี่ยนสำเร็จแล้ว!', 'success');
    } catch (error) {
      console.error('Error setting main image:', error);
      showNotification(`ไม่สามารถเปลี่ยนรูปภาพหลักได้: ${error.message}`, 'error');
      await loadImages(); // Revert to original state if API call fails
    }
  };

  // ลบรูปภาพ
  const handleDelete = async (imageId) => {
    const imageToDelete = images.find(img => img.id === imageId);

    if (imageToDelete?.isUploading) {
      // If it's a temporary uploading image, just remove from local state
      setImages(images.filter(img => img.id !== imageId));
      showNotification('ยกเลิกการอัปโหลดและลบรูปภาพชั่วคราวแล้ว');
      return;
    }

    if (!window.confirm('คุณต้องการลบรูปภาพนี้หรือไม่?')) {
      return;
    }

    showNotification('กำลังลบรูปภาพ...');
    try {
      const response = await fetch(
        `${apiBaseUrl}/api/images/works/delete/${categoryId}/${subcategoryId}/${workId}/${imageId}`,
        { method: 'DELETE' }
      );

      const result = await response.json();
      if (result.success) {
        await loadImages(); // Reload images to get updated order from backend
        showNotification('รูปภาพถูกลบแล้ว', 'success');
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Delete error:', error);
      showNotification(`ไม่สามารถลบรูปภาพได้: ${error.message}`, 'error');
    }
  };

  // บันทึกลำดับรูปภาพ
  const handleSave = async () => {
    setIsSaving(true);

    try {
      // Filter out temporary uploading images before sending to backend
      const imageOrders = images
        .filter(img => !img.isUploading)
        .map(img => ({
          imageId: img.id,
          displayOrder: img.display_order
        }));

      const response = await fetch(`${apiBaseUrl}/api/images/works/reorder/${workId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ imageOrders }),
      });

      const result = await response.json();
      if (result.success) {
        showNotification('บันทึกลำดับรูปภาพสำเร็จ!', 'success');
        await loadImages(); // Reload to ensure full consistency
      } else {
        throw new Error(result.error);
      }

    } catch (error) {
      console.error('Save error:', error);
      showNotification('เกิดข้อผิดพลาดในการบันทึก: ' + error.message, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // File drop handlers
  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    dropZoneRef.current.classList.add('border-blue-500', 'scale-105');
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    dropZoneRef.current.classList.remove('border-blue-500', 'scale-105');
  };

  const handleFileDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    dropZoneRef.current.classList.remove('border-blue-500', 'scale-105');

    const files = Array.from(e.dataTransfer.files);
    const imageFiles = files.filter(file => file.type.startsWith('image/'));

    if (imageFiles.length > 0) {
      await handleFilesUpload(imageFiles);
    } else {
      showNotification('โปรดวางไฟล์รูปภาพเท่านั้น', 'error');
    }
  };

  // สร้าง image URL
  const getImageUrl = (imagePath) => {
    if (imagePath.startsWith('works')){
      return   "https://cdn.toteja.co/"+imagePath; // For temporary local previews
    }
    // Encode the imagePath because it's part of the URL path for backend
    return `${apiBaseUrl}/api/images/works/view/${encodeURIComponent(imagePath)}`;
  };

  return (
    <div className="mt-15 min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      {/* Mobile Header */}
      <div className="lg:hidden sticky top-0 z-40 bg-slate-900/90 backdrop-blur-sm border-b border-slate-700/50 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
            >
              <Menu size={20} />
            </button>
            <h1 className="text-lg font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              จัดการรูปภาพงาน
            </h1>
          </div>
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="p-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 rounded-lg transition-colors"
          >
            <Plus size={18} />
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="mt-3 pt-3 border-t border-slate-700/50">
            <div className="flex flex-col gap-2">
              <p className="text-sm text-slate-400 truncate">{workData.name || 'Loading work data...'}</p>
              <div className="flex gap-2">
                <button
                  onClick={handleSave}
                  disabled={isSaving || isUploading}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 rounded-lg transition-colors text-sm"
                >
                  {isSaving ? <Loader size={16} className="animate-spin" /> : <Save size={16} />}
                  {isSaving ? 'กำลังบันทึก...' : 'บันทึก'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Desktop Header */}
      <div className="hidden lg:block sticky top-0 z-40 bg-slate-900/80 backdrop-blur-sm border-b border-slate-700/50 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              จัดการรูปภาพงาน
            </h1>
            <p className="text-slate-400 mt-1">{workData.name || 'Loading work data...'}</p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-gray-600 disabled:to-gray-700 rounded-xl transition-all duration-200 shadow-lg hover:shadow-blue-500/25 disabled:cursor-not-allowed"
            >
              {isUploading ? <Loader size={18} className="animate-spin" /> : <Plus size={18} />}
              {isUploading ? 'กำลังอัปโหลด...' : 'เพิ่มรูปภาพ'}
            </button>

            <button
              onClick={handleSave}
              disabled={isSaving || isUploading}
              className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:from-gray-600 disabled:to-gray-700 rounded-xl transition-all duration-200 shadow-lg hover:shadow-green-500/25 disabled:cursor-not-allowed"
            >
              {isSaving ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Save size={18} />
              )}
              {isSaving ? 'กำลังบันทึก...' : 'บันทึกลำดับ'}
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
          <span className="text-sm">{notification.message}</span>
        </div>
      )}

      <div className="p-4 lg:p-6">
        {/* Hidden file input */}
        <input
          type="file"
          ref={fileInputRef}
          multiple
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />

        {/* Drop Zone */}
        <div
          ref={dropZoneRef}
          onDragEnter={handleDragEnter}
          onDragOver={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDrop={handleFileDrop}
          className="border-2 border-dashed border-slate-600 hover:border-blue-500 rounded-2xl p-6 lg:p-8 mb-6 transition-all duration-200 bg-slate-900/30 backdrop-blur-sm"
        >
          <div className="text-center">
            <Upload className="mx-auto h-10 w-10 lg:h-12 lg:w-12 text-slate-400 mb-4" />
            <p className="text-slate-300 mb-2 text-sm lg:text-base">ลากและวางไฟล์รูปภาพที่นี่</p>
            <p className="text-slate-500 text-xs lg:text-sm mb-3">หรือ</p>
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="px-4 py-2 lg:px-6 lg:py-2 bg-slate-700 hover:bg-slate-600 disabled:bg-slate-800 rounded-xl transition-colors disabled:cursor-not-allowed text-sm lg:text-base"
            >
              {isUploading ? 'กำลังอัปโหลด...' : 'เลือกไฟล์'}
            </button>
          </div>
        </div>

        {/* Images Grid */}
        {images.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
            {images.map((image, index) => (
              <div
                key={image.id}
                draggable={!image.isUploading}
                onDragStart={(e) => handleDragStart(e, image)}
                onDragOver={(e) => handleDragOver(e, image)}
                onDrop={(e) => handleDrop(e, image)}
                onDragEnd={handleDragEnd}
                className={`relative group bg-slate-900/50 backdrop-blur-sm rounded-2xl overflow-hidden border-2 transition-all duration-300 ${
                  image.isUploading ? 'cursor-not-allowed' : 'cursor-grab'
                } hover:shadow-2xl hover:shadow-blue-500/20 ${
                  dragOverItem?.id === image.id ? 'border-blue-500 scale-105' : 'border-slate-700'
                } ${
                  image.isMain ? 'ring-2 ring-yellow-500/50' : ''
                }`}
              >
                {/* Loading Overlay */}
                {image.isUploading && (
                  <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-20 flex items-center justify-center">
                    <div className="text-center">
                      <Loader className="animate-spin mx-auto mb-2 text-white" size={24} />
                      <p className="text-sm text-white">กำลังอัปโหลด...</p>
                    </div>
                  </div>
                )}

                {/* Main Image Badge */}
                {image.isMain && (
                  <div className="absolute top-2 left-2 lg:top-3 lg:left-3 z-10 flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-xs font-semibold rounded-full shadow-lg">
                    <Star size={10} />
                    หลัก
                  </div>
                )}

                {/* Order Number */}
                <div className="absolute bottom-2 left-2 lg:bottom-3 lg:left-3 z-10 w-6 h-6 lg:w-8 lg:h-8 bg-slate-900/80 backdrop-blur-sm rounded-full flex items-center justify-center text-white font-bold text-xs lg:text-sm border border-slate-600">
                  {index + 1}
                </div>

                {/* Image */}
                <div className="aspect-square relative overflow-hidden">
                  <img
                    src={getImageUrl(image.image_path)}
                    alt={`Work image ${image.display_order}`}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/400x400/374151/9CA3AF?text=No+Image';
                      e.target.alt = 'Image not found'; // Fallback alt text
                    }}
                  />

                  {/* Overlay */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>

                {/* Mobile Controls */}
                <div className="lg:hidden absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleMoveUp(image.id)}
                        disabled={index === 0 || image.isUploading}
                        className="p-1.5 bg-blue-600/80 hover:bg-blue-700/80 disabled:bg-gray-600/80 disabled:cursor-not-allowed rounded-lg transition-colors"
                      >
                        <ArrowUp size={14} />
                      </button>
                      <button
                        onClick={() => handleMoveDown(image.id)}
                        disabled={index === images.length - 1 || image.isUploading}
                        className="p-1.5 bg-blue-600/80 hover:bg-blue-700/80 disabled:bg-gray-600/80 disabled:cursor-not-allowed rounded-lg transition-colors"
                      >
                        <ArrowDown size={14} />
                      </button>
                    </div>

                    <div className="flex gap-1">
                      {!image.isMain && !image.isUploading && (
                        <button
                          onClick={() => handleSetMain(image.id)}
                          className="p-1.5 bg-yellow-600/80 hover:bg-yellow-700/80 rounded-lg transition-colors"
                        >
                          <Star size={14} />
                        </button>
                      )}
                      <button
                        onClick={() => setPreviewImage(image)}
                        disabled={image.isUploading}
                        className="p-1.5 bg-purple-600/80 hover:bg-purple-700/80 disabled:bg-gray-600/80 rounded-lg transition-colors"
                      >
                        <Eye size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(image.id)}
                        className="p-1.5 bg-red-600/80 hover:bg-red-700/80 rounded-lg transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Desktop Controls */}
                {!image.isUploading && (
                  <div className="hidden lg:flex absolute inset-0 items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="flex items-center gap-2 bg-slate-900/90 backdrop-blur-sm rounded-xl p-2 shadow-lg border border-slate-700">
                      <button
                        onClick={() => handleMoveUp(image.id)}
                        disabled={index === 0}
                        className="p-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg transition-colors"
                        title="เลื่อนขึ้น"
                      >
                        <ArrowUp size={16} />
                      </button>

                      <button
                        onClick={() => handleMoveDown(image.id)}
                        disabled={index === images.length - 1}
                        className="p-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg transition-colors"
                        title="เลื่อนลง"
                      >
                        <ArrowDown size={16} />
                      </button>

                      {!image.isMain && (
                        <button
                          onClick={() => handleSetMain(image.id)}
                          className="p-2 bg-yellow-600 hover:bg-yellow-700 rounded-lg transition-colors"
                          title="ตั้งเป็นรูปหลัก"
                        >
                          <Star size={16} />
                        </button>
                      )}

                      <button
                        onClick={() => setPreviewImage(image)}
                        className="p-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
                        title="ดูตัวอย่าง"
                      >
                        <Eye size={16} />
                      </button>

                      <button
                        onClick={() => handleDelete(image.id)}
                        className="p-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
                        title="ลบรูปภาพ"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-10 text-slate-500">
            <ImageIcon className="mx-auto h-16 w-16 mb-4" />
            <p className="text-xl">ยังไม่มีรูปภาพ</p>
            <p className="text-sm mt-2">โปรดลากและวางหรือเลือกไฟล์เพื่อเพิ่มรูปภาพ</p>
          </div>
        )}
      </div>

      {/* Preview Image Modal */}
      {previewImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={() => setPreviewImage(null)}
        >
          <div className="relative max-w-full max-h-full" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute top-2 right-2 bg-white/20 hover:bg-white/40 text-white rounded-full p-2 transition-colors z-10"
            >
              <X size={24} />
            </button>
            <img
              src={getImageUrl(previewImage.image_path)}
              alt="Preview"
              className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
              onError={(e) => {
                e.target.src = 'https://via.placeholder.com/800x600/374151/9CA3AF?text=Image+Load+Error';
                e.target.alt = 'Image load error';
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default WorksImageManager;