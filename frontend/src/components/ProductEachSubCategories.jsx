import React, { useState, useEffect } from 'react';
import { ChevronRight, ShoppingCart, Heart, Star, Eye, Plus } from 'lucide-react';
import { useNavigate,useParams} from 'react-router-dom';
const ProductShowcase = () => {
  const [visibleProducts, setVisibleProducts] = useState({});
  const [favorites, setFavorites] = useState(new Set());
  const [animatedCards, setAnimatedCards] = useState(new Set());
  const [categories, setCategories] = useState({
  });
  const {categoryId} = useParams();
  const navigate = useNavigate();
      const navigateToCategory = (subcategoryId) => {
    // สำหรับการทดสอบ เราจะใช้ alert แต่ในระบบจริงคุณจะใช้ router
    // ในระบบจริงจะเป็นแบบนี้:
    navigate(`/P_insubcategory/${subcategoryId}`);
    // หรือ window.location.href = `/category/${encodeURIComponent(categoryName)}`;
  };
  const navigateToProduct = (productId) =>{
    navigate(`/detailProducts/${productId}`);
  }
  
 useEffect(() => {
  fetch(`http://localhost:5000/api/store/subcategories/${categoryId}`)
    .then(res => res.json())
    .then(data => setCategories(data))
    .catch(err => console.error('Error fetching categories:', err));
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
              className="w-full h-32 object-cover rounded-lg shadow-md"
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
        
        <div className="flex items-center mb-2">
          <div className="flex items-center text-amber-500 mr-2">
            <Star size={12} fill="currentColor" />
            <span className="ml-1 text-xs font-medium">{product.rating}</span>
          </div>
          <span className="text-slate-500 text-xs">({product.reviews})</span>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-lg font-bold text-purple-600">{product.price}</span>
          <div className="flex space-x-1">
            {/* <button  className="p-1.5 rounded-full bg-indigo-100 text-indigo-600 hover:bg-indigo-200 transition-colors">
              <Eye size={14} />
            </button> */}
            <button  onClick={() => navigateToProduct(product.id)} className="p-1.5 rounded-full bg-emerald-100 text-emerald-600 hover:bg-emerald-200 transition-colors">
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
      <div className="relative overflow-hidden bg-gradient-to-r from-purple-200 via-violet-200 to-fuchsia-200 py-12">
        <div className="absolute inset-0 bg-white/30"></div>
        <div className="container mx-auto px-4 max-w-7xl relative z-10">
          <div className="text-center animate-fade-in">
            <h1 className="text-3xl md:text-5xl font-bold text-slate-800 mb-4 bg-gradient-to-r from-purple-600 to-violet-600 bg-clip-text text-transparent">
              ร้านค้าออนไลน์
            </h1>
            <p className="text-base md:text-lg text-slate-700 mb-6 max-w-2xl mx-auto">
              ค้นพบสินค้าคุณภาพดี ราคาดี จากทุกหมวดหมู่ในที่เดียว
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-4 text-sm">
              <div className="flex items-center text-slate-600">
                <Star className="text-amber-500 mr-1" size={16} fill="currentColor" />
                <span>4.8 คะแนนเฉลี่ย</span>
              </div>
              <div className="hidden sm:block text-slate-600">•</div>
              <div className="text-slate-600">10,000+ สินค้า</div>
              <div className="hidden sm:block text-slate-600">•</div>
              <div className="text-slate-600">ส่งฟรีทั่วไทย</div>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 w-full h-8 bg-gradient-to-t from-violet-50 to-transparent"></div>
      </div>

      {/* Products Section */}
      <div className="container mx-auto px-4 max-w-7xl py-8">
        {Object.entries(categories).map(([categoryName, categoryData], categoryIndex) => (
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

            {/* Products Grid - 2 columns on mobile, 4 on desktop */}
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
        ))}
      </div>

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
        
        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out forwards;
        }
        
        .animate-fade-in {
          animation: fade-in 1s ease-out;
        }
        
        .animate-slide-in-left {
          animation: slide-in-left 0.6s ease-out forwards;
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