import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
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
import { useNavigate, useParams } from 'react-router-dom';
import ProductsDetail from './ProductsDetail';
const ProductListingPage = () => {
  const [products, setProducts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState('default');
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [gridSize, setGridSize] = useState(4);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
      const { subcategoryId } = useParams(); // ✅ ดึงค่าจาก URL
  const productsPerPage = 12;
 const navigate = useNavigate();
  // Mock data - ในการใช้งานจริงจะ fetch จาก API
   useEffect(() => {
    fetch(`http://localhost:5000/api/store/subcategoryP/${subcategoryId}`)
      .then(res => res.json())
      .then(data => setProducts(data))
      .catch(err => console.error('Error fetching categories:', err));
  }, [subcategoryId]);
  
    useEffect(() => {
      const initial = {};
      products.forEach(subcatP => {
        initial[subcatP.id]=products.length;
      });
         setTimeout(() => {
      setLoading(false);
    }, 1000);
    });
  
  const sortOptions = [
    { value: 'default', label: 'เรียงตามความเกี่ยวข้อง' },
    { value: 'newest', label: 'มาใหม่' },
     { value: 'hotseller', label: 'ขายดี' },
       { value: 'topseller', label: 'ยอดขายสูงสุด' },
  ];

  const filteredAndSortedProducts = React.useMemo(() => {
  let filtered = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  switch (sortBy) {
    case 'newest':
      return filtered.sort((a, b) => b.isNew - a.isNew);
    case 'hotseller':
      return filtered.sort((a, b) => b.monthlyPurchases - a.monthlyPurchases);
    case 'topseller':
      return filtered.sort((a, b) => b.totalPurchases - a.totalPurchases);
    case 'name-asc':
      return filtered.sort((a, b) => a.name.localeCompare(b.name));
    case 'name-desc':
      return filtered.sort((a, b) => b.name.localeCompare(a.name));
    default:
      return filtered;
  }
}, [products, searchTerm, sortBy]);

  const totalPages = Math.ceil(filteredAndSortedProducts.length / productsPerPage);
  const currentProducts = filteredAndSortedProducts.slice(
    (currentPage - 1) * productsPerPage,
    currentPage * productsPerPage
  );

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleViewDetails = (productId) => {
    console.log(productId)
    // Here you would typically navigate to product details page
    navigate(`/detailProducts/${productId}`)
  };

  const ProductCard = ({ product }) => {
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

          <div className="flex justify-center">
            <button 
              onClick={() => handleViewDetails(product.id)}
              className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white text-sm font-semibold rounded-full hover:shadow-lg transition-all duration-300 transform hover:scale-105 flex items-center gap-2"
            >
              <Eye size={14} />
              ดูรายละเอียด
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
                        onClick={() => {
                          setSortBy(option.value);
                          setShowSortDropdown(false);
                          setCurrentPage(1);
                        }}
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