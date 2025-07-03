import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
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
  ArrowUpDown,
  Star,
  Clock,
  Tag
} from 'lucide-react';

const WorksPortfolio = () => {
  const [works, setWorks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
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
  const navigate= useNavigate();

  const API_BASE_URL = 'http://localhost:5000/api';
  console.log("rerender")
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
    // Navigate to work details page
    navigate(`/worksDetail/${workId}`);
    console.log(`Viewing work ${workId}`);
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
        ...(debouncedSearchTerm && { search: debouncedSearchTerm })
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
  }, [selectedCategory, selectedSubcategory, debouncedSearchTerm, selectedSort]);

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
    setSelectedSubcategory('all');
  }, [selectedCategory]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500); // หน่วง 500ms

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm]);

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

  const WorkCard = React.memo(({ work }) => (
    <div className="group bg-slate-800/50 backdrop-blur-sm rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-slate-700/50 hover:border-blue-500/50">
      <div className="relative overflow-hidden">
        <img
          src={"https://cdn.toteja.co/"+work.cover_image || '/api/placeholder/400/250'}
          alt={work.name}
          className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-700"
          loading="lazy"
          onError={(e) => {
            e.target.src = '/api/placeholder/400/250';
          }}
        />

        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {work.is_custom && (
            <span className="px-3 py-1 bg-gradient-to-r from-violet-600 to-purple-600 text-white text-xs font-bold rounded-full flex items-center gap-1 shadow-lg">
              <Zap size={10} />
              สั่งทำพิเศษ
            </span>
          )}
          {work.is_sample && (
            <span className="px-3 py-1 bg-gradient-to-r from-cyan-600 to-blue-600 text-white text-xs font-bold rounded-full flex items-center gap-1 shadow-lg">
              <Palette size={10} />
              ตัวอย่าง
            </span>
          )}
        </div>

        {/* Favorite Button */}
        <button
          onClick={() => toggleFavorite(work.id)}
          className="absolute top-3 right-3 p-2 bg-slate-800/90 backdrop-blur-sm rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-red-600 shadow-lg border border-slate-600"
        >
          <Heart
            size={16}
            className={`${favorites.has(work.id) ? 'fill-red-400 text-red-400' : 'text-slate-300'} transition-colors`}
          />
        </button>

        {/* Quick Actions */}
        <div className="absolute bottom-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
          <button className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full transition-colors shadow-lg border border-blue-500">
            <Eye size={16} />
          </button>
          <button className="p-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full transition-colors shadow-lg border border-emerald-500">
            <Download size={16} />
          </button>
          <button className="p-2 bg-purple-600 hover:bg-purple-700 text-white rounded-full transition-colors shadow-lg border border-purple-500">
            <ExternalLink size={16} />
          </button>
        </div>

        {/* Category indicator */}
        <div className="absolute bottom-3 left-3 opacity-0 group-hover:opacity-100 transition-all duration-300">
          <span className="px-3 py-1 bg-slate-900/80 backdrop-blur-sm text-slate-200 text-xs rounded-full border border-slate-600 flex items-center gap-1">
            <Tag size={10} />
            {work.category_name || 'ไม่ระบุหมวดหมู่'}
          </span>
        </div>
      </div>

      <div className="p-5">
        <h3 className="text-lg font-bold text-slate-100 mb-2 line-clamp-1 group-hover:text-blue-400 transition-colors">
          {work.name}
        </h3>

        <p className="text-sm text-slate-400 mb-4 line-clamp-2">
          {work.main_description}
        </p>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <Clock size={12} className="text-slate-500" />
              <span className="text-xs text-slate-500">
                {new Date(work.created_at).toLocaleDateString('th-TH')}
              </span>
            </div>
          </div>

          <button
            onClick={() => handleViewDetails(work.id)}
            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-sm font-medium rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg border border-blue-500"
          >
            ดูรายละเอียด
          </button>
        </div>
      </div>
    </div>
  ));

  return (
    <div className="min-h-screen bg-gradient-to-br bg-gray-950 text-gray-100 flex mt-13">
      <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              ผลงาน
            </span>
            <span className="text-slate-300"> & </span>
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              ตัวอย่าง
            </span>
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            สำรวจผลงานการออกแบบที่หลากหลายและตัวอย่างงานคุณภาพสูง
          </p>
          <div className="mt-4 flex items-center justify-center gap-4 text-sm text-slate-500">
            <div className="flex items-center gap-2 bg-slate-800/50 px-3 py-1 rounded-full border border-slate-700">
              <Layout size={16} className="text-blue-400" />
              <span>พบผลงาน {totalCount.toLocaleString()} รายการ</span>
            </div>
            <div className="flex items-center gap-2 bg-slate-800/50 px-3 py-1 rounded-full border border-slate-700">
              <Eye size={16} className="text-emerald-400" />
              <span>แสดง {works.length} รายการ</span>
            </div>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="mb-8">
          <div className="bg-slate-800/60 backdrop-blur-sm rounded-2xl p-4 sm:p-6 shadow-2xl border border-slate-700/50">
            {/* Search */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
              <input
                autoFocus
                type="text"
                placeholder="ค้นหาผลงาน..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-900/50 border border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 text-slate-200 placeholder-slate-400 shadow-sm"
              />
            </div>

            {/* Mobile Filter Toggle */}
            <div className="md:hidden mb-4">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-slate-300 hover:bg-slate-600/50 transition-colors"
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
                <label className="block text-sm font-medium text-slate-300 mb-2">หมวดหมู่หลัก</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 shadow-sm"
                >
                  {categories.map((category) => (
                    <option key={category.id} value={category.id} className="bg-slate-800">
                      {category.name} ({category.count})
                    </option>
                  ))}
                </select>
              </div>

              {/* Subcategory Filter */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">หมวดหมู่ย่อย</label>
                <select
                  value={selectedSubcategory}
                  onChange={(e) => setSelectedSubcategory(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 shadow-sm"
                >
                  {subcategories.map((subcategory) => (
                    <option key={subcategory.id} value={subcategory.id} className="bg-slate-800">
                      {subcategory.name} ({subcategory.count})
                    </option>
                  ))}
                </select>
              </div>

              {/* Sort Filter */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">เรียงโดย</label>
                <select
                  value={selectedSort}
                  onChange={(e) => setSelectedSort(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 shadow-sm"
                >
                  {sortOptions.map((option) => (
                    <option key={option.value} value={option.value} className="bg-slate-800">
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Grid Size */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">รูปแบบแสดงผล</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setGridSize(2)}
                    className={`flex-1 p-2 rounded-lg transition-colors flex items-center justify-center gap-2 border ${
                      gridSize === 2
                        ? 'bg-blue-600 text-white shadow-md border-blue-500'
                        : 'bg-slate-700/50 text-slate-300 hover:bg-slate-600/50 border-slate-600'
                    }`}
                  >
                    <Grid2X2 size={16} />
                    <span className="hidden sm:inline">2x2</span>
                  </button>
                  <button
                    onClick={() => setGridSize(3)}
                    className={`flex-1 p-2 rounded-lg transition-colors flex items-center justify-center gap-2 border ${
                      gridSize === 3
                        ? 'bg-blue-600 text-white shadow-md border-blue-500'
                        : 'bg-slate-700/50 text-slate-300 hover:bg-slate-600/50 border-slate-600'
                    }`}
                  >
                    <Grid3X3 size={16} />
                    <span className="hidden sm:inline">3x3</span>
                  </button>
                </div>
              </div>

              {/* Reset Button */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">รีเซ็ตตัวกรอง</label>
                <button
                  onClick={resetFilters}
                  className="w-full px-4 py-2 bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 text-white rounded-lg transition-all duration-300 shadow-lg flex items-center justify-center gap-2 border border-rose-500"
                >
                  <RefreshCw size={16} />
                  รีเซ็ต
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Loading and Error states now displayed inline */}
        {loading && works.length === 0 && (
          <div className="text-center py-12">
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-400 mx-auto mb-4"></div>
              <Package className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-blue-400" size={24} />
            </div>
            <p className="text-slate-300">กำลังโหลดผลงาน...</p>
          </div>
        )}

        {error && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">⚠️</div>
            <h3 className="text-xl font-semibold text-slate-100 mb-2">เกิดข้อผิดพลาด</h3>
            <p className="text-slate-400 mb-6">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg transition-all duration-300 shadow-lg flex items-center gap-2 mx-auto border border-blue-500"
            >
              <RefreshCw size={16} />
              ลองใหม่
            </button>
          </div>
        )}

        {/* Works Grid (only display if not in initial loading or error state AND there are works) */}
        {!loading && !error && works.length > 0 ? (
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
                  className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 text-white font-medium rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:hover:scale-100 flex items-center gap-2 border border-blue-500"
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
                <h3 className="text-xl font-semibold text-slate-100 mb-2">คุณได้ดูผลงานทั้งหมดแล้ว</h3>
                <p className="text-slate-400">ทั้งหมด {totalCount.toLocaleString()} รายการ</p>
              </div>
            )}
          </>
        ) : (
          // Display "No works found" only if not loading and no error, and works.length is 0
          !loading && !error && works.length === 0 && (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold text-slate-100 mb-2">ไม่พบผลงานที่ค้นหา</h3>
              <p className="text-slate-400 mb-6">ลองเปลี่ยนคำค้นหาหรือตัวกรองใหม่</p>
              <button
                onClick={resetFilters}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg transition-all duration-300 shadow-lg flex items-center gap-2 mx-auto border border-blue-500"
              >
                <RefreshCw size={16} />
                รีเซ็ตตัวกรอง
              </button>
            </div>
          )
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