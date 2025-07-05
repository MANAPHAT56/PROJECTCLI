  import React, { useState, useEffect} from 'react';
  import { useParams } from 'react-router-dom';
  import { 
    Eye,
    ChevronDown,
    Grid3X3,
    LayoutGrid,
    Search,
    Loader,
    Plus
  } from 'lucide-react';

  const ProductListingPage = () => {
    const [products, setProducts] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [searchLoading, setSearchLoading] = useState(false); // สำหรับ search loading
    const [hasMore, setHasMore] = useState(false);
    const [nextCursor, setNextCursor] = useState(null);
    const [gridSize, setGridSize] = useState(4);
    const [showSortDropdown, setShowSortDropdown] = useState(false);
    const [sortBy, setSortBy] = useState('newest');
    const [error, setError] = useState(null);
    const {subcategoryId} = useParams(); // Mock subcategory ID
    const productsPerPage = 12;
    const apiBaseUrl = 'http://localhost:5000';
   useEffect(() => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
}, []);
    const sortOptions = [
      { value: 'newest', label: 'มาใหม่' },
      { value: 'hotseller', label: 'ขายดี' },
      { value: 'topseller', label: 'ยอดขายสูงสุด' },
      { value: 'price-high', label: 'ราคาสูงไปต่ำ' },
      { value: 'price-low', label: 'ราคาต่ำไปสูง' }
    ];

    const fetchProducts = async (isLoadMore = false, isSearch = false) => {
      if (isLoadMore) {
        setLoadingMore(true);
      } else if (isSearch) {
        setSearchLoading(true); // ใช้ search loading แทน
      } else {
        setLoading(true);
        setError(null);
      }
      
      try {
        // Mock API response for demo
        await new Promise(resolve => setTimeout(resolve, isSearch ? 800 : 1500)); // Simulate API delay
        const params = new URLSearchParams({
          limit: productsPerPage.toString(),
          sort: sortBy,
          search: searchTerm.trim()
        });
      const response = await fetch(`${apiBaseUrl}/api/store/subcategoryP/${subcategoryId}?${params.toString()}`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log(data+"data")
        if (isLoadMore) {
          setProducts(prev => [...prev, ...data.products]);
        } else {
          setProducts(data.products);
        }
        
        setHasMore(Math.random() > 0.5); // Random has more
        setNextCursor({ lastId: data[data.length - 1]?.id });
        
      } catch (err) {
        console.error('Error fetching products:', err);
        setError(err.message);
        if (!isLoadMore) {
          setProducts([]);
        }
      } finally {
        if (isLoadMore) {
          setLoadingMore(false);
        } else if (isSearch) {
          setSearchLoading(false);
        } else {
          setLoading(false);
        }
      }
    };

    const loadMoreProducts = () => {
      if (!hasMore || loadingMore) return;
      fetchProducts(true);
    };

    const handleSortChange = (option) => {
      setSortBy(option.value);
      setShowSortDropdown(false);
    };

    const handleViewDetails = (productId) => {
      // Navigate to product details page
      window.location.href = `/detailProducts/${productId}`;
      // Or if using React Router: navigate(`/detailProducts/${productId}`);
    };

    // Initial load and when filters change
    useEffect(() => {
      setProducts([]);
      setNextCursor(null);
      setHasMore(false);
      fetchProducts();
    }, [subcategoryId, sortBy]);

    // Search with debounce - ไม่ให้กระพริบหน้าเว็บ
    useEffect(() => {
      const timer = setTimeout(() => {
        setNextCursor(null);
        setHasMore(false);
        fetchProducts(false, true); // ส่ง isSearch = true
      }, 500);
      return () => clearTimeout(timer);
    }, [searchTerm]);

    const ProductCard = ({ product }) => {
      return (
        <div className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 overflow-hidden border border-gray-100">
          <div className="relative overflow-hidden">
            <img
              src={product.image || `https://via.placeholder.com/400x300/6366f1/ffffff?text=${encodeURIComponent(product.name)}`}
              alt={product.name}
              className="w-full h-48 sm:h-56 object-cover group-hover:scale-110 transition-transform duration-700"
              onError={(e) => {
                e.target.src = `https://via.placeholder.com/400x300/6366f1/ffffff?text=${encodeURIComponent(product.name)}`;
              }}
            />
            
            {product.isNew && (
              <span className="absolute top-2 left-2 px-2 py-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs font-bold rounded-full">
                ใหม่
              </span>
            )}

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
              <span className="text-xs font-medium px-2 py-1 rounded-full text-blue-600 bg-blue-50">
                {product.category}
              </span>
            </div>
            
            <h3 className="text-sm sm:text-base font-bold mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors text-gray-800">
              {product.name}
            </h3>

            {product.description && (
              <p className="text-xs text-gray-500 mb-3 line-clamp-2">
                {product.description}
              </p>
            )}
            
            <div className="flex items-center justify-between mb-3">
              <span className="text-lg sm:text-xl font-bold text-blue-600">
                {product.price}
              </span>
              
              {product.tags && product.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {product.tags.slice(0, 2).map((tag, index) => (
                    <span 
                      key={index}
                      className="text-xs px-2 py-1 bg-orange-50 text-orange-600 rounded-full font-medium"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
            
            <div className="flex justify-center">
              <button 
                onClick={() => handleViewDetails(product.id)}
                className="px-3 py-1.5 text-white text-sm font-semibold rounded-full hover:shadow-lg transition-all duration-300 transform hover:scale-105 flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-500"
              >
                <Eye size={14} />
                ดูรายละเอียด
              </button>
            </div>
          </div>
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

    if (error) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
          <div className="text-center">
            <div className="text-6xl mb-4">❌</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">เกิดข้อผิดพลาด</h3>
            <p className="text-gray-500 mb-4">{error}</p>
            <button 
              onClick={() => fetchProducts()}
              className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              ลองใหม่
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="mt-11 min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8">
          {/* Header */}
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-gray-800">
              🛍️ สินค้าในหมวดหมู่
            </h1>
          </div>

          {/* Search & Filters */}
          <div className="mb-6 sm:mb-8">
            <div className="flex flex-col gap-4 bg-white/70 rounded-2xl p-4 sm:p-6 border border-gray-200/50 mx-2 sm:mx-0">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                {/* แสดง loading icon เล็กๆ ขณะค้นหา */}
                {searchLoading && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <Loader size={16} className="animate-spin text-blue-500" />
                  </div>
                )}
                <input
                  autoFocus 
                  type="text"
                  placeholder="ค้นหาสินค้า..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-10 py-3 bg-white/80 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent text-sm"
                />
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
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
                          className={`w-full px-4 py-3 text-left text-sm hover:bg-gray-50 first:rounded-t-xl last:rounded-b-xl transition-colors ${
                            sortBy === option.value ? 'bg-blue-50 text-blue-600' : ''
                          }`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

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

                <div className="flex items-center justify-center sm:justify-start text-sm text-gray-600 bg-white px-3 py-2 rounded-lg">
                  แสดง {products.length} รายการ
                  {searchLoading && (
                    <span className="ml-2 text-blue-500">(กำลังค้นหา...)</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Products Grid - แสดงแม้ขณะ search loading */}
          {products.length > 0 ? (
            <>
              <div className={`relative ${searchLoading ? 'opacity-60' : 'opacity-100'} transition-opacity duration-300`}>
                {/* แสดง overlay loading เล็กๆ ตอนค้นหา */}
                {searchLoading && (
                  <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl p-2 mb-4 mx-2 sm:mx-0">
                    <div className="flex items-center justify-center gap-2 text-blue-600 text-sm">
                      <Loader size={16} className="animate-spin" />
                      <span>กำลังค้นหาสินค้า...</span>
                    </div>
                  </div>
                )}
                
                <div className={`grid gap-3 sm:gap-4 lg:gap-6 mx-2 sm:mx-0 mb-8 ${searchLoading ? 'mt-12' : ''} ${
                  gridSize === 3 
                    ? 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3' 
                    : 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4'
                }`}>
                  {products.map((product, index) => (
                    <div
                      key={`${product.id}-${index}`}
                      className="opacity-0 animate-[fadeInUp_0.6s_ease-out_forwards]"
                      style={{ animationDelay: `${(index % productsPerPage) * 0.05}s` }}
                    >
                      <ProductCard product={product} />
                    </div>
                  ))}
                </div>
              </div>

              {hasMore && !searchLoading && (
                <div className="flex justify-center items-center py-8">
                  <button
                    onClick={loadMoreProducts}
                    disabled={loadingMore}
                    className="group flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold rounded-2xl hover:shadow-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {loadingMore ? (
                      <>
                        <Loader size={20} className="animate-spin" />
                        <span>กำลังโหลด...</span>
                      </>
                    ) : (
                      <>
                        <Plus size={20} className="group-hover:rotate-90 transition-transform duration-300" />
                        <span>โหลดสินค้าเพิ่มเติม</span>
                      </>
                    )}
                  </button>
                </div>
              )}

              {!hasMore && products.length > 0 && !searchLoading && (
                <div className="flex justify-center items-center py-8">
                  <div className="text-center">
                    <div className="text-4xl mb-2">🎉</div>
                    <p className="text-gray-500 text-sm">แสดงสินค้าครบทุกรายการแล้ว</p>
                    <p className="text-gray-400 text-xs mt-1">ทั้งหมด {products.length} รายการ</p>
                  </div>
                </div>
              )}
            </>
          ) : !searchLoading ? (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">ไม่พบสินค้าที่ค้นหา</h3>
              <p className="text-gray-500">ลองเปลี่ยนคำค้นหาหรือตัวกรองใหม่</p>
            </div>
          ) : null}
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