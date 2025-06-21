import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Heart, 
  Star, 
  ShoppingCart, 
  Eye, 
  Filter,
  ChevronDown,
  Grid3X3,
  LayoutGrid,
  Search,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import Sort from './Sort.jsx'
const ProductListingPage = () => {
  const [products, setProducts] = useState([]);
  const [favorites, setFavorites] = useState(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState('default');
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [gridSize, setGridSize] = useState(4);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  const productsPerPage = 12;

  // Mock data - ในการใช้งานจริงจะ fetch จาก API
  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      const mockProducts = [
        {
          id: 1,
          name: 'โซฟา 3 ที่นั่ง Luxury Modern',
          price: '฿45,900',
          originalPrice: '฿52,900',
          image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&h=300&fit=crop',
          rating: 4.8,
          reviews: 156,
          isNew: true,
          discount: 13,
          category: 'โซฟา'
        },
        {
          id: 2,
          name: 'เก้าอี้ทำงาน Ergonomic Pro',
          price: '฿12,900',
          originalPrice: '฿15,500',
          image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=300&fit=crop',
          rating: 4.6,
          reviews: 89,
          isNew: false,
          discount: 17,
          category: 'เก้าอี้'
        },
        {
          id: 3,
          name: 'โต๊ะกาแฟไม้โอ๊ค Scandinavian',
          price: '฿18,500',
          originalPrice: '฿22,000',
          image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=300&fit=crop',
          rating: 4.9,
          reviews: 203,
          isNew: false,
          discount: 16,
          category: 'โต๊ะ'
        },
        {
          id: 4,
          name: 'ชั้นวางหนังสือ Minimalist',
          price: '฿8,900',
          originalPrice: '฿10,900',
          image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=300&fit=crop',
          rating: 4.5,
          reviews: 67,
          isNew: true,
          discount: 18,
          category: 'ชั้นวาง'
        },
        {
          id: 5,
          name: 'เตียงนอน King Size หุ้มผ้า',
          price: '฿32,500',
          originalPrice: '฿38,000',
          image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=300&fit=crop',
          rating: 4.7,
          reviews: 124,
          isNew: false,
          discount: 14,
          category: 'เตียง'
        },
        {
          id: 6,
          name: 'ตู้เสื้อผ้า 4 บาน Mirror',
          price: '฿28,900',
          originalPrice: '฿34,500',
          image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=300&fit=crop',
          rating: 4.4,
          reviews: 95,
          isNew: false,
          discount: 16,
          category: 'ตู้'
        },
        {
          id: 7,
          name: 'โต๊ะทำงาน L-Shape Executive',
          price: '฿24,900',
          originalPrice: '฿29,900',
          image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=300&fit=crop',
          rating: 4.8,
          reviews: 178,
          isNew: true,
          discount: 17,
          category: 'โต๊ะ'
        },
        {
          id: 8,
          name: 'เก้าอี้อาร์มแชร์ Velvet',
          price: '฿16,500',
          originalPrice: '฿19,500',
          image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=300&fit=crop',
          rating: 4.6,
          reviews: 112,
          isNew: false,
          discount: 15,
          category: 'เก้าอี้'
        },
        // เพิ่มสินค้าอื่นๆ เพื่อทดสอบ pagination
        ...Array.from({length: 16}, (_, i) => ({
          id: i + 9,
          name: `เฟอร์นิเจอร์ชิ้นที่ ${i + 9}`,
          price: `฿${(Math.random() * 50000 + 5000).toLocaleString()}`,
          originalPrice: `฿${(Math.random() * 60000 + 8000).toLocaleString()}`,
          image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=300&fit=crop',
          rating: (Math.random() * 1.5 + 3.5).toFixed(1),
          reviews: Math.floor(Math.random() * 200 + 20),
          isNew: Math.random() > 0.7,
          discount: Math.floor(Math.random() * 25 + 5),
          category: ['โซฟา', 'เก้าอี้', 'โต๊ะ', 'ตู้', 'เตียง'][Math.floor(Math.random() * 5)]
        }))
      ];
      setProducts(mockProducts);
      setLoading(false);
    }, 1000);
  }, []);

  const sortOptions = [
    { value: 'default', label: 'เรียงตามความเกี่ยวข้อง' },
    { value: 'price-low', label: 'ราคาต่ำสุด - สูงสุด' },
    { value: 'price-high', label: 'ราคาสูงสุด - ต่ำสุด' },
    { value: 'newest', label: 'มาใหม่' },
    { value: 'bestseller', label: 'ขายดี' },
    { value: 'rating', label: 'คะแนนสูงสุด' }
  ];

  const filteredAndSortedProducts = React.useMemo(() => {
    let filtered = products.filter(product =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    switch (sortBy) {
      case 'price-low':
        return filtered.sort((a, b) => parseFloat(a.price.replace(/[฿,]/g, '')) - parseFloat(b.price.replace(/[฿,]/g, '')));
      case 'price-high':
        return filtered.sort((a, b) => parseFloat(b.price.replace(/[฿,]/g, '')) - parseFloat(a.price.replace(/[฿,]/g, '')));
      case 'newest':
        return filtered.sort((a, b) => b.isNew - a.isNew);
      case 'bestseller':
        return filtered.sort((a, b) => b.reviews - a.reviews);
      case 'rating':
        return filtered.sort((a, b) => b.rating - a.rating);
      default:
        return filtered;
    }
  }, [products, searchTerm, sortBy]);

  const totalPages = Math.ceil(filteredAndSortedProducts.length / productsPerPage);
  const currentProducts = filteredAndSortedProducts.slice(
    (currentPage - 1) * productsPerPage,
    currentPage * productsPerPage
  );

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

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const ProductCard = ({ product }) => {
    const isFavorite = favorites.has(product.id);
    
    return (
      <div className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 overflow-hidden border border-gray-100">
        <div className="relative overflow-hidden">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-48 sm:h-56 object-cover group-hover:scale-110 transition-transform duration-700"
            onError={(e) => {
              e.target.src = `https://via.placeholder.com/400x300/6366f1/ffffff?text=${encodeURIComponent(product.name)}`;
            }}
          />
          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {product.isNew && (
              <span className="px-2 py-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs font-bold rounded-full">
                ใหม่
              </span>
            )}
            {product.discount > 0 && (
              <span className="px-2 py-1 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold rounded-full">
                -{product.discount}%
              </span>
            )}
          </div>

          {/* Favorite Button */}
          <button 
            onClick={() => toggleFavorite(product.id)}
            className={`absolute top-2 right-2 p-1.5 sm:p-2 rounded-full backdrop-blur-md transition-all duration-300 ${
              isFavorite 
                ? 'bg-red-100/90 text-red-500' 
                : 'bg-white/90 text-gray-400 hover:text-red-500'
            }`}
          >
            <Heart size={14} fill={isFavorite ? 'currentColor' : 'none'} />
          </button>

          {/* Quick Actions */}
          <div className="absolute bottom-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <button className="p-1.5 bg-white/90 backdrop-blur-md rounded-full hover:bg-blue-100 transition-colors">
              <Eye size={14} className="text-blue-600" />
            </button>
            <button className="p-1.5 bg-white/90 backdrop-blur-md rounded-full hover:bg-green-100 transition-colors">
              <ShoppingCart size={14} className="text-green-600" />
            </button>
          </div>
        </div>

        <div className="p-4">
          <div className="mb-2">
            <span className="text-xs text-blue-600 font-medium bg-blue-50 px-2 py-1 rounded-full">
              {product.category}
            </span>
          </div>
          
          <h3 className="text-sm sm:text-base font-bold text-gray-800 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
            {product.name}
          </h3>

          <div className="flex items-center mb-3">
            <div className="flex items-center text-yellow-500 mr-2">
              <Star size={14} fill="currentColor" />
              <span className="ml-1 text-sm font-semibold">{product.rating}</span>
            </div>
            <span className="text-gray-500 text-xs">({product.reviews})</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-lg sm:text-xl font-bold text-blue-600">
                {product.price}
              </span>
              {product.originalPrice && (
                <span className="text-xs text-gray-400 line-through">
                  {product.originalPrice}
                </span>
              )}
            </div>
            <button className="px-3 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs font-semibold rounded-full hover:shadow-lg transition-all duration-300 transform hover:scale-105">
              เพิ่มไปตะกร้า
            </button>
          </div>
        </div>
      </div>
    );
  };

  const Pagination = () => {
    const getPageNumbers = () => {
      const delta = 2;
      const range = [];
      const rangeWithDots = [];

      for (let i = Math.max(2, currentPage - delta); 
           i <= Math.min(totalPages - 1, currentPage + delta); 
           i++) {
        range.push(i);
      }

      if (currentPage - delta > 2) {
        rangeWithDots.push(1, '...');
      } else {
        rangeWithDots.push(1);
      }

      rangeWithDots.push(...range);

      if (currentPage + delta < totalPages - 1) {
        rangeWithDots.push('...', totalPages);
      } else {
        rangeWithDots.push(totalPages);
      }

      return rangeWithDots.filter((item, index, arr) => arr.indexOf(item) === index);
    };

    return (
      <div className="flex flex-wrap items-center justify-center gap-2 mt-12">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="flex items-center px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronLeft size={16} className="mr-1" />
          ก่อนหน้า
        </button>

        {getPageNumbers().map((pageNumber, index) => (
          pageNumber === '...' ? (
            <span key={index} className="px-3 py-2 text-sm text-gray-500">...</span>
          ) : (
            <button
              key={pageNumber}
              onClick={() => handlePageChange(pageNumber)}
              className={`px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                currentPage === pageNumber
                  ? 'text-white bg-gradient-to-r from-blue-500 to-purple-500 shadow-lg'
                  : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
              }`}
            >
              {pageNumber}
            </button>
          )
        ))}

        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="flex items-center px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          ถัดไป
          <ChevronRight size={16} className="ml-1" />
        </button>
      </div>
    );
  };

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
<div className="mt-11 min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      {/* <div className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 sticky top-0 z-50">
        <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center min-w-0 flex-1">
              <button className="flex items-center text-gray-600 hover:text-blue-600 transition-colors mr-3 sm:mr-4 flex-shrink-0">
                <ArrowLeft size={18} className="mr-1 sm:mr-2" />
                <span className="text-sm sm:text-base">กลับ</span>
              </button>
              <h1 className="text-base sm:text-xl lg:text-2xl font-bold text-gray-800 truncate">
                เฟอร์นิเจอร์ห้องนั่งเล่น
              </h1>
            </div>
            <div className="text-xs sm:text-sm text-gray-500 flex-shrink-0 ml-2">
              {filteredAndSortedProducts.length} สินค้า
            </div>
          </div>
        </div>
      </div> */}

      <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8">
        {/* Search & Filters */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col gap-4 bg-white/70  rounded-2xl p-4 sm:p-6 border border-gray-200/50 mx-2 sm:mx-0">
            {/* Search */}
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="ค้นหาสินค้า..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-3 bg-white/80 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent text-sm"
              />
            </div>

            {/* Filters Row */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
              {/* Sort Dropdown */}
              <div className='relative z-30'>
                              <Sort
                                    sortBy={sortBy}
                                    setSortBy={setSortBy}
                                    showSortDropdown={showSortDropdown}
                                    setShowSortDropdown={setShowSortDropdown}
                                    sortOptions={sortOptions}
                                    setCurrentPage={setCurrentPage}
                              />
              </div>
              {/* Grid Size Toggle */}
              <div className="flex items-center gap-2 justify-center sm:justify-start">
                <button
                  onClick={() => setGridSize(3)}
                  className={`p-2 sm:p-2.5 rounded-lg transition-colors ${
                    gridSize === 3 ? 'bg-blue-500 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Grid3X3 size={16} />
                </button>
                <button
                  onClick={() => setGridSize(4)}
                  className={`p-2 sm:p-2.5 rounded-lg transition-colors ${
                    gridSize === 4 ? 'bg-blue-500 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <LayoutGrid size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        {currentProducts.length > 0 ? (
          <>
            <div className={`grid gap-3 sm:gap-4 lg:gap-6 mx-2 sm:mx-0 ${
              gridSize === 3 
                ? 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3' 
                : 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4'
            }`}>
              {currentProducts.map((product, index) => (
                <div
                  key={product.id}
                  className="opacity-0 animate-[fadeInUp_0.6s_ease-out_forwards]"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <ProductCard product={product} />
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && <Pagination />}
          </>
        ) : (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">ไม่พบสินค้าที่ค้นหา</h3>
            <p className="text-gray-500">ลองเปลี่ยนคำค้นหาหรือตัวกรองใหม่</p>
          </div>
        )}
      </div>

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

export default ProductListingPage;