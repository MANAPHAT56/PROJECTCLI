import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, Heart, Share2, Download, ExternalLink, Calendar, Tag, Package,
  Zap, Palette, Eye, Bookmark, ImageIcon, Layers, Star, Clock, ChevronLeft,
  ChevronRight, ZoomIn, X, Info, CheckCircle, AlertCircle, FileText, Grid3X3
} from 'lucide-react';
import { useParams } from 'react-router-dom';
const WorksDetail = () => {
  const [work, setWork] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showImageModal, setShowImageModal] = useState(false);
  const [relatedWorks, setRelatedWorks] = useState([]);
  const [stats, setStats] = useState({ total: 1250, custom: 450, samples: 800, categories: 12 });
  const [isFavorite, setIsFavorite] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  const {workId} = useParams();
  const API_BASE_URL = 'http://localhost:5000/api/works';

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE_URL}/works/${workId}`);
        
        if (!response.ok) {
          throw new Error(response.status === 404 ? 'ไม่พบผลงานที่ต้องการ' : `เกิดข้อผิดพลาด: ${response.status}`);
        }

        const data = await response.json();
        setWork({
          ...data,
          secondary_images: Array.isArray(data.secondary_images) ? data.secondary_images : 
            (data.secondary_images ? JSON.parse(data.secondary_images) : []),
          secondary_assets: Array.isArray(data.secondary_assets) ? data.secondary_assets : 
            (data.secondary_assets ? JSON.parse(data.secondary_assets) : []),
          is_custom: Boolean(data.is_custom),
          is_sample: Boolean(data.is_sample)
        });

        // Mock related works
        setRelatedWorks([
          { id: 2, name: 'ผลงานสำเร็จรูป A', cover_image: 'https://picsum.photos/300/200?random=1', category_name: 'กราฟิกดีไซน์' },
          { id: 3, name: 'ผลงานสำเร็จรูป B', cover_image: 'https://picsum.photos/300/200?random=2', category_name: 'กราฟิกดีไซน์' },
          { id: 4, name: 'ผลงานสำเร็จรูป C', cover_image: 'https://picsum.photos/300/200?random=3', category_name: 'กราฟิกดีไซน์' },
          { id: 5, name: 'ผลงานสำเร็จรูป D', cover_image: 'https://picsum.photos/300/200?random=4', category_name: 'กราฟิกดีไซน์' }
        ]);
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
    if (work.cover_image) images.push(work.cover_image);
    if (work.secondary_images && Array.isArray(work.secondary_images)) {
      images.push(...work.secondary_images.filter(img => img));
    }
    return images.length > 0 ? images : ['https://picsum.photos/800/600?random=default'];
  };

  const handleImageNavigation = (direction) => {
    if (!work) return;
    const allImages = getAllImages();
    const totalImages = allImages.length;
    setCurrentImageIndex(prev => direction === 'next' ? (prev + 1) % totalImages : (prev - 1 + totalImages) % totalImages);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: work?.name, text: work?.main_description, url: window.location.href });
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
          <button onClick={() => window.history.back()} className="px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-xl transition-colors flex items-center gap-2">
            <ArrowLeft size={16} /> กลับหน้าก่อน
          </button>
          <button onClick={() => window.location.reload()} className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-xl transition-all duration-300 shadow-lg">
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
  const currentImage = allImages[currentImageIndex] || 'https://picsum.photos/800/600?random=default';
  const secondaryAssets = work.secondary_assets || [];

  const tabs = [
    { id: 'overview', label: 'ภาพรวม', icon: Info },
    { id: 'details', label: 'รายละเอียด', icon: FileText },
    { id: 'assets', label: 'ไฟล์แนบ', icon: Layers }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white/90 backdrop-blur-sm border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button onClick={() => window.history.back()} className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-gray-50 text-gray-700 rounded-xl transition-colors shadow-sm border border-gray-200">
              <ArrowLeft size={16} />
              <span className="hidden sm:inline">กลับหน้าก่อน</span>
            </button>
            <div className="flex items-center gap-2">
              {[
                { action: () => setIsFavorite(!isFavorite), active: isFavorite, icon: Heart, colors: 'red' },
                { action: () => setIsBookmarked(!isBookmarked), active: isBookmarked, icon: Bookmark, colors: 'yellow' },
                { action: handleShare, active: false, icon: Share2, colors: 'blue' }
              ].map((btn, idx) => {
                const Icon = btn.icon;
                return (
                  <button key={idx} onClick={btn.action} className={`p-3 rounded-xl transition-all duration-300 shadow-sm ${
                    btn.active ? `bg-${btn.colors}-50 text-${btn.colors}-500 border border-${btn.colors}-200` : 
                    `bg-white hover:bg-${btn.colors}-50 text-gray-600 border border-gray-200`
                  }`}>
                    <Icon size={18} className={btn.active && btn.icon === Heart || btn.active && btn.icon === Bookmark ? 'fill-current' : ''} />
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
            <button onClick={() => setShowImageModal(false)} className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/30 text-white rounded-full transition-colors z-10">
              <X size={20} />
            </button>
            <img src={currentImage} alt={work.name} className="max-w-full max-h-full object-contain rounded-lg" />
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2">
            {/* Main Image */}
            <div className="bg-white rounded-2xl overflow-hidden shadow-lg mb-6">
              <div className="relative">
                <img src={currentImage} alt={work.name} className="w-full h-96 sm:h-[500px] object-cover cursor-zoom-in"
                  onClick={() => setShowImageModal(true)} onError={(e) => { e.target.src = 'https://picsum.photos/800/600?random=error'; }} />
                
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

                {/* Navigation & Controls */}
                {allImages.length > 1 && (
                  <>
                    <button onClick={() => handleImageNavigation('prev')} className="absolute left-4 top-1/2 transform -translate-y-1/2 p-3 bg-black/50 hover:bg-black/70 text-white rounded-full transition-all duration-300 backdrop-blur-sm">
                      <ChevronLeft size={20} />
                    </button>
                    <button onClick={() => handleImageNavigation('next')} className="absolute right-4 top-1/2 transform -translate-y-1/2 p-3 bg-black/50 hover:bg-black/70 text-white rounded-full transition-all duration-300 backdrop-blur-sm">
                      <ChevronRight size={20} />
                    </button>
                    <div className="absolute bottom-4 left-4 px-3 py-1 bg-black/50 text-white text-sm rounded-full backdrop-blur-sm">
                      {currentImageIndex + 1} / {allImages.length}
                    </div>
                  </>
                )}
                
                <button onClick={() => setShowImageModal(true)} className="absolute bottom-4 right-4 p-3 bg-black/50 hover:bg-black/70 text-white rounded-full transition-all duration-300 backdrop-blur-sm">
                  <ZoomIn size={18} />
                </button>
              </div>
            </div>

            {/* Thumbnails */}
            {allImages.length > 1 && (
              <div className="bg-white rounded-2xl p-4 shadow-lg mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <ImageIcon size={18} className="text-blue-500" />
                  ภาพทั้งหมด ({allImages.length})
                </h3>
                <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
                  {allImages.map((image, index) => (
                    <button key={index} onClick={() => setCurrentImageIndex(index)} className={`relative aspect-square rounded-lg overflow-hidden transition-all duration-300 ${
                      currentImageIndex === index ? 'ring-2 ring-blue-500 shadow-lg scale-105' : 'hover:scale-105 hover:shadow-md'
                    }`}>
                      <img src={image || `https://picsum.photos/100/100?random=${index}`} alt={`${work.name} - ${index + 1}`} className="w-full h-full object-cover" />
                      {currentImageIndex === index && (
                        <div className="absolute inset-0 bg-blue-500/20 flex items-center justify-center">
                          <CheckCircle className="text-blue-500" size={16} />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Tabs Content */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="border-b border-gray-200">
                <div className="flex">
                  {tabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex-1 px-4 py-3 text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                        activeTab === tab.id ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50' : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                      }`}>
                        <Icon size={16} /> {tab.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="p-6">
                {activeTab === 'overview' && (
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-2">คำอธิบายหลัก</h3>
                      <p className="text-gray-700 leading-relaxed">{work.main_description}</p>
                    </div>
                    {work.sub_description && (
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">คำอธิบายเพิ่มเติม</h3>
                        <p className="text-gray-600 leading-relaxed">{work.sub_description}</p>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'details' && (
                  <div className="grid sm:grid-cols-2 gap-4">
                    {[
                      { icon: Calendar, label: 'วันที่สร้าง', value: new Date(work.created_at).toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' }), color: 'blue' },
                      { icon: Tag, label: 'หมวดหมู่', value: work.category_name || 'ไม่ระบุ', color: 'green' },
                      work.subcategory_name && { icon: Grid3X3, label: 'หมวดหมู่ย่อย', value: work.subcategory_name, color: 'purple' },
                      work.product_reference_id && { icon: Package, label: 'รหัสสินค้าอ้างอิง', value: work.product_reference_id, color: 'orange' }
                    ].filter(Boolean).map((item, idx) => {
                      const Icon = item.icon;
                      return (
                        <div key={idx} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                          <Icon className={`text-${item.color}-500`} size={18} />
                          <div>
                            <p className="text-sm text-gray-600">{item.label}</p>
                            <p className="font-medium text-gray-800">{item.value}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {activeTab === 'assets' && (
                  <div>
                    {secondaryAssets.length > 0 ? (
                      <div className="grid sm:grid-cols-2 gap-4">
                        {secondaryAssets.map((asset, index) => (
                          <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                            <div className="p-2 bg-blue-100 rounded-lg">
                              <FileText className="text-blue-600" size={18} />
                            </div>
                            <div className="flex-1">
                              <p className="font-medium text-gray-800">{asset.name || `ไฟล์ ${index + 1}`}</p>
                              <p className="text-sm text-gray-600">{asset.type || 'ไฟล์แนบ'}</p>
                            </div>
                            <button className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors">
                              <Download size={16} />
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center text-gray-500 py-8">
                        <Layers size={48} className="mx-auto mb-3 text-gray-300" />
                        <p>ไม่มีไฟล์แนบเพิ่มเติม</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Work Info */}
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4 leading-tight">{work.name}</h1>
              
              <div className="space-y-4 mb-6">
                <div className="flex items-center gap-2 text-gray-600">
                  <Clock size={16} />
                  <span className="text-sm">สร้างเมื่อ {new Date(work.created_at).toLocaleDateString('th-TH')}</span>
                </div>
                {work.category_name && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Tag size={16} />
                    <span className="text-sm">{work.category_name}</span>
                    {work.subcategory_name && <span className="text-gray-400">• {work.subcategory_name}</span>}
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <button className="w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-medium rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-center gap-2">
                  <Eye size={18} /> ดูรายละเอียดเต็ม
                </button>
                <div className="grid grid-cols-2 gap-3">
                  <button className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-xl transition-colors shadow-md flex items-center justify-center gap-2">
                    <Download size={16} /> ดาวน์โหลด
                  </button>
                  <button className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-xl transition-colors shadow-md flex items-center justify-center gap-2">
                    <ExternalLink size={16} /> เปิดใหม่
                  </button>
                </div>
              </div>
            </div>

            {/* Statistics */}
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Star className="text-yellow-500" size={18} /> สถิติผลงาน
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { value: stats.total, label: 'ผลงานทั้งหมด', color: 'blue' },
                  { value: stats.custom, label: 'งานสั่งทำ', color: 'purple' },
                  { value: stats.samples, label: 'งานตัวอย่าง', color: 'green' },
                  { value: stats.categories, label: 'หมวดหมู่', color: 'orange' }
                ].map((stat, idx) => (
                  <div key={idx} className={`text-center p-3 bg-${stat.color}-50 rounded-xl`}>
                    <p className={`text-2xl font-bold text-${stat.color}-600`}>{stat.value?.toLocaleString()}</p>
                    <p className="text-sm text-gray-600">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Related Works */}
            {relatedWorks.length > 0 && (
              <div className="bg-white rounded-2xl p-6 shadow-lg">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <Grid3X3 className="text-blue-500" size={18} /> ผลงานที่เกี่ยวข้อง
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {relatedWorks.slice(0, 4).map((relatedWork) => (
                    <button key={relatedWork.id} className="group text-left border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-all duration-300 hover:border-blue-300"
                      onClick={() => {
                        const params = new URLSearchParams(window.location.search);
                        params.set('id', relatedWork.id);
                        window.location.search = params.toString();
                      }}>
                      <img src={relatedWork.cover_image || `https://picsum.photos/150/100?random=${relatedWork.id}`} alt={relatedWork.name} 
                        className="w-full h-20 object-cover group-hover:scale-105 transition-transform duration-300" />
                      <div className="p-3">
                        <p className="text-sm font-medium text-gray-800 line-clamp-2">{relatedWork.name}</p>
                        <p className="text-xs text-gray-500 mt-1">{relatedWork.category_name}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorksDetail;