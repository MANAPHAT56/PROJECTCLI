import React, { useState, useEffect } from 'react';
import { useParams,Link} from 'react-router-dom';
import { 
  ArrowLeft, Heart, Share2, Download, ExternalLink, Calendar, Tag, Package,
  Zap, Palette, Eye, Bookmark, ImageIcon, Layers, Star, Clock, ChevronLeft,
  ChevronRight, ZoomIn, X, Info, CheckCircle, AlertCircle, FileText, Grid3X3,
  ShoppingBag, ArrowRight, MoreHorizontal, Copy
} from 'lucide-react';
import { toast } from 'react-hot-toast'; // หรือใช้ react-toastify ก็ได้


const WorksDetail = () => {
  const [copyData, setCopyData] = useState('');
  const [work, setWork] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showImageModal, setShowImageModal] = useState(false);
  const [relatedWorks, setRelatedWorks] = useState([]);
  const [stats, setStats] = useState({ total: 0, custom: 0, samples: 0, categories: 0 });
  const [isFavorite, setIsFavorite] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [imageGalleryStartIndex, setImageGalleryStartIndex] = useState(0);
  const { workId } = useParams();
  const API_BASE_URL = 'http://localhost:5000';
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch work details
        const workResponse = await fetch(`${API_BASE_URL}/api/works/works/${workId}`);
        
        if (!workResponse.ok) {
          throw new Error(workResponse.status === 404 ? 'ไม่พบผลงานที่ต้องการ' : `เกิดข้อผิดพลาด: ${workResponse.status}`);
        }

        const workData = await workResponse.json();
        setWork(workData);

        // Fetch related works (featured works as related)
        try {
          const relatedResponse = await fetch(`${API_BASE_URL}/featured?limit=8`);
          if (relatedResponse.ok) {
            const relatedData = await relatedResponse.json();
            // Filter out current work from related works
            setRelatedWorks(relatedData.filter(item => item.id !== parseInt(workId)));
          }
        } catch (relatedError) {
          console.log('Failed to fetch related works:', relatedError);
        }

        // Fetch stats
        try {
          const statsResponse = await fetch(`${API_BASE_URL}/stats`);
          if (statsResponse.ok) {
            const statsData = await statsResponse.json();
            setStats(statsData);
          }
        } catch (statsError) {
          console.log('Failed to fetch stats:', statsError);
        }

      } catch (error) {
        setError(error.message || 'ไม่สามารถโหลดข้อมูลผลงานได้');
      } finally {
        setLoading(false);
      }
    };

    if (workId) fetchData();
  }, [workId]);

  const getAllImages = () => {
    if (!work) return [];
    const images = [];
    
    // Add cover image first
    if (work.cover_image) {
      images.push(work.cover_image);
    }
    
    // Add secondary images
    if (work.secondary_images && Array.isArray(work.secondary_images)) {
      images.push(...work.secondary_images.filter(img => img && img.trim()));
    }
    
    // If no images, return placeholder
    return images.length > 0 ? images : ['https://via.placeholder.com/800x600?text=No+Image'];
  };

  const handleImageNavigation = (direction) => {
    const allImages = getAllImages();
    if (allImages.length <= 1) return;
    
    setCurrentImageIndex(prev => 
      direction === 'next' 
        ? (prev + 1) % allImages.length 
        : (prev - 1 + allImages.length) % allImages.length
    );
  };

  const handleGalleryNavigation = (direction) => {
    const allImages = getAllImages();
    const visibleCount = 8;
    const maxStart = Math.max(0, allImages.length - visibleCount);
    
    setImageGalleryStartIndex(prev => {
      if (direction === 'next') {
        return Math.min(prev + visibleCount, maxStart);
      } else {
        return Math.max(prev - visibleCount, 0);
      }
    });
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ 
          title: work?.name, 
          text: work?.main_description, 
          url: window.location.href 
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      try {
        await navigator.clipboard.writeText(window.location.href);
        alert('ลิงก์ถูกคัดลอกแล้ว!');
      } catch (error) {
        console.log('Error copying to clipboard:', error);
      }
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'ไม่ระบุ';
    try {
      return new Date(dateString).toLocaleDateString('th-TH', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    } catch (error) {
      return 'ไม่ระบุ';
    }
  };

  const LoadingScreen = () => (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
      <div className="text-center">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <Package className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-blue-500" size={24} />
        </div>
        <p className="text-gray-600 text-lg">กำลังโหลดรายละเอียดผลงาน...</p>
      </div>
    </div>
  );

  const ErrorScreen = () => (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
      <div className="text-center max-w-md mx-auto p-6">
        <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-800 mb-2">ไม่สามารถโหลดข้อมูลได้</h3>
        <p className="text-gray-600 mb-6">{error}</p>
        <div className="flex gap-3 justify-center">
          <button 
            onClick={() => window.history.back()} 
            className="px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-xl transition-colors flex items-center gap-2"
          >
            <ArrowLeft size={16} /> กลับหน้าก่อน
          </button>
          <button 
            onClick={() => window.location.reload()} 
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-xl transition-all duration-300 shadow-lg"
          >
            ลองใหม่
          </button>
        </div>
      </div>
    </div>
  );

  if (loading) return <LoadingScreen />;
  if (error) return <ErrorScreen />;
  if (!work) return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
      <div className="text-center">
        <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">ไม่พบข้อมูลผลงาน</p>
      </div>
    </div>
  );

  const allImages = getAllImages();
  const currentImage = allImages[currentImageIndex] || 'https://via.placeholder.com/800x600?text=No+Image';
  const visibleImages = allImages.slice(imageGalleryStartIndex, imageGalleryStartIndex + 8);

  return (
    <div className="mt-13 min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white/90 backdrop-blur-sm border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button 
              onClick={() => window.history.back()} 
              className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-gray-50 text-gray-700 rounded-xl transition-colors shadow-sm border border-gray-200"
            >
              <ArrowLeft size={16} />
              <span className="hidden sm:inline">กลับหน้าก่อน</span>
            </button>
            <div className="flex items-center gap-2">
              {[
                { action: () => setIsFavorite(!isFavorite), active: isFavorite, icon: Heart },
                { action: () => setIsBookmarked(!isBookmarked), active: isBookmarked, icon: Bookmark },
                { action: handleShare, active: false, icon: Share2 }
              ].map((btn, idx) => {
                const Icon = btn.icon;
                return (
                  <button 
                    key={idx} 
                    onClick={btn.action} 
                    className={`p-3 rounded-xl transition-all duration-300 shadow-sm ${
                      btn.active 
                        ? `bg-red-50 text-red-500 border border-red-200` 
                        : `bg-white hover:bg-gray-50 text-gray-600 border border-gray-200`
                    }`}
                  >
                    <Icon size={18} className={btn.active && (btn.icon === Heart || btn.icon === Bookmark) ? 'fill-current' : ''} />
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Image Modal */}
      {showImageModal && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4">
          <div className="relative max-w-4xl max-h-full">
            <button 
              onClick={() => setShowImageModal(false)} 
              className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/30 text-white rounded-full transition-colors z-10"
            >
              <X size={20} />
            </button>
            <img 
              src={"https://cdn.toteja.co/"+currentImage} 
              alt={work.name} 
              className="max-w-full max-h-full object-contain rounded-lg" 
              onError={(e) => {
                e.target.src = 'https://via.placeholder.com/800x600?text=Image+Not+Found';
              }}
            />
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 py-8">
        {/* Work Header */}
        <div className="bg-white rounded-2xl p-6 shadow-lg mb-8">
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="lg:w-1/2">
              <div className="relative">
                <img 
                  src={"https://cdn.toteja.co/"+currentImage} 
                  alt={work.name} 
                  className="w-full h-80 object-cover rounded-xl cursor-zoom-in"
                  onClick={() => setShowImageModal(true)}
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/800x600?text=Image+Not+Found';
                  }}
                />
                
                {/* Badges */}
                <div className="absolute top-4 left-4 flex flex-col gap-2">
                  {work.is_custom && (
                    <span className="px-3 py-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm font-medium rounded-full flex items-center gap-1 shadow-lg">
                      <Zap size={12} /> สั่งทำพิเศษ
                    </span>
                  )}
                  {work.is_sample && (
                    <span className="px-3 py-1 bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-sm font-medium rounded-full flex items-center gap-1 shadow-lg">
                      <Palette size={12} /> ตัวอย่าง
                    </span>
                  )}
                </div>

                {/* Navigation */}
                {allImages.length > 1 && (
                  <>
                    <button 
                      onClick={() => handleImageNavigation('prev')} 
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 p-3 bg-black/50 hover:bg-black/70 text-white rounded-full transition-all duration-300 backdrop-blur-sm"
                    >
                      <ChevronLeft size={20} />
                    </button>
                    <button 
                      onClick={() => handleImageNavigation('next')} 
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 p-3 bg-black/50 hover:bg-black/70 text-white rounded-full transition-all duration-300 backdrop-blur-sm"
                    >
                      <ChevronRight size={20} />
                    </button>
                    <div className="absolute bottom-4 left-4 px-3 py-1 bg-black/50 text-white text-sm rounded-full backdrop-blur-sm">
                      {currentImageIndex + 1} / {allImages.length}
                    </div>
                  </>
                )}
                
                <button 
                  onClick={() => setShowImageModal(true)} 
                  className="absolute bottom-4 right-4 p-3 bg-black/50 hover:bg-black/70 text-white rounded-full transition-all duration-300 backdrop-blur-sm"
                >
                  <ZoomIn size={18} />
                </button>
              </div>
            </div>

            <div className="lg:w-1/2">
              <h1 className="text-3xl font-bold text-gray-800 mb-4">{work.name}</h1>
              
              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-2 text-gray-600">
                  <Calendar size={16} />
                  <span>สร้างเมื่อ {formatDate(work.created_at)}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Tag size={16} />
                  <span>{work.category_name || 'ไม่ระบุหมวดหมู่'}</span>
                  {work.subcategory_name && work.subcategory_name !== 'ไม่ระบุหมวดหมู่ย่อย' && (
                    <span className="text-gray-400">• {work.subcategory_name}</span>
                  )}
                </div>
                {work.product_reference_id && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Package size={16} />
                    <span>รหัสสินค้าอ้างอิง: {work.product_reference_id}</span>
                  </div>
                )}
              </div>

              <p className="text-gray-700 leading-relaxed mb-6">
                {work.main_description || 'ไม่มีคำอธิบาย'}
              </p>

              <div className="space-y-3">
               <button
  onClick={() => {
    const info = `
📦 ชื่อผลงาน: ${work.name}
🗓 วันที่สั่ง: ${formatDate(new Date())}
🆔 ID ผลงาน: ${work.id}
🔗 ID สินค้าอ้างอิง: ${work.product_reference_id || '-'}
`.trim();
  
    setCopyData(info);
    navigator.clipboard.writeText(info);
    toast.success('คัดลอกข้อมูลเรียบร้อยแล้ว!');
      setTimeout(() => setCopyData(''), 5000); // หายไปหลัง 5 วิ
  }}
  className="w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-medium rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
>
  <Eye size={18} /> สั่งซื้อสินค้า
</button>
                <div className="grid grid-cols-2 gap-3">
                  {/* <button className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-xl transition-colors shadow-md flex items-center justify-center gap-2">
                    <Download size={16} /> ดาวน์โหลด
                  </button>
                  <button className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-xl transition-colors shadow-md flex items-center justify-center gap-2">
                    <ExternalLink size={16} /> เปิดใหม่
                  </button> */}
                  {copyData && (
  <div className="mt-4 bg-gray-100 border border-gray-300 p-4 rounded-lg relative">
    <pre className="whitespace-pre-wrap text-sm text-gray-800">{copyData}</pre>
    <button
      onClick={() => {
        navigator.clipboard.writeText(copyData);
        toast.success('คัดลอกอีกครั้งเรียบร้อย');
      }}
      className="absolute top-2 right-2 text-sm px-2 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600"
    >
      คัดลอก
    </button>
  </div>
)}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Image Gallery Section */}
        {allImages.length > 1 && (
          <div className="bg-white rounded-2xl p-6 shadow-lg mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                <ImageIcon className="text-blue-500" size={24} />
                แกลเลอรี่ภาพผลงาน
              </h2>
              <span className="text-gray-600 text-sm">
                {allImages.length} ภาพ
              </span>
            </div>

            {/* Image Grid */}
            <div className="relative">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                {visibleImages.map((image, index) => {
                  const actualIndex = imageGalleryStartIndex + index;
                  return (
                    <button
                      key={actualIndex}
                      onClick={() => setCurrentImageIndex(actualIndex)}
                      className={`relative aspect-square rounded-lg overflow-hidden transition-all duration-300 ${
                        currentImageIndex === actualIndex 
                          ? 'ring-2 ring-blue-500 shadow-lg scale-105' 
                          : 'hover:scale-105 hover:shadow-md'
                      }`}
                    >
                      <img 
                        src={"https://cdn.toteja.co/"+image} 
                        alt={`${work.name} - ${actualIndex + 1}`} 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/300x300?text=Image+Not+Found';
                        }}
                      />
                      {currentImageIndex === actualIndex && (
                        <div className="absolute inset-0 bg-blue-500/20 flex items-center justify-center">
                          <CheckCircle className="text-blue-500" size={20} />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Gallery Navigation */}
              {allImages.length > 8 && (
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => handleGalleryNavigation('prev')}
                    disabled={imageGalleryStartIndex === 0}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
                  >
                    <ChevronLeft size={16} />
                    <span className="hidden sm:inline">ก่อนหน้า</span>
                  </button>
                  <div className="flex items-center gap-2">
                    {Array.from({ length: Math.ceil(allImages.length / 8) }, (_, i) => (
                      <button
                        key={i}
                        onClick={() => setImageGalleryStartIndex(i * 8)}
                        className={`w-2 h-2 rounded-full transition-colors ${
                          Math.floor(imageGalleryStartIndex / 8) === i 
                            ? 'bg-blue-500' 
                            : 'bg-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <button
                    onClick={() => handleGalleryNavigation('next')}
                    disabled={imageGalleryStartIndex + 8 >= allImages.length}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
                  >
                    <span className="hidden sm:inline">ถัดไป</span>
                    <ChevronRight size={16} />
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Additional Description */}
        {work.sub_description && work.sub_description.trim() && (
          <div className="bg-white rounded-2xl p-6 shadow-lg mb-8">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">รายละเอียดเพิ่มเติม</h3>
            <p className="text-gray-700 leading-relaxed">{work.sub_description}</p>
          </div>
        )}

        {/* Secondary Assets */}
        {work.secondary_assets && Array.isArray(work.secondary_assets) && work.secondary_assets.length > 0 && (
          <div className="bg-white rounded-2xl p-6 shadow-lg mb-8">
            <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Layers className="text-purple-500" size={20} />
              ไฟล์เสริม
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {work.secondary_assets.map((asset, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3">
                    <FileText className="text-blue-500" size={20} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">
                        {asset.name || `ไฟล์ ${index + 1}`}
                      </p>
                      <p className="text-xs text-gray-500">
                        {asset.type || 'ไฟล์เสริม'}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Stats Section */}
        <div className="bg-white rounded-2xl p-6 shadow-lg mb-8">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">สถิติผลงาน</h3>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'ผลงานทั้งหมด', value: stats.total, color: 'blue' },
              { label: 'งานสั่งทำพิเศษ', value: stats.custom, color: 'purple' },
              { label: 'ตัวอย่างผลงาน', value: stats.samples, color: 'green' },
              { label: 'หมวดหมู่', value: stats.categories, color: 'orange' }
            ].map((stat, index) => (
              <div key={index} className="text-center p-4 border border-gray-200 rounded-lg">
                <div className={`text-2xl font-bold text-${stat.color}-500 mb-1`}>
                  {stat.value.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Related Works Section */}
        {relatedWorks.length > 0 && (
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                <Grid3X3 className="text-blue-500" size={24} />
                ผลงานที่เกี่ยวข้อง
              </h2>
              <button className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors">
             <Link to="/works">
    <span>ดูทั้งหมด</span>
    <ArrowRight size={16} />
</Link>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedWorks.slice(0, 8).map((relatedWork) => (
                <Link  key={relatedWork.id}
  to={`/worksDetail/${relatedWork.id}`} // This is the actual navigation trigger
  className="group cursor-pointer block" // Makes the whole card clickable
>
                <div key={relatedWork.id} className="group cursor-pointer">
                  <div className="border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300 hover:border-blue-300">
                    <div className="relative">
<img
                src={relatedWork.cover_image
                  ? `https://cdn.toteja.co/${relatedWork.cover_image}`
                  : 'https://via.placeholder.com/300x200?text=No+Image'
                }
                alt={relatedWork.name}
                className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/300x200?text=No+Image';
                }}
              />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      
                      {/* Badges */}
                      <div className="absolute top-2 left-2 flex flex-col gap-1">
                        {relatedWork.is_custom && (
                          <span className="px-2 py-1 bg-purple-500 text-white text-xs rounded-full">
                            สั่งทำ
                          </span>
                        )}
                        {relatedWork.is_sample && (
                          <span className="px-2 py-1 bg-blue-500 text-white text-xs rounded-full">
                            ตัวอย่าง
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-800 mb-2 line-clamp-2">{relatedWork.name}</h3>
                      <p className="text-sm text-gray-600 mb-2">{relatedWork.category_name}</p>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Clock size={12} />
                        <span>{formatDate(relatedWork.created_at)}</span>
                      </div>
                    </div>
                  </div>
                </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WorksDetail;