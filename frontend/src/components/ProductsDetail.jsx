import React, { useState, useEffect } from 'react';
import { 
  ChevronRight, 
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
  Play,
  ZoomIn,
  Grid3x3,
  ThumbsUp
} from 'lucide-react';
import { useParams } from 'react-router-dom'; 
const SubcategoryProductDetail = () => {
  const [selectedImage, setSelectedImage] = useState(0);
  const [productData,setproductData ] = useState({}) ;
  // const [isFavorite, setIsFavorite] = useState(false);
  const [quantity, setQuantity] = useState(1);
    const [loading, setLoading] = useState(true);
  // const [selectedVariant, setSelectedVariant] = useState(0);
  const [animatedElements, setAnimatedElements] = useState(new Set());
  const [activeTab, setActiveTab] = useState('description');
       const { productId } = useParams(); // ✅ ดึงค่าจาก URL
       console.log(productId);
 useEffect(() => {
    fetch(`http://localhost:5000/api/store/product/${productId}`)
      .then(res => res.json())
      .then(data => setproductData(data))
      .catch(err => console.error('Error fetching categories:', err));
  }, [productId]);
  
    useEffect(() => {
         setTimeout(() => {
      setLoading(false);
    }, 500);
    });
  
  // const productData = {
  //   id: 1,
  //   name: "โซฟาผ้า 3 ที่นั่ง Premium Comfort",
  //   subcategory: "โซฟาและเก้าอี้",
  //   category: "เฟอร์นิเจอร์ห้องนั่งเล่น",
  //   sold: 1250,
  //   description: "โซฟาผ้าคุณภาพพรีเมียม ออกแบบเพื่อความสะดวกสบายสูงสุด ผลิตจากผ้าคุณภาพดีนำเข้าจากยุโรป มีโครงสร้างไม้แข็งแรง ฟองน้ำหนาพิเศษ เหมาะสำหรับการนั่งเล่นและพักผ่อนในบ้าน",
  //   // specifications: {
  //   //   "ขนาด": "200 x 85 x 80 ซม.",
  //   //   "วัสดุโครง": "ไม้ยางพารา",
  //   //   "วัสดุเบาะ": "ฟองน้ำ High Density",
  //   //   "วัสดุหุ้ม": "ผ้า Cotton Blend",
  //   //   "น้ำหนัก": "45 กก.",
  //   //   "รับน้ำหนัก": "300 กก."
  //   // },
  //   images: [
  //     "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&h=600&fit=crop",
  //     "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600&fit=crop",
  //     "https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=800&h=600&fit=crop",
  //     "https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=800&h=600&fit=crop"
  //   ],
  //   // variants: [
  //   //   { name: "สีเทาอ่อน", color: "#E5E7EB", inStock: true },
  //   //   { name: "สีน้ำเงินเข้ม", color: "#1E40AF", inStock: true },
  //   //   { name: "สีน้ำตาลอ่อน", color: "#92400E", inStock: false }
  //   // ],
  //   tags: ["ขายดี", "ยอดขายสูงสุด", "ใหม่ล่าสุด", "แนะนำ"]
  // };
  const relatedProducts = [
    {
      id: 2,
      name: "โต๊ะกลางไม้สัก Modern",
      price: "฿8,900",
      image: "https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=400&h=300&fit=crop",
      rating: 4.6,
      reviews: 89
    },
    {
      id: 3,
      name: "เก้าอี้พักผ่อน Relax",
      price: "฿12,500",
      image: "https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=400&h=300&fit=crop",
      rating: 4.7,
      reviews: 156
    },
    {
      id: 4,
      name: "โคมไฟตั้งพื้น LED",
      price: "฿3,200",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop",
      rating: 4.5,
      reviews: 234
    },
    {
      id: 5,
      name: "พรมปูพื้น Persian Style",
      price: "฿4,800",
      image: "https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=400&h=300&fit=crop",
      rating: 4.8,
      reviews: 78
    }
  ];

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedElements(new Set(['hero', 'gallery', 'info', 'related']));
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const ProductImageGallery = () => (
    <div className={`relative transition-all duration-1000 ${
      animatedElements.has('gallery') ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'
    }`}>
      {/* Main Image */}
      <div className="relative group mb-6 rounded-3xl overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200 shadow-2xl">
        <img
          src={productData.images[selectedImage]}
          alt={productData.name}
          className="w-full h-96 lg:h-[500px] object-cover transition-transform duration-500 group-hover:scale-105"
        />
        
        {/* Image Overlay Controls */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300">
          <div className="absolute top-4 right-4 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <button className="p-3 bg-white/90 backdrop-blur-md rounded-full hover:bg-white transition-colors">
              <ZoomIn size={20} className="text-slate-700" />
            </button>
            <button className="p-3 bg-white/90 backdrop-blur-md rounded-full hover:bg-white transition-colors">
              <Share2 size={20} className="text-slate-700" />
            </button>
          </div>
          
          <div className="absolute bottom-4 left-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <button className="inline-flex items-center px-4 py-2 bg-white/90 backdrop-blur-md rounded-full text-slate-700 hover:bg-white transition-colors">
              <Play size={16} className="mr-2" />
              ดู 360°
            </button>
          </div>
        </div>

        {/* Discount Badge */}
        {/* <div className="absolute top-4 left-4 px-4 py-2 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-full font-bold shadow-lg">
          -{productData.discount}
        </div> */}
      </div>

      {/* Thumbnail Images */}
      <div className="grid grid-cols-4 gap-3">
        {productData.images.map((image, index) => (
          <button
            key={index}
            onClick={() => setSelectedImage(index)}
            className={`relative rounded-2xl overflow-hidden transition-all duration-300 ${
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
  );

  const ProductInfo = () => (
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
        {productData.tags.map((tag, index) => (
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
          {/* {[...Array(5)].map((_, i) => (
            <Star 
              key={i} 
              size={20} 
              className={i < Math.floor(productData.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'} 
            />
          ))} */}
          <span className="font-bold text-slate-700 ml-2">{productData.rating}</span>
        </div>
        <span className="text-slate-500">• ขายแล้ว {productData.sold} ชิ้น</span>
      </div>

      {/* Price */}
      {/* <div className="mb-8">
        <div className="flex items-center space-x-4 mb-2">
          <span className="text-4xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
            {productData.price}
          </span>
          <span className="text-xl text-slate-400 line-through">{productData.originalPrice}</span>
        </div>
        <p className="text-slate-600">รวม VAT แล้ว ไม่รวมค่าจัดส่ง</p>
      </div> */}

      {/* Color Variants */}
      {/* <div className="mb-8">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">เลือกสี</h3>
        <div className="flex space-x-3">
          {productData.variants.map((variant, index) => (
            <button
              key={index}
              onClick={() => setSelectedVariant(index)}
              disabled={!variant.inStock}
              className={`relative p-1 rounded-full transition-all duration-300 ${
                selectedVariant === index ? 'ring-4 ring-cyan-400 scale-110' : 'hover:scale-105'
              } ${!variant.inStock ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <div 
                className="w-12 h-12 rounded-full border-2 border-white shadow-lg"
                style={{ backgroundColor: variant.color }}
              ></div>
              {!variant.inStock && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-8 h-0.5 bg-red-500 rotate-45"></div>
                </div>
              )}
            </button>
          ))}
        </div>
        <p className="text-sm text-slate-600 mt-2">
          สี: {productData.variants[selectedVariant].name}
          {!productData.variants[selectedVariant].inStock && " (สินค้าหมด)"}
        </p>
      </div> */}

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
          <button className="w-full py-4 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold rounded-2xl hover:from-cyan-600 hover:to-blue-600 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl">
            <ShoppingCart className="inline mr-2" size={20} />
            สั่งซื้อ
          </button>
          {/* <button 
            onClick={() => setIsFavorite(!isFavorite)}
            className={`w-full py-4 font-bold rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl ${
              isFavorite 
                ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white' 
                : 'bg-gradient-to-r from-slate-200 to-slate-300 text-slate-700 hover:from-slate-300 hover:to-slate-400'
            }`}
          >
            <Heart className="inline mr-2" size={20} fill={isFavorite ? 'currentColor' : 'none'} />
            {isFavorite ? 'ลบออกจากรายการโปรด' : 'เพิ่มในรายการโปรด'}
          </button> */}
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
  );

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
            
            {/* <h4 className="text-xl font-semibold text-slate-800 mt-8 mb-4">จุดเด่นของสินค้า</h4> */}
            {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {productData.features.map((feature, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <CheckCircle className="text-green-500 mt-1 flex-shrink-0" size={20} />
                  <p className="text-slate-600">{feature}</p>
                </div>
              ))}
            </div> */}
          </div>
        )}

        {/* {activeTab === 'specifications' && (
          <div>
            <h3 className="text-2xl font-bold text-slate-800 mb-6">ข้อมูลเทคนิค</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Object.entries(productData.specifications).map(([key, value], index) => (
                <div key={index} className="flex justify-between items-center py-3 border-b border-slate-200">
                  <span className="font-semibold text-slate-700">{key}</span>
                  <span className="text-slate-600">{value}</span>
                </div>
              ))}
            </div>
          </div>
        )} */}

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
            <div className="flex items-center space-x-2 mb-3">
              <div className="flex items-center">
                <Star size={14} className="text-yellow-400 fill-current" />
                <span className="text-sm font-semibold ml-1">{product.rating}</span>
              </div>
              <span className="text-sm text-slate-500">({product.reviews})</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
                {product.price}
              </span>
              <button className="p-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-full hover:from-cyan-600 hover:to-blue-600 transition-all duration-300 transform hover:scale-110">
                <Eye size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
   if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">กำลังโหลดสินค้า...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-cyan-50">
      {/* Back Button */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl pt-8">
        <button className="inline-flex items-center space-x-2 text-slate-600 hover:text-cyan-600 transition-colors mb-8">
          <ArrowLeft size={20} />
          <span>กลับไปหน้าหมวดหมู่</span>
        </button>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          {/* Product Gallery */}
          <ProductImageGallery />
          
          {/* Product Info */}
          <ProductInfo />
        </div>

        {/* Product Details Tabs */}
        <ProductTabs />

        {/* Related Products */}
        <RelatedProducts />
      </div>

      {/* Floating Action Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <button className="p-4 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-full shadow-2xl hover:from-cyan-600 hover:to-blue-600 transition-all duration-300 transform hover:scale-110">
          <MessageCircle size={24} />
        </button>
      </div>

      {/* Enhanced Footer */}
      <footer className="bg-gradient-to-r from-slate-800 to-slate-900 text-white py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4 text-cyan-400">เกี่ยวกับเรา</h3>
              <p className="text-gray-300 leading-relaxed">
                ผู้เชี่ยวชาญด้านเฟอร์นิเจอร์คุณภาพสูง มุ่งมั่นสร้างสรรค์พื้นที่อยู่อาศัยที่สมบูรณ์แบบ
              </p>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-4 text-cyan-400">หมวดหมู่สินค้า</h3>
              <div className="space-y-2 text-gray-300">
                <p className="hover:text-cyan-400 cursor-pointer transition-colors">เฟอร์นิเจอร์ห้องนั่งเล่น</p>
                <p className="hover:text-cyan-400 cursor-pointer transition-colors">เฟอร์นิเจอร์ห้องนอน</p>
                <p className="hover:text-cyan-400 cursor-pointer transition-colors">เฟอร์นิเจอร์ห้องครัว</p>
                <p className="hover:text-cyan-400 cursor-pointer transition-colors">เฟอร์นิเจอร์สำนักงาน</p>
              </div>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-4 text-cyan-400">บริการลูกค้า</h3>
              <div className="space-y-2 text-gray-300">
                <p className="flex items-center">
                  <span className="mr-2">📞</span> 02-xxx-xxxx
                </p>
                <p className="flex items-center">
                  <span className="mr-2">📧</span> support@furniture.com
                </p>
                <p className="flex items-center">
                  <span className="mr-2">🕒</span> จันทร์-เสาร์ 09:00-18:00
                </p>
                <p className="flex items-center">
                  <span className="mr-2">💬</span> แชทสด 24/7
                </p>
              </div>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-4 text-cyan-400">ติดตามเรา</h3>
              <div className="flex space-x-4 mb-4">
                <button className="w-12 h-12 bg-gradient-to-r from-blue-600 to-blue-700 rounded-full flex items-center justify-center hover:from-blue-500 hover:to-blue-600 transition-all duration-300 transform hover:scale-110">
                  <span className="text-white font-bold">f</span>
                </button>
                <button className="w-12 h-12 bg-gradient-to-r from-pink-600 to-rose-600 rounded-full flex items-center justify-center hover:from-pink-500 hover:to-rose-500 transition-all duration-300 transform hover:scale-110">
                  <span className="text-white font-bold">ig</span>
                </button>
                <button className="w-12 h-12 bg-gradient-to-r from-green-600 to-emerald-600 rounded-full flex items-center justify-center hover:from-green-500 hover:to-emerald-500 transition-all duration-300 transform hover:scale-110">
                  <span className="text-white font-bold">L</span>
                </button>
                <button className="w-12 h-12 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-full flex items-center justify-center hover:from-cyan-500 hover:to-blue-500 transition-all duration-300 transform hover:scale-110">
                  <span className="text-white font-bold">X</span>
                </button>
              </div>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Zap className="text-cyan-400" size={16} />
                  <span className="text-gray-300 text-sm">อัพเดทโปรโมชั่นใหม่</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Award className="text-cyan-400" size={16} />
                  <span className="text-gray-300 text-sm">รับสิทธิพิเศษก่อนใคร</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-700 mt-12 pt-8">
            <div className="flex flex-col md:flex-row items-center justify-between">
              <p className="text-gray-400 mb-4 md:mb-0">
                © 2025 Modern Furniture Store. สงวนลิขสิทธิ์ทั้งหมด
              </p>
              <div className="flex space-x-6 text-gray-400 text-sm">
                <a href="#" className="hover:text-cyan-400 transition-colors">นโยบายความเป็นส่วนตัว</a>
                <a href="#" className="hover:text-cyan-400 transition-colors">เงื่อนไขการใช้งาน</a>
                <a href="#" className="hover:text-cyan-400 transition-colors">นโยบายการคืนสินค้า</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default SubcategoryProductDetail;