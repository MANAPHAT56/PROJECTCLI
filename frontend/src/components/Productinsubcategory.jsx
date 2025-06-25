import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Eye,
  ChevronDown,
  Grid3X3,
  LayoutGrid,
  Search,
  Loader
} from 'lucide-react';
import axios from 'axios';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';

const ProductListingPage = () => {
  const [products, setProducts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [gridSize, setGridSize] = useState(4);
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  
  const { subcategoryId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const observer = useRef();
  
  const productsPerPage = 12;
  
  // ดึงค่า sort จาก URL parameters
  const sortBy = searchParams.get('sort') || 'default';

  const sortOptions = [
    { value: 'default', label: 'เรียงตามความเกี่ยวข้อง', path: '' },
    { value: 'newest', label: 'มาใหม่', path: '?sort=newest' },
    { value: 'hotseller', label: 'ขายดี', path: '?sort=hotseller' },
    { value: 'topseller', label: 'ยอดขายสูงสุด', path: '?sort=topseller' },
    { value: 'price-high', label: 'ราคาสูงไปต่ำ', path: '?sort=price-high' },
    { value: 'price-low', label: 'ราคาต่ำไปสูง', path: '?sort=price-low' }
  ];

  const fetchProducts = async (page = 1, isLoadMore = false) => {
    if (isLoadMore) {
      setLoadingMore(true);
    } else {
      setLoading(true);
    }
    
    try {
      const res = await axios.get(`http://localhost:5000/api/store/subcategoryP/${subcategoryId}`, {
        params: {
          currentPage: page,
          limit: productsPerPage,
          subcategoryId,
          sort: sortBy, // ส่ง sort parameter ไปให้ backend
          search: searchTerm // ส่ง search term ไปให้ backend
        }
      });

      const newProducts = res.data.products;
      
      if (isLoadMore) {
        setProducts(prev => [...prev, ...newProducts]);
      } else {
        setProducts(newProducts);
      }
      
      // ตรวจสอบว่ายังมีข้อมูลเหลือไหม
      setHasMore(newProducts.length === productsPerPage);
      
    } catch (err) {
      console.error(err);
    }
    
    setLoading(false);
    setLoadingMore(false);
  };

  // Reset และ fetch ใหม่เมื่อ subcategoryId, sortBy หรือ searchTerm เปลี่ยน
  useEffect(() => {
    setProducts([]);
    setCurrentPage(1);
    setHasMore(true);
    fetchProducts(1, false);
  }, [subcategoryId, sortBy, searchTerm]);

  // Load more เมื่อ currentPage เปลี่ยน
  useEffect(() => {
    if (currentPage > 1) {
      fetchProducts(currentPage, true);
    }
  }, [currentPage]);

  // Infinite scroll callback
  const lastProductElementRef = useCallback(node => {
    if (loadingMore) return;
    if (observer.current) observer.current.disconnect();
    
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore && !loading) {
        setCurrentPage(prevPage => prevPage + 1);
      }
    });
    
    if (node) observer.current.observe(node);
  }, [loadingMore, hasMore, loading]);

  const handleViewDetails = (productId) => {
    navigate(`/detailProducts/${productId}`);
  };

  const handleSortChange = (option) => {
    const currentPath = window.location.pathname;
    navigate(`${currentPath}${option.path}`);
    setShowSortDropdown(false);
  };

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm !== '') {
        setProducts([]);
        setCurrentPage(1);
        setHasMore(true);
        fetchProducts(1, false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const ProductCard = ({ product, isLast }) => {
    return (
      <div 
        ref={isLast ? lastProductElementRef : null}
        className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 overflow-hidden border border-gray-100"
      >
        <div className="relative overflow-hidden">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-48 sm:h-56 object-cover group-hover:scale-110 transition-transform duration-700"
            onError={(e) => {
              e.target.src = `https://via.placeholder.com/400x300/6366f1/ffffff?text=${encodeURIComponent(product.name)}`;
            }}
          />
          
          {/* New Badge */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {product.isNew && (
              <span className="px-2 py-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs font-bold rounded-full">
                ใหม่
              </span>
            )}
          </div>

          {/* View Details Button */}
          <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <button 
              onClick={() => handleViewDetails(product.id)}
              className="p-2 bg-white/90 backdrop-blur-md rounded-full hover:bg-blue-100 transition-colors"
              title="ดูรายละเอียด"
            >
              <Eye size={16} className="text-blue-600" />
            </button>
          </div>
        </div>

        <div className="p-4">
          <div className="mb-2">
            <span className="text-xs text-blue-600 font-medium bg-blue-50 px-2 py-1 rounded-full">
              {product.category}
            </span>
          </div>
          
          <h3 className="text-sm sm:text-base font-bold text-gray-800 mb-4 line-clamp-2 group-hover:text-blue-600 transition-colors">
            {product.name}
          </h3>
          
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-lg sm:text-xl font-bold text-blue-600">
                {product.price}
              </span>
            </div>
          </div>
          
          <div className="flex justify-center">
            <button 
              onClick={() => handleViewDetails(product.id)}
              className="px-3 py-1.5 bg-gradient-to-r from-blue-500 to-purple-500 text-white text-sm font-semibold rounded-full hover:shadow-lg transition-all duration-300 transform hover:scale-105 flex items-center gap-2"
            >
              <Eye size={14} />
              ดูรายละเอียด
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (loading && products.length === 0) {
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
      <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8">
        {/* Search & Filters */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col gap-4 bg-white/70 rounded-2xl p-4 sm:p-6 border border-gray-200/50 mx-2 sm:mx-0">
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
              <div className="relative">
                <button
                  onClick={() => setShowSortDropdown(!showSortDropdown)}
                  className="flex items-center justify-between w-full sm:w-48 px-4 py-3 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors text-sm"
                >
                  <span>{sortOptions.find(option => option.value === sortBy)?.label}</span>
                  <ChevronDown size={16} className={`transition-transform ${showSortDropdown ? 'rotate-180' : ''}`} />
                </button>
                
                {showSortDropdown && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg z-50">
                    {sortOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => handleSortChange(option)}
                        className="w-full px-4 py-3 text-left text-sm hover:bg-gray-50 first:rounded-t-xl last:rounded-b-xl transition-colors"
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                )}
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
        {products.length > 0 ? (
          <>
            <div className={`grid gap-3 sm:gap-4 lg:gap-6 mx-2 sm:mx-0 ${
              gridSize === 3 
                ? 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3' 
                : 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4'
            }`}>
              {products.map((product, index) => (
                <div
                  key={`${product.id}-${index}`}
                  className="opacity-0 animate-[fadeInUp_0.6s_ease-out_forwards]"
                  style={{ animationDelay: `${(index % productsPerPage) * 0.1}s` }}
                >
                  <ProductCard 
                    product={product} 
                    isLast={index === products.length - 1}
                  />
                </div>
              ))}
            </div>

            {/* Loading More Indicator */}
            {loadingMore && (
              <div className="flex justify-center items-center py-8">
                <div className="flex items-center gap-2 text-blue-600">
                  <Loader size={20} className="animate-spin" />
                  <span className="text-sm font-medium">กำลังโหลดเพิ่มเติม...</span>
                </div>
              </div>
            )}

            {/* End of Results */}
            {!hasMore && products.length > 0 && (
              <div className="flex justify-center items-center py-8">
                <div className="text-center">
                  <div className="text-4xl mb-2">🎉</div>
                  <p className="text-gray-500 text-sm">แสดงสินค้าครบทุกรายการแล้ว</p>
                </div>
              </div>
            )}
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