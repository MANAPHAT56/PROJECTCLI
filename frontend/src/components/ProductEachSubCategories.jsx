import React, { useState, useEffect } from 'react';
import { ChevronRight, ShoppingCart, Heart, Star, Eye, Plus } from 'lucide-react';
import { useParams,useNavigate } from 'react-router-dom';

const ProductShowcase = () => {
  const [visibleProducts, setVisibleProducts] = useState({});
  const [favorites, setFavorites] = useState(new Set());
  const [animatedCards, setAnimatedCards] = useState(new Set());
  const [categories, setCategories] = useState({});
  const [loading, setLoading] = useState(true); // เพิ่ม loading state
  const {categoryId} = useParams(); // สำหรับตัวอย่าง
  const navigate = useNavigate();

  const navigateToCategory = (subcategoryId) => {
     navigate(`/P_insubcategory/${subcategoryId}`);
  };

  const navigateToProduct = (productId) => {
  navigate(`/detailProducts/${productId}`);
  };

 const apiBaseUrl = "http://localhost:5000"

  useEffect( () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    const loadData = async () => {
    setLoading(true); // เริ่มต้น loading
    try {
      const response = await fetch(`${apiBaseUrl}/api/store/subcategories/${categoryId}`);
      const data = await response.json();
      setCategories(data);
    } catch (err) {
      console.error('โหลดหมวดหมู่ย่อยล้มเหลว:', err);
    } finally {
      setLoading(false); // หยุด loading เมื่อเสร็จ
    }
  };

  loadData();
}, [categoryId]);

  // Initialize visible products (show 4 products per category initially)
  useEffect(() => {
    const initial = {};
    Object.keys(categories).forEach(category => {
      initial[category] = 4;
    });
    setVisibleProducts(initial);
  }, [categories]);

  // Animate cards on load
  useEffect(() => {
    const timer = setTimeout(() => {
      const allProductIds = Object.values(categories).flatMap(cat => 
        cat.products.slice(0, 4).map(p => p.id)
      );
      setAnimatedCards(new Set(allProductIds));
    }, 100);
    return () => clearTimeout(timer);
  }, [categories]);

  const showMoreProducts = (category) => {
    setVisibleProducts(prev => ({
      ...prev,
      [category]: categories[category].products.length
    }));
    
    // Animate new cards
    const newCards = categories[category].products.slice(visibleProducts[category]);
    setTimeout(() => {
      setAnimatedCards(prev => new Set([...prev, ...newCards.map(p => p.id)]));
    }, 50);
  };

  const toggleFavorite = (productId) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(productId)) {
        newFavorites.delete(productId);
      } else {
        newFavorites.add(productId);
      }
      return newFavorites;
    });
  };

  // Skeleton Loading Components
  const SkeletonCard = ({ index }) => (
    <div 
      className="bg-white/90 backdrop-blur-sm rounded-xl p-3 border border-slate-200/70 animate-pulse"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div className="relative mb-3">
        <div className="w-full h-48 bg-gray-300 rounded-lg"></div>
        <div className="absolute top-2 right-2 w-7 h-7 bg-gray-300 rounded-full"></div>
      </div>
      <div className="space-y-2">
        <div className="h-4 bg-gray-300 rounded w-3/4"></div>
        <div className="h-4 bg-gray-300 rounded w-1/2"></div>
        <div className="flex items-center justify-between">
          <div className="h-6 bg-gray-300 rounded w-20"></div>
          <div className="flex space-x-1">
            <div className="w-7 h-7 bg-gray-300 rounded-full"></div>
          </div>
        </div>
      </div>
    </div>
  );

  const SkeletonCategoryHeader = ({ index }) => (
    <div 
      className="flex items-center justify-between mb-6 animate-pulse"
      style={{ animationDelay: `${index * 200}ms` }}
    >
      <div className="flex items-center">
        <div className="w-8 h-8 bg-gray-300 rounded mr-3"></div>
        <div className="h-6 bg-gray-300 rounded w-40"></div>
      </div>
      <div className="h-4 bg-gray-300 rounded w-20"></div>
    </div>
  );

  const SkeletonSection = ({ categoryIndex }) => (
    <div key={categoryIndex} className="mb-12">
      <SkeletonCategoryHeader index={categoryIndex} />
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6">
        {[...Array(4)].map((_, index) => (
          <SkeletonCard key={index} index={index} />
        ))}
      </div>
    </div>
  );

  const ProductCard = ({ product, index }) => {
    const isAnimated = animatedCards.has(product.id);
    const isFavorite = favorites.has(product.id);
    
    return (
      <div 
        className={`group product-card bg-white/90 backdrop-blur-sm rounded-xl p-3 
          hover:bg-white/95 transition-all duration-500 hover:scale-105 hover:shadow-2xl 
          border border-slate-200/70 hover:border-purple-300/70 cursor-pointer
          ${isAnimated ? 'animate-fade-in-up' : 'opacity-0'}`}
        style={{ animationDelay: `${index * 100}ms` }}
      >
        <div className="relative mb-3">
          <div className="mb-3 group-hover:scale-110 transition-transform duration-300">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-48 object-cover rounded-lg shadow-md"
              onError={(e) => {
                e.target.src = `https://via.placeholder.com/400x300/8b5cf6/ffffff?text=${encodeURIComponent(product.name)}`;
              }}
            />
          </div>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              toggleFavorite(product.id);
            }}
            className={`absolute top-2 right-2 p-1.5 rounded-full transition-all duration-300 backdrop-blur-sm
              ${isFavorite ? 'text-red-500 bg-red-100/90' : 'text-gray-400 hover:text-red-500 bg-white/90'}`}
          >
            <Heart size={16} fill={isFavorite ? 'currentColor' : 'none'} />
          </button>
        </div>
        
        <h3 className="text-sm font-semibold text-slate-800 mb-2 group-hover:text-purple-600 transition-colors line-clamp-2 leading-tight">
          {product.name}
        </h3>
        <div className="flex items-center justify-between">
          <span className="text-lg font-bold text-purple-600">{product.price}</span>
          <div className="flex space-x-1">
            <button onClick={() => navigateToProduct(product.id)} className="p-1.5 rounded-full bg-emerald-100 text-emerald-600 hover:bg-emerald-200 transition-colors">
              <ShoppingCart size={14} /> 
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-indigo-900 via-purple-800 to-blue-700 py-10">
        <div className="absolute inset-0 bg-black/20"></div>

        <div className="container mx-auto px-4 max-w-7xl relative z-10">
          <div className="mt-20 text-center animate-fade-in">
            <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">
              โพธิ์ทอง พริ้นติ้ง
            </h1>
            <p className="text-base md:text-lg text-slate-100 mb-6 max-w-2xl mx-auto">
              ค้นพบสินค้าคุณภาพดี ราคาดี จากทุกหมวดหมู่ในที่เดียว  
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-4 text-sm">
              <div className="flex items-center text-amber-300">
                <Star className="text-amber-400 mr-1" size={16} fill="currentColor" />
                <span>รับสกรีนโลโก้ทุกรูปแบบ</span>
              </div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 w-full h-8 bg-gradient-to-t from-indigo-800 to-transparent"></div>
      </div>

      {/* Products Section */}
      <div className="container mx-auto px-4 max-w-7xl py-8">
        {loading ? (
          // แสดง Skeleton Loading เมื่อกำลังโหลด
          <>
            {[...Array(3)].map((_, categoryIndex) => (
              <SkeletonSection key={categoryIndex} categoryIndex={categoryIndex} />
            ))}
          </>
        ) : (
          // แสดงข้อมูลจริงเมื่อโหลดเสร็จ
          Object.entries(categories).map(([categoryName, categoryData], categoryIndex) => (
            <div key={categoryData.name} className="mb-12">
              {/* Category Header */}
              <div className="flex items-center justify-between mb-6 animate-slide-in-left" 
                   style={{ animationDelay: `${categoryIndex * 200}ms` }}>
                <div className="flex items-center">
                  <div className="text-3xl mr-3">{categoryData.icon}</div>
                  <h2 className="text-xl md:text-2xl font-bold text-slate-800">{categoryData.name}</h2>
                </div>
                <button 
                  onClick={() => navigateToCategory(categoryData.id)}
                  className="flex items-center text-purple-600 hover:text-purple-700 transition-colors text-sm md:text-base"
                >
                  <span>ดูทั้งหมด</span>
                  <ChevronRight size={16} className="ml-1" />
                </button>
              </div>

              {/* Products Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6">
                {categoryData.products
                  .slice(0, visibleProducts[categoryName] || 4)
                  .map((product, index) => (
                    <ProductCard key={product.id} product={product} index={index} />
                  ))}
              </div>

              {/* Show More Button */}
              {visibleProducts[categoryName] < categoryData.products.length && (
                <div className="text-center mt-6">
                  <button
                    onClick={() => showMoreProducts(categoryName)}
                    className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-600 to-violet-600 
                      text-white font-semibold rounded-full hover:from-purple-700 hover:to-violet-700 
                      transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                  >
                    <Plus size={16} className="mr-2" />
                    แสดงเพิ่มเติม
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

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
                  <span className="text-gray-300 text-sm">อัพเดทโปรโมชั่นใหม่</span>
                </div>
                <div className="flex items-center space-x-2">
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

      {/* Custom Animations */}
      <style jsx>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slide-in-left {
          from {
            opacity: 0;
            transform: translateX(-30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
        
        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out forwards;
        }
        
        .animate-fade-in {
          animation: fade-in 1s ease-out;
        }
        
        .animate-slide-in-left {
          animation: slide-in-left 0.6s ease-out forwards;
        }
        
        .animate-pulse {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
};

export default ProductShowcase;