
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Copy, Check,
  X,
  ChevronRight,
  ChevronLeft,
  ShoppingCart,
  Heart,
  Star,
  Eye,
  Share2,
  ArrowLeft,
  Truck,
  Shield,
  Award,
  MessageCircle,
  Zap,
  CheckCircle,
  Info,
  ZoomIn,
  Grid3x3,
  ThumbsUp
} from 'lucide-react';

const SubcategoryProductDetail = () => {
  const [selectedImage, setSelectedImage] = useState(0);
  const [productData, setProductData] = useState({});
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [animatedElements, setAnimatedElements] = useState(new Set());
  const [activeTab, setActiveTab] = useState('description');
  const [thumbnailStartIndex, setThumbnailStartIndex] = useState(0);
  const [showZoomModal, setShowZoomModal] = useState(false);
  const [zoomImage, setZoomImage] = useState('');

  const navigate = useNavigate();
 const apiBaseUrl ="http://localhost:5000"
  const handleViewDetails = (productId) => {
    console.log(productId);
    navigate(`/detailProducts/${productId}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const { productId } = useParams();
  console.log(productId);

  useEffect(() => {
    fetch(`${apiBaseUrl}/api/store/product/${productId}`)
      .then(res => res.json())
      .then(data => setProductData(data))
      .catch(err => console.error('Error fetching product data:', err));
  }, [productId]);

  useEffect(() => {
    setTimeout(() => {
      setLoading(false);
    }, 250);
  }, []); // Empty dependency array means this runs once after initial render

  useEffect(() => {
    fetch(`${apiBaseUrl}/api/store/RealatedPdeatail/${productId}`)
      .then(res => res.json())
      .then(data => setRelatedProducts(data))
      .catch(err => console.error('Error fetching related products:', err));
  }, [productId]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedElements(new Set(['hero', 'gallery', 'info', 'related']));
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // ฟังก์ชันสำหรับเลื่อน thumbnail
  const scrollThumbnails = (direction) => {
    const maxIndex = Math.max(0, (productData.images?.length || 0) - 4);
    if (direction === 'left') {
      setThumbnailStartIndex(Math.max(0, thumbnailStartIndex - 1));
    } else {
      setThumbnailStartIndex(Math.min(maxIndex, thumbnailStartIndex + 1));
    }
  };

  // ฟังก์ชันสำหรับเปิดซูม
  const handleZoomClick = (imageUrl) => {
    setZoomImage(imageUrl);
    setShowZoomModal(true);
  };

  // ฟังก์ชันสำหรับปิดซูม
  const handleCloseZoom = () => {
    setShowZoomModal(false);
    setZoomImage('');
  };

  const ProductImageGallery = () => (
    <div className={`relative transition-all duration-1000 ${
      animatedElements.has('gallery') ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'
    }`}>
      {/* Main Image */}
      <div className="relative group mb-6 rounded-3xl overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200 shadow-2xl">
        <img
          src={productData.images && productData.images[selectedImage]}
          alt={productData.name}
          className="w-full h-96 lg:h-[500px] object-cover cursor-zoom-in"
          onClick={() => handleZoomClick(productData.images && productData.images[selectedImage])}
        />

        {/* Image Overlay Controls */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300">
          <div className="absolute top-4 right-4 flex space-x-2">
            <button
              onClick={() => handleZoomClick(productData.images && productData.images[selectedImage])}
              className="p-3 bg-white/90 backdrop-blur-md rounded-full hover:bg-white transition-colors"
            >
              <ZoomIn size={20} className="text-slate-700" />
            </button>
            <button className="p-3 bg-white/90 backdrop-blur-md rounded-full hover:bg-white transition-colors">
              <Share2 size={20} className="text-slate-700" />
            </button>
          </div>
        </div>
      </div>

      {/* Horizontal Thumbnail Slider */}
      <div className="relative">
        {/* Left Arrow */}
        <button
          onClick={() => scrollThumbnails('left')}
          disabled={thumbnailStartIndex === 0}
          className={`absolute left-0 top-1/2 -translate-y-1/2 z-10 p-2 bg-white/90 backdrop-blur-md rounded-full shadow-lg transition-all duration-300 ${
            thumbnailStartIndex === 0
              ? 'opacity-50 cursor-not-allowed'
              : 'hover:bg-white hover:scale-110'
          }`}
        >
          <ChevronLeft size={20} className="text-slate-700" />
        </button>

        {/* Right Arrow */}
        <button
          onClick={() => scrollThumbnails('right')}
          disabled={thumbnailStartIndex >= Math.max(0, (productData.images?.length || 0) - 4)}
          className={`absolute right-0 top-1/2 -translate-y-1/2 z-10 p-2 bg-white/90 backdrop-blur-md rounded-full shadow-lg transition-all duration-300 ${
            thumbnailStartIndex >= Math.max(0, (productData.images?.length || 0) - 4)
              ? 'opacity-50 cursor-not-allowed'
              : 'hover:bg-white hover:scale-110'
          }`}
        >
          <ChevronRight size={20} className="text-slate-700" />
        </button>

        {/* Thumbnails Container */}
        <div className="mx-8 overflow-hidden">
          <div
            className="flex transition-transform duration-300 ease-in-out gap-3"
            style={{
              transform: `translateX(-${thumbnailStartIndex * (100 / 4)}%)`
            }}
          >
            {productData.images?.map((image, index) => (
              <button
                key={index}
                onClick={() => setSelectedImage(index)}
                className={`relative rounded-2xl overflow-hidden transition-all duration-300 flex-shrink-0 w-1/4 ${
                  selectedImage === index
                    ? 'ring-4 ring-cyan-400 scale-105 shadow-xl'
                    : 'hover:scale-105 hover:shadow-lg'
                }`}
              >
                <img
                  src={image}
                  alt={`View ${index + 1}`}
                  className="w-full h-20 object-cover"
                />
                {selectedImage === index && (
                  <div className="absolute inset-0 bg-cyan-400/20"></div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Dots Indicator */}
        <div className="flex justify-center mt-4 space-x-2">
          {productData.images?.map((_, index) => (
            <button
              key={index}
              onClick={() => setSelectedImage(index)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                selectedImage === index
                  ? 'bg-cyan-500 w-8'
                  : 'bg-slate-300 hover:bg-slate-400'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Zoom Modal */}
      {showZoomModal && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
          <div className="relative max-w-4xl max-h-full">
            <button
              onClick={handleCloseZoom}
              className="absolute top-4 right-4 z-10 p-2 bg-black/50 hover:bg-black/70 rounded-full transition-all duration-300"
            >
              <X size={24} className="text-white" />
            </button>
            <img
              src={zoomImage}
              alt="Zoomed view"
              className="max-w-full max-h-full object-contain rounded-lg"
            />
          </div>
        </div>
      )}
    </div>
  );

  const ProductInfo = () => {
    const [quantity, setQuantity] = useState(1);
    const [showOrderSummary, setShowOrderSummary] = useState(false);
    const [copied, setCopied] = useState(false);

    // Mock product data
    const numericPrice = parseFloat((productData.price || '0').replace(/[^\d.]/g, ''));

    const calculateTotalPrice = () => {
      return (numericPrice * quantity).toLocaleString('th-TH') + ' บาท';
    };

    const animatedElements = new Set(['info']);

    const handleOrderClick = () => {
      setShowOrderSummary(true);
    };

    const handleCloseOrderSummary = () => {
      setShowOrderSummary(false);
      setCopied(false);
    };

    const copyOrderDetails = () => {
      const orderText = `
📋 สรุปคำสั่งซื้อ
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🆔 ไอดีสินค้า: ${productData.id}
📦 ชื่อสินค้า: ${productData.name}
📂 หมวดหมู่หลัก: ${productData.category}
🏷️ หมวดหมู่ย่อย: ${productData.subcategory}
📊 จำนวน: ${quantity} ชิ้น
💰 ราคาต่อชิ้น: ${productData.price}
💵 ราคารวม: ${calculateTotalPrice()}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📞 ติดต่อเพื่อสั่งซื้อ
      `.trim();

      navigator.clipboard.writeText(orderText).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    };

    return (
      <div className="relative p-4">
        <div className={`transition-all duration-1000 delay-300 ${
          animatedElements.has('info') ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'
        }`}>
          {/* Breadcrumb */}
          <nav className="flex items-center space-x-2 text-sm text-slate-500 mb-6">
            <span>หน้าแรก</span>
            <ChevronRight size={16} />
            <span>{productData.category}</span>
            <ChevronRight size={16} />
            <span className="text-cyan-600 font-medium">{productData.subcategory}</span>
          </nav>

          {/* Product Tags */}
          <div className="flex flex-wrap gap-2 mb-4">
            {productData.tags?.map((tag, index) => (
              <span key={index} className={`px-3 py-1 text-xs font-medium rounded-full ${
                tag === 'ขายดี' ? 'bg-gradient-to-r from-orange-400 to-red-400 text-white' :
                tag === 'แนะนำ' ? 'bg-gradient-to-r from-emerald-400 to-teal-400 text-white' :
                tag === 'ใหม่ล่าสุด' ? 'bg-gradient-to-r from-blue-400 to-cyan-400 text-white' :
                'bg-gradient-to-r from-purple-400 to-pink-400 text-white'
              }`}>
                {tag}
              </span>
            ))}
          </div>

          {/* Product Title */}
          <h1 className="text-3xl lg:text-4xl font-bold text-slate-800 mb-4 leading-tight">
            {productData.name}
          </h1>

          {/* Rating & Reviews */}
          <div className="flex items-center space-x-4 mb-6">
            <div className="flex items-center space-x-1">
              {/* Rating stars would go here */}
            </div>
            <span className="text-slate-500">• ขายแล้ว {productData.sold} ชิ้น</span>
          </div>

          {/* Price */}
          <div className="mb-8">
            <div className="flex items-center space-x-4 mb-2">
              <span className="text-4xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
                {productData.price}
              </span>
              <span className="text-xl text-slate-400 line-through">{productData.originalPrice}</span>
            </div>
            <p className="text-slate-600">รวม VAT แล้ว ไม่รวมค่าจัดส่ง</p>
          </div>

          {/* Quantity & Actions */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">จำนวน</h3>
            <div className="flex items-center space-x-4 mb-6">
              <div className="flex items-center border-2 border-slate-200 rounded-full overflow-hidden">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-4 py-2 hover:bg-slate-100 transition-colors"
                >
                  -
                </button>
                <span className="px-6 py-2 font-semibold">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-4 py-2 hover:bg-slate-100 transition-colors"
                >
                  +
                </button>
              </div>
              <span className="text-slate-600">ชิ้น ({productData.stock} ชิ้น)</span>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <button
                onClick={handleOrderClick}
                className="w-full py-4 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold rounded-2xl hover:from-cyan-600 hover:to-blue-600 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                <ShoppingCart className="inline mr-2" size={20} />
                สั่งซื้อ
              </button>
            </div>
          </div>

          {/* Features */}
          <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl p-6 border border-slate-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 rounded-full">
                  <Truck className="text-green-600" size={20} />
                </div>
                <div>
                  <p className="font-semibold text-slate-800">ส่งฟรี</p>
                  <p className="text-sm text-slate-600">ทั่วกรุงเทพฯ</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-full">
                  <Shield className="text-blue-600" size={20} />
                </div>
                <div>
                  <p className="font-semibold text-slate-800">รับประกัน 5 ปี</p>
                  <p className="text-sm text-slate-600">โครงสร้างหลัก</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-100 rounded-full">
                  <Award className="text-purple-600" size={20} />
                </div>
                <div>
                  <p className="font-semibold text-slate-800">คุณภาพพรีเมียม</p>
                  <p className="text-sm text-slate-600">ผ้านำเข้า</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Order Summary Modal */}
        {showOrderSummary && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-50 p-4">
            <div className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-3xl shadow-2xl border border-slate-600/30 overflow-hidden max-w-lg w-full backdrop-blur-lg">
              {/* Animated Background Elements */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-purple-600/10 to-cyan-600/10"></div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl"></div>
              <div className="absolute bottom-0 left-0 w-40 h-40 bg-gradient-to-tr from-cyan-400/20 to-blue-400/20 rounded-full blur-3xl"></div>

              {/* Close Button */}
              <div className="absolute top-4 right-4 z-10">
                <button
                  onClick={handleCloseOrderSummary}
                  className="p-2 rounded-full bg-slate-800/80 hover:bg-slate-700/80 border border-slate-600/50 transition-all duration-300 group"
                >
                  <X size={20} className="text-slate-300 group-hover:text-white transition-colors" />
                </button>
              </div>

              {/* Content */}
              <div className="relative px-8 py-10">
                {/* Header */}
                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mb-4 shadow-lg">
                    <ShoppingCart className="text-white" size={28} />
                  </div>
                  <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent mb-2">
                    สรุปคำสั่งซื้อ
                  </h2>
                  <p className="text-slate-400 text-sm">รายละเอียดการสั่งซื้อของคุณ</p>
                </div>

                {/* Order Details */}
                <div className="space-y-5 mb-8">
                  <div className="bg-slate-800/50 border border-slate-600/30 rounded-2xl p-5 backdrop-blur-sm">
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-300 font-medium">ไอดีสินค้า</span>
                        <span className="text-blue-400 font-semibold font-mono">{productData.id}</span>
                      </div>
                      <div className="flex justify-between items-start">
                        <span className="text-slate-300 font-medium">ชื่อสินค้า</span>
                        <span className="text-white font-semibold text-right max-w-xs">{productData.name}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-300 font-medium">หมวดหมู่</span>
                        <span className="text-purple-400 font-semibold">{productData.category}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-300 font-medium">หมวดหมู่ย่อย</span>
                        <span className="text-cyan-400 font-semibold">{productData.subcategory}</span>
                      </div>
                      <div className="border-t border-slate-600/30 pt-4">
                        <div className="flex justify-between items-center">
                          <span className="text-slate-300 font-medium">จำนวน</span>
                          <div className="flex items-center space-x-2">
                            <span className="text-2xl font-bold text-white">{quantity}</span>
                            <span className="text-slate-400">ชิ้น</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex justify-between items-center pt-4 border-t border-slate-600/30">
                        <span className="text-slate-300 font-medium text-lg">ราคารวม</span>
                        <span className="text-3xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                          {calculateTotalPrice()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Copy Button */}
                <button
                  onClick={copyOrderDetails}
                  className="w-full py-4 bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 hover:from-blue-700 hover:via-purple-700 hover:to-cyan-700 text-white font-bold rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-2xl border border-blue-500/30 group relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                  <div className="relative flex items-center justify-center space-x-3">
                    {copied ? (
                      <>
                        <Check size={20} className="text-green-300" />
                        <span>คัดลอกแล้ว!</span>
                      </>
                    ) : (
                      <>
                        <Copy size={20} />
                        <span>คัดลอกข้อความ</span>
                      </>
                    )}
                  </div>
                </button>

                {/* Footer Note */}
                <p className="text-center text-slate-400 text-xs mt-4">
                  คัดลอกข้อความเพื่อส่งให้เจ้าหน้าที่เพื่อดำเนินการสั่งซื้อ
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const ProductTabs = () => (
    <div className="mb-16">
      {/* Tab Headers */}
      <div className="flex space-x-1 bg-slate-100 rounded-2xl p-1 mb-8">
        {[
          { id: 'description', label: 'รายละเอียด', icon: Info },
          { id: 'reviews', label: 'รีวิว', icon: MessageCircle }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-xl font-medium transition-all duration-300 ${
              activeTab === tab.id
                ? 'bg-white text-cyan-600 shadow-lg'
                : 'text-slate-600 hover:text-slate-800'
            }`}
          >
            <tab.icon size={18} />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-2xl p-8 shadow-lg border border-slate-200">
        {activeTab === 'description' && (
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-slate-800 mb-4">รายละเอียดสินค้า</h3>
            <p className="text-slate-600 leading-relaxed text-lg">{productData.description}</p>
          </div>
        )}

        {activeTab === 'reviews' && (
          <div>
            <h3 className="text-2xl font-bold text-slate-800 mb-6">รีวิวจากลูกค้า</h3>
            <div className="space-y-6">
              {[1, 2, 3].map((review) => (
                <div key={review} className="bg-slate-50 rounded-2xl p-6">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-cyan-400 to-blue-400 rounded-full flex items-center justify-center text-white font-bold">
                      K{review}
                    </div>
                    <div>
                      <h5 className="font-semibold text-slate-800">คุณลูกค้า {review}</h5>
                      <div className="flex items-center space-x-2">
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} size={16} className="text-yellow-400 fill-current" />
                          ))}
                        </div>
                        <span className="text-sm text-slate-500">2 สัปดาห์ที่แล้ว</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-slate-600 leading-relaxed">
                    สินค้าดีมาก คุณภาพเกินคาด นั่งสบายมาก วัสดุดูทนทาน การบริการดีเยี่ยม แนะนำเลยครับ
                  </p>
                  <div className="flex items-center space-x-4 mt-4">
                    <button className="flex items-center space-x-2 text-slate-500 hover:text-cyan-600 transition-colors">
                      <ThumbsUp size={16} />
                      <span>ช่วยได้ (12)</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const RelatedProducts = () => (
    <div className={`transition-all duration-1000 delay-700 ${
      animatedElements.has('related') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
    }`}>
      <h2 className="text-3xl font-bold text-slate-800 mb-8">สินค้าที่เกี่ยวข้อง</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {relatedProducts.map((product, index) => (
          <div key={product.id} className="group bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border border-slate-200">
            <div className="relative mb-4 rounded-xl overflow-hidden">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
            <h3 className="font-bold text-slate-800 mb-2 group-hover:text-cyan-600 transition-colors line-clamp-2">
              {product.name}
            </h3>
            <div className="flex items-center justify-between">
              <span className="text-xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
                {product.price}
              </span>
              <button
                onClick={() => handleViewDetails(product.id)}
                className="p-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-full hover:from-cyan-600 hover:to-blue-600 transition-all duration-300 transform hover:scale-110"
              >
                <Eye size={20} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-slate-50">
        <div className="animate-spin rounded-full h-32 w-32 border-t-4 border-b-4 border-cyan-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 lg:py-12 bg-slate-50 min-h-screen">
      <button
        onClick={() => navigate(-1)}
        className="mt-10 flex items-center space-x-2 text-slate-600 hover:text-cyan-600 transition-colors mb-8"
      >
        <ArrowLeft size={20} />
        <span>กลับไปหน้ารายการสินค้า</span>
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        <div>
          <ProductImageGallery />
        </div>
        <div>
          <ProductInfo />
        </div>
      </div>

      <hr className="my-16 border-t-2 border-slate-200" />

      <ProductTabs />

      <hr className="my-16 border-t-2 border-slate-200" />

      <RelatedProducts />
    </div>
  );
};

export default SubcategoryProductDetail;