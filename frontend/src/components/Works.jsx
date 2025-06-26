import React, { useState, useEffect, useCallback } from 'react';
import { 
  Search,
  Filter,
  Grid3X3,
  Grid2X2,
  ChevronDown,
  Eye,
  Heart,
  Download,
  ExternalLink,
  Package,
  Layout,
  Zap,
  Palette,
  RefreshCw,
  ArrowUpDown
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
const WorksPortfolio = () => {
  const [works, setWorks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedSubcategory, setSelectedSubcategory] = useState('all');
  const [selectedSort, setSelectedSort] = useState('latest');
  const [showFilters, setShowFilters] = useState(false);
  const [gridSize, setGridSize] = useState(2);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [favorites, setFavorites] = useState(new Set());
  const [page, setPage] = useState(1);
  const [error, setError] = useState(null);
  const [totalCount, setTotalCount] = useState(0);
 const navigate=useNavigate();
  const API_BASE_URL = 'http://localhost:5000/api';

  // Sort options
  const sortOptions = [
    { value: 'latest', label: 'ล่าสุด', description: 'ผลงานที่สร้างล่าสุด' },
    { value: 'oldest', label: 'เก่าสุด', description: 'ผลงานที่สร้างเก่าสุด' },
    { value: 'custom_only', label: 'งานสั่งทำ', description: 'เฉพาะงานสั่งทำพิเศษ' },
    { value: 'sample_only', label: 'งานตัวอย่าง', description: 'เฉพาะงานตัวอย่าง' },
    { value: 'category_asc', label: 'หมวดหมู่ (ก-ฮ)', description: 'เรียงตามหมวดหมู่ A-Z' },
    { value: 'category_desc', label: 'หมวดหมู่ (ฮ-ก)', description: 'เรียงตามหมวดหมู่ Z-A' }
  ];
    const handleViewDetails = (workId) => {
    // Here you would typically navigate to product details page
    navigate(`/worksDetail/${workId}`)
     window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  // Fetch categories and subcategories on mount
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [categoriesResponse, subcategoriesResponse] = await Promise.all([
          fetch(`${API_BASE_URL}/works/categories`),
          fetch(`${API_BASE_URL}/works/subcategories`)
        ]);

        if (!categoriesResponse.ok || !subcategoriesResponse.ok) {
          throw new Error('Failed to fetch categories or subcategories');
        }

        const categoriesData = await categoriesResponse.json();
        const subcategoriesData = await subcategoriesResponse.json();

        setCategories(categoriesData);
        setSubcategories(subcategoriesData);
      } catch (error) {
        console.error('Error fetching initial data:', error);
        setError('Failed to load categories');
      }
    };

    fetchInitialData();
  }, []);

  // Fetch works with filters
  const fetchWorks = useCallback(async (pageNum = 1, isLoadMore = false) => {
    try {
      const params = new URLSearchParams({
        page: pageNum.toString(),
        limit: '12',
        sort: selectedSort,
        ...(selectedCategory !== 'all' && { category: selectedCategory }),
        ...(selectedSubcategory !== 'all' && { subcategory: selectedSubcategory }),
        ...(searchTerm && { search: searchTerm })
      });

      const response = await fetch(`${API_BASE_URL}/works/home?${params}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch works');
      }

      const data = await response.json();

      if (isLoadMore) {
        setWorks(prev => [...prev, ...data.works]);
      } else {
        setWorks(data.works);
      }

      setHasMore(data.hasMore);
      setTotalCount(data.pagination?.total || 0);
      setPage(pageNum);
      setError(null);
    } catch (error) {
      console.error('Error fetching works:', error);
      setError('Failed to load works');
    }
  }, [selectedCategory, selectedSubcategory, searchTerm, selectedSort]);

  // Fetch subcategories when category changes
  useEffect(() => {
    const fetchSubcategoriesByCategory = async () => {
      if (selectedCategory === 'all') {
        try {
          const response = await fetch(`${API_BASE_URL}/works/subcategories`);
          if (response.ok) {
            const data = await response.json();
            setSubcategories(data);
          }
        } catch (error) {
          console.error('Error fetching all subcategories:', error);
        }
      } else {
        try {
          const response = await fetch(`${API_BASE_URL}/works/subcategories/${selectedCategory}`);
          if (response.ok) {
            const data = await response.json();
            setSubcategories(data);
          }
        } catch (error) {
          console.error('Error fetching subcategories by category:', error);
        }
      }
    };

    fetchSubcategoriesByCategory();
    setSelectedSubcategory('all'); // Reset subcategory when category changes
  }, [selectedCategory]);

  // Initial load and filter changes
  useEffect(() => {
    const loadWorks = async () => {
      setLoading(true);
      await fetchWorks(1, false);
      setLoading(false);
    };

    loadWorks();
  }, [fetchWorks]);

  // Load more works
  const loadMoreWorks = async () => {
    if (loadingMore || !hasMore) return;
    
    setLoadingMore(true);
    await fetchWorks(page + 1, true);
    setLoadingMore(false);
  };

  // Reset filters
  const resetFilters = () => {
    setSearchTerm('');
    setSelectedCategory('all');
    setSelectedSubcategory('all');
    setSelectedSort('latest');
  };

  const toggleFavorite = (workId) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(workId)) {
      newFavorites.delete(workId);
    } else {
      newFavorites.add(workId);
    }
    setFavorites(newFavorites);
  };

  const WorkCard = ({ work }) => (
    <div className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-gray-100">
      <div className="relative overflow-hidden">
        <img
          src={work.cover_image || '/api/placeholder/300/200'}
          alt={work.name}
          className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-700"
          loading="lazy"
          onError={(e) => {
            e.target.src = '/api/placeholder/300/200';
          }}
        />
        
        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {work.is_custom && (
            <span className="px-2 py-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold rounded-full flex items-center gap-1">
              <Zap size={10} />
              สั่งทำพิเศษ
            </span>
          )}
          {work.is_sample && (
            <span className="px-2 py-1 bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-xs font-bold rounded-full flex items-center gap-1">
              <Palette size={10} />
              ตัวอย่าง
            </span>
          )}
        </div>

        {/* Favorite Button */}
        <button
          onClick={() => toggleFavorite(work.id)}
          className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-sm rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-red-50 shadow-lg"
        >
          <Heart 
            size={16} 
            className={`${favorites.has(work.id) ? 'fill-red-500 text-red-500' : 'text-gray-600'} transition-colors`} 
          />
        </button>

        {/* Quick Actions */}
        <div className="absolute bottom-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
          <button className="p-2 bg-blue-500 hover:bg-blue-600 text-white rounded-full transition-colors shadow-lg">
            <Eye size={16} />
          </button>
          <button className="p-2 bg-green-500 hover:bg-green-600 text-white rounded-full transition-colors shadow-lg">
            <Download size={16} />
          </button>
          <button className="p-2 bg-purple-500 hover:bg-purple-600 text-white rounded-full transition-colors shadow-lg">
            <ExternalLink size={16} />
          </button>
        </div>

        {/* Category indicator */}
        <div className="absolute bottom-3 left-3 opacity-0 group-hover:opacity-100 transition-all duration-300">
          <span className="px-2 py-1 bg-black/50 backdrop-blur-sm text-white text-xs rounded-full">
            {work.category_name || 'ไม่ระบุหมวดหมู่'}
          </span>
        </div>
      </div>

      <div className="p-5">
        <h3 className="text-lg font-bold text-gray-800 mb-2 line-clamp-1 group-hover:text-blue-600 transition-colors">
          {work.name}
        </h3>
        
        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
          {work.main_description}
        </p>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            <span className="text-xs text-gray-500">
              {new Date(work.created_at).toLocaleDateString('th-TH')}
            </span>
          </div>
          
          <button onClick={() => handleViewDetails(work.id)} className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white text-sm font-medium rounded-lg transition-all duration-300 transform hover:scale-105 shadow-md">
            ดูรายละเอียด
          </button>
        </div>
      </div>
    </div>
  );

  if (loading && works.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <Package className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-blue-500" size={24} />
          </div>
          <p className="text-gray-600">กำลังโหลดผลงาน...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">เกิดข้อผิดพลาด</h3>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-lg transition-all duration-300 shadow-md flex items-center gap-2 mx-auto"
          >
            <RefreshCw size={16} />
            ลองใหม่
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-12 min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-800 mb-4">
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              ผลงาน
            </span>
            <span className="text-gray-700"> & </span>
            <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              ตัวอย่าง
            </span>
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            สำรวจผลงานการออกแบบที่หลากหลายและตัวอย่างงานคุณภาพสูง
          </p>
          <div className="mt-4 flex items-center justify-center gap-4 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <Layout size={16} className="text-blue-500" />
              <span>พบผลงาน {totalCount.toLocaleString()} รายการ</span>
            </div>
            <div className="flex items-center gap-2">
              <Eye size={16} className="text-green-500" />
              <span>แสดง {works.length} รายการ</span>
            </div>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="mb-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 sm:p-6 shadow-xl border border-white/20">
            {/* Search */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="ค้นหาผลงาน..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent text-gray-700 placeholder-gray-400 shadow-sm"
              />
            </div>

            {/* Mobile Filter Toggle */}
            <div className="md:hidden mb-4">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-200 transition-colors"
              >
                <Filter size={16} />
                ตัวกรอง
                <ChevronDown size={16} className={`transition-transform ${showFilters ? 'rotate-180' : ''}`} />
              </button>
            </div>

            {/* Filters */}
            <div className={`grid gap-4 ${showFilters || 'hidden md:grid'} md:grid-cols-2 lg:grid-cols-5`}>
              {/* Category Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">หมวดหมู่หลัก</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/50 shadow-sm"
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
                <label className="block text-sm font-medium text-gray-700 mb-2">หมวดหมู่ย่อย</label>
                <select
                  value={selectedSubcategory}
                  onChange={(e) => setSelectedSubcategory(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/50 shadow-sm"
                >
                  {subcategories.map((subcategory) => (
                    <option key={subcategory.id} value={subcategory.id}>
                      {subcategory.name} ({subcategory.count})
                    </option>
                  ))}
                </select>
              </div>

              {/* Sort Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">เรียงโดย</label>
                <select
                  value={selectedSort}
                  onChange={(e) => setSelectedSort(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/50 shadow-sm"
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
                <label className="block text-sm font-medium text-gray-700 mb-2">รูปแบบแสดงผล</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setGridSize(2)}
                    className={`flex-1 p-2 rounded-lg transition-colors flex items-center justify-center gap-2 ${
                      gridSize === 2 ? 'bg-blue-500 text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <Grid2X2 size={16} />
                    <span className="hidden sm:inline">2x2</span>
                  </button>
                  <button
                    onClick={() => setGridSize(3)}
                    className={`flex-1 p-2 rounded-lg transition-colors flex items-center justify-center gap-2 ${
                      gridSize === 3 ? 'bg-blue-500 text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <Grid3X3 size={16} />
                    <span className="hidden sm:inline">3x3</span>
                  </button>
                </div>
              </div>

              {/* Reset Button */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">รีเซ็ตตัวกรอง</label>
                <button
                  onClick={resetFilters}
                  className="w-full px-4 py-2 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white rounded-lg transition-all duration-300 shadow-md flex items-center justify-center gap-2"
                >
                  <RefreshCw size={16} />
                  รีเซ็ต
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Works Grid */}
        {works.length > 0 ? (
          <>
            <div className={`grid gap-4 sm:gap-6 ${
              gridSize === 2 
                ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
                : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5'
            }`}>
              {works.map((work, index) => (
                <div
                  key={`${work.id}-${index}`}
                  className="opacity-0 animate-[fadeInUp_0.6s_ease-out_forwards]"
                  style={{ animationDelay: `${(index % 12) * 0.1}s` }}
                >
                  <WorkCard work={work} />
                </div>
              ))}
            </div>

            {/* Load More Button */}
            {hasMore && (
              <div className="flex justify-center mt-12">
                <button
                  onClick={loadMoreWorks}
                  disabled={loadingMore}
                  className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 disabled:opacity-50 text-white font-medium rounded-lg transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105 disabled:hover:scale-100 flex items-center gap-2"
                >
                  {loadingMore ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      กำลังโหลด...
                    </>
                  ) : (
                    <>
                      <ArrowUpDown size={16} />
                      โหลดเพิ่มเติม ({works.length}/{totalCount})
                    </>
                  )}
                </button>
              </div>
            )}

            {/* End of Results */}
            {!hasMore && works.length > 0 && (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🎉</div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">คุณได้ดูผลงานทั้งหมดแล้ว</h3>
                <p className="text-gray-600">ทั้งหมด {totalCount.toLocaleString()} รายการ</p>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">ไม่พบผลงานที่ค้นหา</h3>
            <p className="text-gray-600 mb-6">ลองเปลี่ยนคำค้นหาหรือตัวกรองใหม่</p>
            <button
              onClick={resetFilters}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-lg transition-all duration-300 shadow-md flex items-center gap-2 mx-auto"
            >
              <RefreshCw size={16} />
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
        .line-clamp-1 {
          display: -webkit-box;
          -webkit-line-clamp: 1;
          -webkit-box-orient: vertical;
          overflow: hidden;
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

export default WorksPortfolio;