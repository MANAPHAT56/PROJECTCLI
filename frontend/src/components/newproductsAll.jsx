import React, { useState, useEffect } from 'react';
import { 
  Search,
  Filter,
  Grid3X3,
  Grid2X2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Eye,
  Star,
  Heart,
  ShoppingCart,
  X,
  Package,
  TrendingUp
} from 'lucide-react';

const NewProductsall = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedSubcategory, setSelectedSubcategory] = useState('all');
  const [sortBy, setSortBy] = useState('default');
  const [showFilters, setShowFilters] = useState(false);
  const [gridSize, setGridSize] = useState(2);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState(new Set());

  const productsPerPage = 12;

  // Mock data
  const mockCategories = [
    { id: 'all', name: 'ทั้งหมด', count: 48 },
    { id: 'electronics', name: 'อิเล็กทรอนิกส์', count: 15 },
    { id: 'fashion', name: 'แฟชั่น', count: 12 },
    { id: 'home', name: 'บ้านและสวน', count: 8 },
    { id: 'sports', name: 'กีฬาและออกกำลังกาย', count: 6 },
    { id: 'books', name: 'หนังสือ', count: 7 }
  ];

  const mockSubcategories = {
    electronics: [
      { id: 'smartphones', name: 'สมาร์ทโฟน', count: 8 },
      { id: 'laptops', name: 'แล็ปท็อป', count: 4 },
      { id: 'headphones', name: 'หูฟัง', count: 3 }
    ],
    fashion: [
      { id: 'mens', name: 'เสื้อผ้าผู้ชาย', count: 6 },
      { id: 'womens', name: 'เสื้อผ้าผู้หญิง', count: 4 },
      { id: 'shoes', name: 'รองเท้า', count: 2 }
    ],
    home: [
      { id: 'furniture', name: 'เฟอร์นิเจอร์', count: 4 },
      { id: 'decoration', name: 'ของตกแต่ง', count: 4 }
    ],
    sports: [
      { id: 'fitness', name: 'ฟิตเนส', count: 3 },
      { id: 'outdoor', name: 'กิจกรรมกลางแจ้ง', count: 3 }
    ],
    books: [
      { id: 'fiction', name: 'นิยาย', count: 4 },
      { id: 'business', name: 'ธุรกิจ', count: 3 }
    ]
  };

  const mockProducts = [
    { id: 1, name: 'iPhone 15 Pro Max 256GB', category: 'electronics', subcategory: 'smartphones', price: 45900, rating: 4.8, reviews: 156, image: 'https://via.placeholder.com/400x300/1f2937/ffffff?text=iPhone+15+Pro', isNew: true, isBestseller: false, discount: 0 },
    { id: 2, name: 'MacBook Air M2 13" 256GB', category: 'electronics', subcategory: 'laptops', price: 39900, rating: 4.9, reviews: 89, image: 'https://via.placeholder.com/400x300/1f2937/ffffff?text=MacBook+Air', isNew: false, isBestseller: true, discount: 5 },
    { id: 3, name: 'AirPods Pro 2nd Gen', category: 'electronics', subcategory: 'headphones', price: 8900, rating: 4.7, reviews: 234, image: 'https://via.placeholder.com/400x300/1f2937/ffffff?text=AirPods+Pro', isNew: false, isBestseller: true, discount: 10 },
    { id: 4, name: 'เสื้อยืดผู้ชาย Cotton 100%', category: 'fashion', subcategory: 'mens', price: 590, rating: 4.5, reviews: 67, image: 'https://via.placeholder.com/400x300/1f2937/ffffff?text=T-Shirt', isNew: true, isBestseller: false, discount: 15 },
    { id: 5, name: 'รองเท้าผ้าใบ Nike Air Max', category: 'fashion', subcategory: 'shoes', price: 4200, rating: 4.6, reviews: 123, image: 'https://via.placeholder.com/400x300/1f2937/ffffff?text=Nike+Shoes', isNew: false, isBestseller: true, discount: 0 },
    { id: 6, name: 'โซฟา 3 ที่นั่ง Modern Style', category: 'home', subcategory: 'furniture', price: 15900, rating: 4.4, reviews: 34, image: 'https://via.placeholder.com/400x300/1f2937/ffffff?text=Sofa', isNew: false, isBestseller: false, discount: 20 },
    { id: 7, name: 'ดัมเบลล์ปรับน้ำหนักได้ 20kg', category: 'sports', subcategory: 'fitness', price: 2890, rating: 4.3, reviews: 78, image: 'https://via.placeholder.com/400x300/1f2937/ffffff?text=Dumbbell', isNew: true, isBestseller: false, discount: 0 },
    { id: 8, name: 'หนังสือ "Rich Dad Poor Dad"', category: 'books', subcategory: 'business', price: 350, rating: 4.8, reviews: 456, image: 'https://via.placeholder.com/400x300/1f2937/ffffff?text=Book', isNew: false, isBestseller: true, discount: 0 },
    // เพิ่มสินค้าอื่นๆ อีก 40 รายการเพื่อให้ครบ 48 รายการ
    ...Array.from({ length: 40 }, (_, i) => ({
      id: i + 9,
      name: `สินค้าตัวอย่าง ${i + 1}`,
      category: ['electronics', 'fashion', 'home', 'sports', 'books'][i % 5],
      subcategory: 'general',
      price: Math.floor(Math.random() * 10000) + 500,
      rating: 4 + Math.random(),
      reviews: Math.floor(Math.random() * 200) + 10,
      image: `https://via.placeholder.com/400x300/1f2937/ffffff?text=Product+${i + 1}`,
      isNew: Math.random() > 0.7,
      isBestseller: Math.random() > 0.8,
      discount: Math.random() > 0.7 ? Math.floor(Math.random() * 30) : 0
    }))
  ];

  const sortOptions = [
    { value: 'default', label: 'เรียงตามความเกี่ยวข้อง' },
    { value: 'price-low', label: 'ราคาต่ำสุด' },
    { value: 'price-high', label: 'ราคาสูงสุด' },
    { value: 'rating', label: 'คะแนนสูงสุด' },
    { value: 'newest', label: 'มาใหม่' },
    { value: 'bestseller', label: 'ขายดี' }
  ];

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setProducts(mockProducts);
      setCategories(mockCategories);
      setLoading(false);
    }, 1000);
  }, []);

  useEffect(() => {
    // Update subcategories when category changes
    if (selectedCategory === 'all') {
      setSubcategories([{ id: 'all', name: 'ทั้งหมด', count: mockProducts.length }]);
    } else {
      const categorySubcats = mockSubcategories[selectedCategory] || [];
      setSubcategories([
        { id: 'all', name: 'ทั้งหมด', count: mockProducts.filter(p => p.category === selectedCategory).length },
        ...categorySubcats
      ]);
    }
    setSelectedSubcategory('all');
  }, [selectedCategory]);

  useEffect(() => {
    let filtered = [...products];

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(product => product.category === selectedCategory);
    }

    // Filter by subcategory
    if (selectedSubcategory !== 'all') {
      filtered = filtered.filter(product => product.subcategory === selectedSubcategory);
    }

    // Sort products
    switch (sortBy) {
      case 'price-low':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case 'newest':
        filtered.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
        break;
      case 'bestseller':
        filtered.sort((a, b) => (b.isBestseller ? 1 : 0) - (a.isBestseller ? 1 : 0));
        break;
      default:
        break;
    }

    setFilteredProducts(filtered);
    setCurrentPage(1);
  }, [products, searchTerm, selectedCategory, selectedSubcategory, sortBy]);

  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
  const currentProducts = filteredProducts.slice(
    (currentPage - 1) * productsPerPage,
    currentPage * productsPerPage
  );

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleFavorite = (productId) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(productId)) {
      newFavorites.delete(productId);
    } else {
      newFavorites.add(productId);
    }
    setFavorites(newFavorites);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('th-TH').format(price);
  };

  const ProductCard = ({ product }) => {
    const discountedPrice = product.discount > 0 ? product.price * (1 - product.discount / 100) : product.price;

    return (
      <div className="group bg-gray-900/50 backdrop-blur-sm rounded-2xl overflow-hidden border border-gray-700/50 hover:border-blue-500/50 transition-all duration-500 hover:shadow-2xl hover:shadow-blue-500/20 hover:-translate-y-2">
        <div className="relative overflow-hidden">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-700"
          />
          
          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {product.isNew && (
              <span className="px-2 py-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs font-bold rounded-full">
                ใหม่
              </span>
            )}
            {product.isBestseller && (
              <span className="px-2 py-1 bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-bold rounded-full flex items-center gap-1">
                <TrendingUp size={10} />
                ขายดี
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
            className="absolute top-3 right-3 p-2 bg-black/50 backdrop-blur-sm rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-red-500"
          >
            <Heart 
              size={16} 
              className={`${favorites.has(product.id) ? 'fill-red-500 text-red-500' : 'text-white'} transition-colors`} 
            />
          </button>

          {/* Quick Actions */}
          <div className="absolute bottom-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
            <button className="p-2 bg-blue-500 hover:bg-blue-600 text-white rounded-full transition-colors">
              <Eye size={16} />
            </button>
            <button className="p-2 bg-green-500 hover:bg-green-600 text-white rounded-full transition-colors">
              <ShoppingCart size={16} />
            </button>
          </div>
        </div>

        <div className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="flex items-center gap-1">
              <Star size={12} className="fill-yellow-400 text-yellow-400" />
              <span className="text-xs text-gray-300">{product.rating.toFixed(1)}</span>
            </div>
            <span className="text-xs text-gray-500">({product.reviews})</span>
          </div>

          <h3 className="text-sm font-semibold text-white mb-3 line-clamp-2 group-hover:text-blue-400 transition-colors">
            {product.name}
          </h3>

          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              {product.discount > 0 ? (
                <>
                  <span className="text-lg font-bold text-green-400">
                    ฿{formatPrice(Math.floor(discountedPrice))}
                  </span>
                  <span className="text-sm text-gray-500 line-through">
                    ฿{formatPrice(product.price)}
                  </span>
                </>
              ) : (
                <span className="text-lg font-bold text-green-400">
                  ฿{formatPrice(product.price)}
                </span>
              )}
            </div>

            <button className="w-full py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-sm font-semibold rounded-lg transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2">
              <ShoppingCart size={14} />
              เพิ่มในตะกร้า
            </button>
          </div>
        </div>
      </div>
    );
  };

  const Pagination = () => {
    const getPageNumbers = () => {
      const delta = 1;
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
        if (totalPages > 1) rangeWithDots.push(totalPages);
      }

      return rangeWithDots.filter((item, index, arr) => arr.indexOf(item) === index);
    };

    if (totalPages <= 1) return null;

    return (
      <div className="flex items-center justify-center gap-2 mt-12">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="flex items-center px-3 py-2 text-sm font-medium text-gray-300 bg-gray-800/50 border border-gray-700 rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft size={16} className="mr-1" />
          ก่อนหน้า
        </button>

        <div className="flex gap-1">
          {getPageNumbers().map((pageNumber, index) => (
            pageNumber === '...' ? (
              <span key={index} className="px-3 py-2 text-sm text-gray-500">...</span>
            ) : (
              <button
                key={pageNumber}
                onClick={() => handlePageChange(pageNumber)}
                className={`px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                  currentPage === pageNumber
                    ? 'text-white bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg'
                    : 'text-gray-300 bg-gray-800/50 border border-gray-700 hover:bg-gray-700'
                }`}
              >
                {pageNumber}
              </button>
            )
          ))}
        </div>

        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="flex items-center px-3 py-2 text-sm font-medium text-gray-300 bg-gray-800/50 border border-gray-700 rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          ถัดไป
          <ChevronRight size={16} className="ml-1" />
        </button>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <Package className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-blue-500" size={24} />
          </div>
          <p className="text-gray-300">กำลังโหลดสินค้า...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-16 min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
            สินค้าทั้งหมด
          </h1>
          <p className="text-gray-400">
            พบสินค้า {filteredProducts.length} รายการ
          </p>
        </div>

        {/* Search & Filters */}
        <div className="mb-8">
          <div className="bg-gray-900/70 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-gray-700/50">
            {/* Search */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="ค้นหาสินค้า..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent text-white placeholder-gray-400"
              />
            </div>

            {/* Mobile Filter Toggle */}
            <div className="md:hidden mb-4">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white"
              >
                <Filter size={16} />
                ตัวกรอง
                <ChevronDown size={16} className={`transition-transform ${showFilters ? 'rotate-180' : ''}`} />
              </button>
            </div>

            {/* Filters */}
            <div className={`grid gap-4 ${showFilters || 'hidden md:grid'} md:grid-cols-2 lg:grid-cols-4`}>
              {/* Category Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">หมวดหมู่หลัก</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                >
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name} ({category.count})
                    </option>
                  ))}
                </select>
              </div>

              {/* Subcategory Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">หมวดหมู่ย่อย</label>
                <select
                  value={selectedSubcategory}
                  onChange={(e) => setSelectedSubcategory(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                >
                  {subcategories.map((subcategory) => (
                    <option key={subcategory.id} value={subcategory.id}>
                      {subcategory.name} ({subcategory.count})
                    </option>
                  ))}
                </select>
              </div>

              {/* Sort */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">เรียงตาม</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                >
                  {sortOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Grid Size */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">รูปแบบการแสดงผล</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setGridSize(2)}
                    className={`flex-1 p-2 rounded-lg transition-colors flex items-center justify-center gap-2 ${
                      gridSize === 2 ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    }`}
                  >
                    <Grid2X2 size={16} />
                    <span className="hidden sm:inline">2 คอลัมน์</span>
                  </button>
                  <button
                    onClick={() => setGridSize(3)}
                    className={`flex-1 p-2 rounded-lg transition-colors flex items-center justify-center gap-2 ${
                      gridSize === 3 ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    }`}
                  >
                    <Grid3X3 size={16} />
                    <span className="hidden sm:inline">3 คอลัมน์</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        {currentProducts.length > 0 ? (
          <>
            <div className={`grid gap-4 sm:gap-6 ${
              gridSize === 2 
                ? 'grid-cols-2 sm:grid-cols-2 lg:grid-cols-4' 
                : 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6'
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

            <Pagination />
          </>
        ) : (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-white mb-2">ไม่พบสินค้าที่ค้นหา</h3>
            <p className="text-gray-400">ลองเปลี่ยนคำค้นหาหรือตัวกรองใหม่</p>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('all');
                setSelectedSubcategory('all');
                setSortBy('default');
              }}
              className="mt-4 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              รีเซ็ตตัวกรอง
            </button>
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

export default NewProductsall;