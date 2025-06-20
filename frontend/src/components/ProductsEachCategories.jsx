import React, { useState, useEffect } from 'react';
import { ChevronRight, ShoppingCart, Heart, Star, Eye, Plus } from 'lucide-react';

const ProductShowcase = () => {
  const [visibleProducts, setVisibleProducts] = useState({});
  const [favorites, setFavorites] = useState(new Set());
  const [animatedCards, setAnimatedCards] = useState(new Set());
//  const [categories, setCategories] = useState([]);
//   const [loading, setLoading] = useState(true); // สำหรับสถานะโหลด
//   const [error, setError] = useState(null);


useEffect(() => {
  fetch('/api/store/categories')
    .then(res => res.json())
    .then(data => setCategories(data))
    .catch(err => console.error('Error fetching categories:', err));
}, []);

  const categories = {
    'เทคโนโลยี': {
      icon: '💻',
      gradient: 'from-purple-600 to-blue-600',
      products: [
        { id: 1, name: 'MacBook Pro M3', price: '฿65,000', image: '🖥️', rating: 4.8, reviews: 324 },
        { id: 2, name: 'iPhone 15 Pro', price: '฿42,900', image: '📱', rating: 4.9, reviews: 567 },
        { id: 3, name: 'AirPods Pro', price: '฿8,990', image: '🎧', rating: 4.7, reviews: 234 },
        { id: 4, name: 'iPad Air', price: '฿24,900', image: '📟', rating: 4.6, reviews: 189 }
      ]
    },
    'แฟชั่น': {
      icon: '👕',
      gradient: 'from-pink-600 to-rose-600', 
      products: [
        { id: 5, name: 'เสื้อโปโลผู้ชาย', price: '฿1,290', image: '👔', rating: 4.5, reviews: 156 },
        { id: 6, name: 'กระเป๋าหนังแท้', price: '฿3,500', image: '👜', rating: 4.8, reviews: 89 },
        { id: 7, name: 'รองเท้าผ้าใบ', price: '฿2,890', image: '👟', rating: 4.6, reviews: 267 },
        { id: 8, name: 'นาฬิกาข้อมือ', price: '฿4,500', image: '⌚', rating: 4.7, reviews: 143 }
      ]
    },
    'บ้านและสวน': {
      icon: '🏠',
      gradient: 'from-green-600 to-teal-600',
      products: [
        { id: 9, name: 'โซฟาผ้า 3 ที่นั่ง', price: '฿15,900', image: '🛋️', rating: 4.4, reviews: 78 },
        { id: 10, name: 'โต๊ะทำงานไม้', price: '฿4,200', image: '🪑', rating: 4.6, reviews: 134 },
        { id: 11, name: 'ต้นไผ่ในกระถาง', price: '฿890', image: '🌿', rating: 4.3, reviews: 56 },
        { id: 12, name: 'โคมไฟตั้งโต๊ะ', price: '฿1,450', image: '💡', rating: 4.5, reviews: 98 }
      ]
    },
    'อาหารและเครื่องดื่ม': {
      icon: '🍽️',
      gradient: 'from-orange-600 to-red-600',
      products: [
        { id: 13, name: 'กาแฟคั่วเข้ม', price: '฿450', image: '☕', rating: 4.7, reviews: 289 },
        { id: 14, name: 'น้ำผึ้งแท้', price: '฿320', image: '🍯', rating: 4.8, reviews: 156 },
        { id: 15, name: 'ชาเขียวออร์แกนิก', price: '฿280', image: '🍵', rating: 4.6, reviews: 178 },
        { id: 16, name: 'ผลไม้อบแห้ง', price: '฿180', image: '🥜', rating: 4.4, reviews: 92 }
      ]
    },
    'กีฬาและออกกำลังกาย': {
      icon: '🏃‍♂️',
      gradient: 'from-cyan-600 to-blue-600',
      products: [
        { id: 17, name: 'ดัมเบลปรับน้ำหนัก', price: '฿2,890', image: '🏋️', rating: 4.6, reviews: 234 },
        { id: 18, name: 'เสื่อโยคะ', price: '฿590', image: '🧘', rating: 4.5, reviews: 167 },
        { id: 19, name: 'รองเท้าวิ่ง', price: '฿3,200', image: '👟', rating: 4.8, reviews: 345 },
        { id: 20, name: 'ขวดน้ำสเตนเลส', price: '฿790', image: '🍼', rating: 4.4, reviews: 123 }
      ]
    }
  };

  // Initialize visible products (show 2 products per category initially)
  useEffect(() => {
    const initial = {};
    Object.keys(categories).forEach(category => {
      initial[category] = 2;
    });
    setVisibleProducts(initial);
  }, []);

  // Animate cards on load
  useEffect(() => {
    const timer = setTimeout(() => {
      const allProductIds = Object.values(categories).flatMap(cat => 
        cat.products.slice(0, 2).map(p => p.id)
      );
      setAnimatedCards(new Set(allProductIds));
    }, 100);
    return () => clearTimeout(timer);
  }, []);

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

  const ProductCard = ({ product, index }) => {
    const isAnimated = animatedCards.has(product.id);
    const isFavorite = favorites.has(product.id);
    
    return (
      <div 
        className={`group product-card bg-white/80 backdrop-blur-sm rounded-2xl p-4 sm:p-6 
          hover:bg-white/90 transition-all duration-500 hover:scale-105 hover:shadow-2xl 
          border border-sky-200/50 hover:border-blue-400/50 cursor-pointer
          ${isAnimated ? 'animate-fade-in-up' : 'opacity-0'}`}
        style={{ animationDelay: `${index * 100}ms` }}
      >
        <div className="relative mb-3 sm:mb-4">
          <div className="text-4xl sm:text-5xl lg:text-6xl mb-3 sm:mb-4 group-hover:scale-110 transition-transform duration-300 text-center">
            {product.image}
          </div>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              toggleFavorite(product.id);
            }}
            className={`absolute top-0 right-0 p-1.5 sm:p-2 rounded-full transition-all duration-300
              ${isFavorite ? 'text-red-500 bg-red-100' : 'text-gray-400 hover:text-red-500'}`}
          >
            <Heart size={16} fill={isFavorite ? 'currentColor' : 'none'} />
          </button>
        </div>
        
        <h3 className="text-sm sm:text-base lg:text-lg font-semibold text-slate-800 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
          {product.name}
        </h3>
        
        <div className="flex items-center mb-2 sm:mb-3">
          <div className="flex items-center text-yellow-500 mr-2">
            {/* <Star size={12} fill="currentColor" />
            <span className="ml-1 text-xs sm:text-sm font-medium">{product.rating}</span> */}
          </div>
          {/* <span className="text-slate-500 text-xs sm:text-sm">({product.reviews})</span> */}
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-lg sm:text-xl lg:text-2xl font-bold text-sky-600">{product.price}</span>
          <div className="flex space-x-1 sm:space-x-2">
            <button className="p-1.5 sm:p-2 rounded-full bg-sky-100 text-sky-600 hover:bg-sky-200 transition-colors">
              <Eye size={14} />
            </button>
            <button className="p-1.5 sm:p-2 rounded-full bg-green-100 text-green-600 hover:bg-green-200 transition-colors">
              <ShoppingCart size={14} />
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-blue-50 to-cyan-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-sky-200 to-blue-300 py-20">
        <div className="absolute inset-0 bg-white/20"></div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl relative z-10">
          <div className="text-center animate-fade-in">
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold text-slate-800 mb-6 bg-gradient-to-r from-sky-600 to-blue-600 bg-clip-text text-transparent">
              ร้านค้าออนไลน์
            </h1>
            <p className="text-lg sm:text-xl text-slate-700 mb-8 max-w-2xl mx-auto">
              ค้นพบสินค้าคุณภาพดี ราคาดี จากทุกหมวดหมู่ในที่เดียว
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-4">
              <div className="flex items-center text-slate-600">
                <Star className="text-yellow-500 mr-1" fill="currentColor" />
                <span>4.8 คะแนนเฉลี่ย</span>
              </div>
              <div className="hidden sm:block text-slate-600">•</div>
              <div className="text-slate-600">10,000+ สินค้า</div>
              <div className="hidden sm:block text-slate-600">•</div>
              <div className="text-slate-600">ส่งฟรีทั่วไทย</div>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 w-full h-16 bg-gradient-to-t from-sky-50 to-transparent"></div>
      </div>

      {/* Products Section */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl py-16">
        {Object.entries(categories).map(([categoryName, categoryData], categoryIndex) => (
          <div key={categoryName} className="mb-20">
            {/* Category Header */}
            <div className="flex items-center mb-12 animate-slide-in-left" 
                 style={{ animationDelay: `${categoryIndex * 200}ms` }}>
              <div className={`text-4xl mr-4 p-4 rounded-2xl bg-gradient-to-r ${categoryData.gradient} shadow-lg`}>
                {categoryData.icon}
              </div>
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-2">{categoryName}</h2>
                <p className="text-slate-600">สินค้าคุณภาพดีที่คัดสรรมาแล้ว</p>
              </div>
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 mb-8">
              {categoryData.products.slice(0, 4).map((product, index) => (
                  <ProductCard key={product.id} product={product} index={index} />
                ))}
            </div>

            {/* Show More Button */}
            <div className="text-center">
              <button
                onClick={() => {
                  // Navigate to category page - you can replace this with actual routing
                  alert(`ไปยังหน้าหมวดหมู่: ${categoryName}`);
                }}
                className="group inline-flex items-center px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-sky-500 to-blue-600 
                  text-white font-semibold rounded-full hover:from-sky-400 hover:to-blue-500 
                  transition-all duration-300 transform hover:scale-105 hover:shadow-xl text-sm sm:text-base"
              >
                <Plus size={20} className="mr-2 group-hover:rotate-180 transition-transform duration-300" />
                ดูสินค้าทั้งหมดใน{categoryName}
                <ChevronRight size={20} className="ml-2 group-hover:translate-x-1 transition-transform duration-300" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <footer className="bg-white/80 backdrop-blur-sm border-t border-sky-200/50 py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl text-center">
          <p className="text-slate-600 mb-4">© 2025 ร้านค้าออนไลน์ สงวนลิขสิทธิ์</p>
          <div className="flex flex-col sm:flex-row justify-center space-y-2 sm:space-y-0 sm:space-x-6 text-sky-600">
            <a href="#" className="hover:text-blue-500 transition-colors">เกี่ยวกับเรา</a>
            <a href="#" className="hover:text-blue-500 transition-colors">ติดต่อ</a>
            <a href="#" className="hover:text-blue-500 transition-colors">เงื่อนไขการใช้งาน</a>
          </div>
        </div>
      </footer>

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-50px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .animate-fade-in-up {
          animation: fadeInUp 0.6s ease-out forwards;
        }

        .animate-fade-in {
          animation: fadeIn 1s ease-out;
        }

        .animate-slide-in-left {
          animation: slideInLeft 0.8s ease-out;
        }

        .product-card {
          backdrop-filter: blur(10px);
        }

        .product-card:hover {
          box-shadow: 0 25px 50px -12px rgba(14, 165, 233, 0.3);
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