import React, { useState, useEffect } from 'react';
import { ChevronRight, ShoppingCart, Heart, Star, Eye, Plus, Filter, Grid, List, Search } from 'lucide-react';
import { useParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
const SubcategoryShowcase = () => {
    const navigate = useNavigate();
      const { categoryId } = useParams(); // ✅ ดึงค่าจาก URL
  const [visibleProducts, setVisibleProducts] = useState({});
  const [favorites, setFavorites] = useState(new Set());
  const [animatedCards, setAnimatedCards] = useState(new Set());
  const [subcategories, setSubcategories] = useState([]);
  const [viewMode, setViewMode] = useState('grid');
  const [searchTerm, setSearchTerm] = useState('');
    const navigateToInCategory = (subcategoryId) => {
    // สำหรับการทดสอบ เราจะใช้ alert แต่ในระบบจริงคุณจะใช้ router
    // ในระบบจริงจะเป็นแบบนี้:
    navigate(`/P_insubcategory/${subcategoryId}`);
    // หรือ window.location.href = `/category/${encodeURIComponent(categoryName)}`;
  };
 useEffect(() => {
  fetch(`http://localhost:5000/api/store/subcategories/${categoryId}`)
    .then(res => res.json())
    .then(data => setSubcategories(data))
    .catch(err => console.error('Error fetching categories:', err));
}, [categoryId]);

  // Initialize visible products
  useEffect(() => {
    const initial = {};
    subcategories.forEach(subcat => {
      initial[subcat.id] = 4;
    });
    setVisibleProducts(initial);
  }, [subcategories]);

  // Animate cards on load
  useEffect(() => {
    const timer = setTimeout(() => {
      const allProductIds = subcategories.flatMap(subcat => 
        subcat.products.slice(0, 4).map(p => p.id)
      );
      setAnimatedCards(new Set(allProductIds));
    }, 100);
    return () => clearTimeout(timer);
  }, [subcategories]);

  const showMoreProducts = (subcategoryId) => {
    const subcategory = subcategories.find(s => s.id === subcategoryId);
    setVisibleProducts(prev => ({
      ...prev,
      [subcategoryId]: subcategory.products.length
    }));
    
    const newCards = subcategory.products.slice(visibleProducts[subcategoryId]);
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

  const navigateToProduct = (productId) => {
    console.log(`Navigate to product: ${productId}`);
  };

  const ProductCard = ({ product, index, accentColor }) => {
    const isAnimated = animatedCards.has(product.id);
    const isFavorite = favorites.has(product.id);
    
    const colorVariants = {
      purple: 'hover:border-purple-400/60 hover:shadow-purple-200/50',
      emerald: 'hover:border-emerald-400/60 hover:shadow-emerald-200/50',
      amber: 'hover:border-amber-400/60 hover:shadow-amber-200/50'
    };
    
    return (
      <div 
        className={`group product-card bg-white/90 backdrop-blur-md rounded-3xl p-6 
          hover:bg-white/95 transition-all duration-500 hover:scale-105 hover:shadow-2xl 
          border border-gray-200/60 ${colorVariants[accentColor]} cursor-pointer
          ${isAnimated ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
        style={{ 
          animationDelay: `${index * 150}ms`,
          transition: 'all 0.8s ease-out'
        }}
        onClick={() => navigateToProduct(product.id)}
      >
        <div className="relative mb-5">
          <div className="mb-4 group-hover:scale-110 transition-transform duration-300 text-center overflow-hidden rounded-2xl">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-48 object-cover"
              onError={(e) => {
                e.target.src = `https://via.placeholder.com/400x300/6366f1/ffffff?text=${encodeURIComponent(product.name)}`;
              }}
            />
          </div>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              toggleFavorite(product.id);
            }}
            className={`absolute top-3 right-3 p-2.5 rounded-full transition-all duration-300 backdrop-blur-md
              ${isFavorite ? 'text-red-500 bg-red-100/90' : 'text-gray-400 hover:text-red-500 bg-white/90'}`}
          >
            <Heart size={18} fill={isFavorite ? 'currentColor' : 'none'} />
          </button>
          <div className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r 
            ${accentColor === 'purple' ? 'from-purple-500 to-pink-500' : 
              accentColor === 'emerald' ? 'from-emerald-500 to-teal-500' : 
              'from-amber-500 to-orange-500'} text-white`}>
            {product.category}
          </div>
        </div>
        
        <h3 className="text-lg font-bold text-slate-800 mb-3 group-hover:text-violet-600 transition-colors line-clamp-2 leading-snug">
          {product.name}
        </h3>
        
        <div className="flex items-center mb-4">
          <div className="flex items-center text-yellow-500 mr-3">
            <Star size={16} fill="currentColor" />
            <span className="ml-1 text-sm font-semibold">{product.rating}</span>
          </div>
          <span className="text-slate-500 text-sm">({product.reviews} รีวิว)</span>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
            {product.price}
          </span>
          <div className="flex space-x-2">
            <button className="p-2.5 rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors group-hover:scale-110">
              <Eye size={16} />
            </button>
            <button className={`p-2.5 rounded-full transition-colors group-hover:scale-110 ${
              accentColor === 'purple' ? 'bg-purple-100 text-purple-600 hover:bg-purple-200' :
              accentColor === 'emerald' ? 'bg-emerald-100 text-emerald-600 hover:bg-emerald-200' :
              'bg-amber-100 text-amber-600 hover:bg-amber-200'
            }`}>
              <ShoppingCart size={16} />
            </button>
          </div>
        </div>
      </div>
    );
  };

  const filteredSubcategories = subcategories.filter(subcat =>
    subcat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    subcat.products.some(product => 
      product.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 py-24">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute inset-0 opacity-20" 
             style={{
               backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
             }}>
        </div>
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl relative z-10">
          <div className="text-center animate-pulse">
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold text-white mb-6">
              เฟอร์นิเจอร์ห้องนั่งเล่น
            </h1>
            <p className="text-xl sm:text-2xl text-white/90 mb-8 max-w-3xl mx-auto">
              ค้นพบสินค้าคุณภาพดีในหมวดหมู่ย่อยที่คัดสรรมาอย่างดี
            </p>
            
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto mb-8">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="ค้นหาสินค้าในหมวดหมู่นี้..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 rounded-full bg-white/20 backdrop-blur-md text-white placeholder-white/70 border border-white/30 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center space-y-3 sm:space-y-0 sm:space-x-8 text-white/90">
              <div className="flex items-center">
                <Star className="text-yellow-400 mr-2" fill="currentColor" />
                <span className="text-lg">4.7 คะแนนเฉลี่ย</span>
              </div>
              <div className="hidden sm:block text-white/60">•</div>
              <div className="text-lg">500+ สินค้า</div>
              <div className="hidden sm:block text-white/60">•</div>
              <div className="text-lg">ส่งฟรีทั่วไทย</div>
            </div>
          </div>
        </div>
        
        <div className="absolute bottom-0 left-0 w-full h-20 bg-gradient-to-t from-indigo-50 to-transparent"></div>
      </div>

      {/* Filter & View Toggle */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl py-8">
        <div className="flex flex-col sm:flex-row items-center justify-between mb-8 bg-white/70 backdrop-blur-md rounded-2xl p-6 border border-gray-200/50">
          <div className="flex items-center space-x-4 mb-4 sm:mb-0">
            <Filter className="text-gray-600" size={20} />
            <span className="text-gray-700 font-medium">แสดง {filteredSubcategories.length} หมวดหมู่ย่อย</span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-3 rounded-xl transition-all duration-300 ${
                viewMode === 'grid' 
                  ? 'bg-indigo-500 text-white shadow-lg' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Grid size={20} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-3 rounded-xl transition-all duration-300 ${
                viewMode === 'list' 
                  ? 'bg-indigo-500 text-white shadow-lg' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <List size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Subcategories Section */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl pb-20">
        {filteredSubcategories.map((subcategory, categoryIndex) => (
          <div key={subcategory.id} className="mb-24">
            {/* Subcategory Header */}
            <div className={`relative overflow-hidden rounded-3xl p-8 mb-12 bg-gradient-to-r ${subcategory.bgGradient} border border-gray-200/30 transition-all duration-1000 opacity-100`}>
              <div className="flex items-center">
                <div className={`text-5xl mr-6 p-6 rounded-2xl bg-gradient-to-r ${subcategory.gradient} shadow-xl`}>
                  {subcategory.icon}
                </div>
                <div>
                  <h2 className="text-3xl sm:text-4xl font-bold text-slate-800 mb-3">{subcategory.name}</h2>
                  <p className="text-slate-600 text-lg">{subcategory.description}</p>
                  <div className="flex items-center mt-4 space-x-4 text-sm text-slate-500">
                    <span>• {subcategory.products.length} สินค้า</span>
                    <span>• ส่งฟรี</span>
                    <span>• รับประกันคุณภาพ</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Products Grid */}
            <div className={`grid gap-6 mb-12 ${
              viewMode === 'grid' 
                ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
                : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
            }`}>
              {subcategory.products.slice(0, visibleProducts[subcategory.id] || 4).map((product, index) => (
                <ProductCard 
                  key={product.id} 
                  product={product} 
                  index={index} 
                  accentColor={subcategory.accentColor}
                />
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
              {/* Show More Button */}
              {visibleProducts[subcategory.id] < subcategory.products.length && (
                <button
                  onClick={() => showMoreProducts(subcategory.id)}
                  className={`group inline-flex items-center px-8 py-4 bg-gradient-to-r ${subcategory.gradient}
                    text-white font-semibold rounded-full hover:shadow-2xl 
                    transition-all duration-300 transform hover:scale-105`}
                >
                  <Plus size={20} className="mr-3 group-hover:rotate-180 transition-transform duration-300" />
                  ดูเพิ่มเติม ({subcategory.products.length - visibleProducts[subcategory.id]} สินค้า)
                  <ChevronRight size={20} className="ml-3 group-hover:translate-x-1 transition-transform duration-300" />
                </button>
              )}

              {/* View All Button */}
              <button
                onClick={() => navigateToInCategory(subcategory.id)}
                className="group inline-flex items-center px-8 py-4 bg-gradient-to-r from-slate-600 to-slate-700
                  text-white font-semibold rounded-full hover:from-slate-500 hover:to-slate-600 
                  transition-all duration-300 transform hover:scale-105 hover:shadow-2xl"
              >
                <Eye size={20} className="mr-3 group-hover:scale-110 transition-transform duration-300" />
                ดูสินค้าทั้งหมดใน {subcategory.name}
                <ChevronRight size={20} className="ml-3 group-hover:translate-x-1 transition-transform duration-300" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Enhanced Footer */}
      <footer className="bg-gradient-to-r from-slate-900 to-slate-800 text-white py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
            <div>
              <h3 className="text-xl font-bold mb-4">เกี่ยวกับเรา</h3>
              <p className="text-gray-300 leading-relaxed">
                เราคือผู้เชี่ยวชาญด้านเฟอร์นิเจอร์คุณภาพดี มุ่งมั่นนำเสนอสินค้าที่ดีที่สุดเพื่อบ้านของคุณ
              </p>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-4">บริการลูกค้า</h3>
              <div className="space-y-2 text-gray-300">
                <p>📞 02-xxx-xxxx</p>
                <p>📧 info@furniture.com</p>
                <p>🕒 จันทร์-เสาร์ 09:00-18:00</p>
              </div>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-4">ติดตามเรา</h3>
              <div className="flex justify-center md:justify-start space-x-4">
                <button className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center hover:bg-blue-500 transition-colors">
                  f
                </button>
                <button className="w-10 h-10 bg-pink-600 rounded-full flex items-center justify-center hover:bg-pink-500 transition-colors">
                  ig
                </button>
                <button className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center hover:bg-green-500 transition-colors">
                  L
                </button>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-12 pt-8 text-center text-gray-400">
            <p>© 2025 Furniture Store. สงวนลิขสิทธิ์ทั้งหมด</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default SubcategoryShowcase;