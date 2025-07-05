import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Edit3,
  Trash2,
  Search,
  Filter,
  Eye,
  Save,
  X,
  AlertCircle,
  Package,
  Loader2,
  ChevronDown,
  Calendar,
  Tag,
  Image,
  FileText,
  Zap,
  Palette,
  Settings,
  Grid3X3,
  List,
  RefreshCw,
  CheckCircle,
  XCircle,
  Upload,
  ImageIcon
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
const WorksAdminManagement = () => {
  // State Management
  const [works, setWorks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate=useNavigate();
    const [showCustomInput, setShowCustomInput] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
    const [selectedSubcategory, setSelectedSubCategory] = useState('all');
  // UI State
      const [pagination, setPagination] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create', 'edit', 'view'
  const [selectedWork, setSelectedWork] = useState(null);
  const [viewMode, setViewMode] = useState('grid'); // 'grid', 'list'

  // Search & Filter
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterSubcategory, setFilterSubcategory] = useState('all');
  const [filterType, setFilterType] = useState('all'); // 'all', 'custom', 'sample'
  const limit=12;
  const [currentPage, setCurrentPage] = useState(1);
 const handleChangeDropdown = (e) => {
    const value = e.target.value;
    if (value === "custom") {
      setShowCustomInput(true);
      setFormData({ ...formData, product_reference_id: "" });
    } else {
      setShowCustomInput(false);
      setFormData({ ...formData, product_reference_id: value });
    }
  };
  // Form State
  const [formData, setFormData] = useState({
    name: '',
    main_description: '',
    sub_description: '',
    main_category_id: '',
    subcategory_id: '',
    product_reference_id: '',
    is_custom: false,
    is_sample: false
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const apiBaseUrl = 'http://localhost:5000';
useEffect(() => {
  const params = new URLSearchParams();
  params.append("page", currentPage);
  params.append("limit", limit);

  if (selectedCategory && selectedCategory!="all") {
    params.append("category", selectedCategory);
  }
  if (selectedSubcategory && selectedSubcategory!="all") {
    params.append("subcategory", selectedSubcategory);
  }
  if (searchTerm) {
  params.append("search", searchTerm);
}
if(filterType){
   params.append("sort",filterType)
}
  axios
    .get(`${apiBaseUrl}/api/admin/works/home?${params.toString()}`)
    .then((res) => {

      setWorks(res.data.works)
      setPagination(res.data.pagination);
    });
}, [currentPage, selectedCategory, selectedSubcategory,searchTerm,filterType]);
  // Validation Rules
  const validateForm = useCallback(() => {
    const errors = {};

    if (!formData.name.trim()) {
      errors.name = 'ชื่อผลงานจำเป็นต้องกรอก';
    } else if (formData.name.length < 3) {
      errors.name = 'ชื่อผลงานต้องมีอย่างน้อย 3 ตัวอักษร';
    }

    if (!formData.main_description.trim()) {
      errors.main_description = 'คำอธิบายหลักจำเป็นต้องกรอก';
    } else if (formData.main_description.length < 10) {
      errors.main_description = 'คำอธิบายหลักต้องมีอย่างน้อย 10 ตัวอักษร';
    }

    if (!formData.main_category_id) {
      errors.main_category_id = 'หมวดหมู่หลักจำเป็นต้องเลือก';
    }

    // Only validate subcategory if a main category is selected and there are subcategories available
    const hasSubcategories = subcategories.length > 0 && formData.main_category_id !== '';
    if (hasSubcategories && !formData.subcategory_id) {
      errors.subcategory_id = 'หมวดหมู่ย่อยจำเป็นต้องเลือก';
    }

    return errors;
  }, [formData, subcategories]); // Add subcategories to dependencies for validation
  const NavigateTOWorks = (async (workId)=>{
    window.location.href =`/images/works/${workId}/page`;
  })
  // Fetch Initial Data
  const fetchInitialData = useCallback(async () => {
    try {
      setInitialLoading(true);
      setError(null); // Clear previous errors
      const [worksRes, categoriesRes, allSubcategoriesRes, productsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/admin/works/home`),
        fetch(`${API_BASE_URL}/works/categories`),
        fetch(`${API_BASE_URL}/works/subcategories`), // Fetch all subcategories initially
        fetch(`${API_BASE_URL}/admin/products`)
      ]);

      if (!worksRes.ok || !categoriesRes.ok || !allSubcategoriesRes.ok || !productsRes.ok) {
        throw new Error('Failed to fetch data');
      }

      const [worksData, categoriesData, allSubcategoriesData, productsData] = await Promise.all([
        worksRes.json(),
        categoriesRes.json(),
        allSubcategoriesRes.json(),
        productsRes.json()
      ]);

      setWorks(worksData.works);
      setCategories(categoriesData);
      setSubcategories(allSubcategoriesData); // Store all subcategories
      setProducts(productsData.data);
    } catch (error) {
      console.error('Error fetching initial data:', error);
      setError('ไม่สามารถโหลดข้อมูลได้: ' + error.message);
    } finally {
      setInitialLoading(false);
      setLoading(false);
    }
  }, []);

  // Fetch subcategories by category (for dropdown filtering in form)
  const fetchSubcategoriesByCategoryId = useCallback(async (categoryId) => {
    if (!categoryId) {
      // If no category is selected, clear subcategory options or set to default
      setSubcategories([]); // Or filter the full list if you fetched all initially
      return;
    }
    try {
      const response = await fetch(`${API_BASE_URL}/works/subcategories/category/${categoryId}`);
      if (response.ok) {
        const data = await response.json();
        setSubcategories(data);
      } else {
        setSubcategories([]); // Clear if category doesn't have subcategories
      }
    } catch (error) {
      console.error('Error fetching subcategories:', error);
      setSubcategories([]); // Clear on error
    }
  }, []);

  // Effect hooks
  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  // Effect for handling subcategory dropdown in form based on main category selection
  useEffect(() => {
    if (showModal && (modalMode === 'create' || modalMode === 'edit') && formData.main_category_id) {
      fetchSubcategoriesByCategoryId(formData.main_category_id);
    } else if (showModal && (modalMode === 'create' || modalMode === 'edit') && !formData.main_category_id) {
      setSubcategories([]); // Clear subcategories if no main category is selected
    } else if (!showModal) {
      // When modal closes, re-fetch all subcategories for the main filter dropdowns
      // Or if you want to optimize, keep a separate state for filter subcategories
      fetch(`${API_BASE_URL}/works/subcategories`).then(res => res.json()).then(setSubcategories).catch(console.error);
    }
  }, [formData.main_category_id, fetchSubcategoriesByCategoryId, showModal, modalMode]);


  // Filtered works
 
  // Modal handlers
  const openModal = (mode, work = null) => {
    setModalMode(mode);
    setSelectedWork(work);

    if (mode === 'create') {
      setFormData({
        name: '',
        main_description: '',
        sub_description: '',
        main_category_id: '',
        subcategory_id: '',
        product_reference_id: '',
        is_custom: false,
        is_sample: false
      });
      // Ensure subcategories are reset or fetched for new selection
      fetchSubcategoriesByCategoryId(''); // Clear subcategories for new creation
    } else if (work) {
      // Ensure form values are numbers for IDs where needed
      setFormData({
        name: work.name || '',
        main_description: work.main_description || '',
        sub_description: work.sub_description || '',
        main_category_id: work.main_category_id ? String(work.main_category_id) : '',
        subcategory_id: work.subcategory_id ? String(work.subcategory_id) : '',
        product_reference_id: work.product_reference_id ? String(work.product_reference_id) : '',
        is_custom: work.is_custom || false,
        is_sample: work.is_sample || false
      });
      // Fetch subcategories for the selected work's category
      if (work.main_category_id) {
        fetchSubcategoriesByCategoryId(work.main_category_id);
      }
    }

    setFormErrors({});
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedWork(null);
    setFormData({
      name: '',
      main_description: '',
      sub_description: '',
      main_category_id: '',
      subcategory_id: '',
      product_reference_id: '',
      is_custom: false,
      is_sample: false
    });
    setFormErrors({});
    // Re-fetch all subcategories for the main filter after closing modal
    fetch(`${API_BASE_URL}/works/subcategories`).then(res => res.json()).then(setSubcategories).catch(console.error);
  };

  // CRUD Operations
  const handleSubmit = async (e) => {
    e.preventDefault();

    const errors = validateForm();
    setFormErrors(errors);

    if (Object.keys(errors).length > 0) {
      return;
    }

    setSubmitting(true);

    try {
      const newWorksData = {
        name: formData.name,
        main_description: formData.main_description,
        sub_description: formData.sub_description || null,
        main_category_id: parseInt(formData.main_category_id),
        subcategory_id: formData.subcategory_id ? parseInt(formData.subcategory_id) : null, // Subcategory can be null if not required
        product_reference_id: formData.product_reference_id ? parseInt(formData.product_reference_id) : null,
        is_custom: formData.is_custom,
        is_sample: formData.is_sample
      };

      const url = modalMode === 'create'
        ? `${API_BASE_URL}/admin/new/works`
        : `${API_BASE_URL}/admin/edit/works/${selectedWork.id}`;

      const method = modalMode === 'create' ? 'POST' : 'PUT';
    console.log(newWorksData)
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newWorksData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save work');
      }

      const result = await response.json();
    console.log(result.worksId)
      if (modalMode === 'create') {
        setWorks(prev => [...prev, {...newWorksData,id: result.worksId}]);
         if(result.worksId!=undefined){
            NavigateTOWorks(result.worksId,newWorksData.main_category_id,newWorksData.subcategory_id);
         }
      
} else {
        setWorks(prev => prev.map(work =>
          work.id === selectedWork.id ? { ...work, ...newWorksData } : work
        ));
      }

      closeModal();
    } catch (error) {
      console.error('Error saving work:', error);
      setError('ไม่สามารถบันทึกข้อมูลได้: ' + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (worksId) => {
    if (!confirm('คุณแน่ใจหรือไม่ที่จะลบผลงานนี้? การดำเนินการนี้ไม่สามารถย้อนกลับได้')) return;
    try {
      const response = await fetch(`${API_BASE_URL}/admin/delete/works/:${worksId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete work');
      }

      setWorks(prev => prev.filter(work => work.id !== worksId));
      setError(null); // Clear error if delete successful
    } catch (error) {
      console.error('Error deleting work:', error);
      setError('ไม่สามารถลบข้อมูลได้: ' + error.message);
    }
  };


  const getProductName = (id) => products.find(prod => prod.id === id)?.name || 'N/A';

  // Skeleton Components
  const WorkCardSkeleton = () => (
    <div className="bg-slate-800/50 rounded-2xl p-6 animate-pulse border border-slate-700/50">
      <div className="h-6 bg-slate-700 rounded mb-3"></div>
      <div className="h-4 bg-slate-700 rounded mb-2"></div>
      <div className="h-4 bg-slate-700 rounded w-3/4 mb-4"></div>
      <div className="flex justify-between items-center">
        <div className="h-4 bg-slate-700 rounded w-1/4"></div>
        <div className="flex gap-2">
          <div className="h-8 w-8 bg-slate-700 rounded"></div>
          <div className="h-8 w-8 bg-slate-700 rounded"></div>
          <div className="h-8 w-8 bg-slate-700 rounded"></div>
        </div>
      </div>
    </div>
  );

  const WorkRowSkeleton = () => (
    <div className="bg-slate-800/50 rounded-lg p-4 animate-pulse border border-slate-700/50">
      <div className="grid grid-cols-12 gap-4 items-center">
        <div className="col-span-3 h-4 bg-slate-700 rounded"></div>
        <div className="col-span-4 h-4 bg-slate-700 rounded"></div>
        <div className="col-span-2 h-4 bg-slate-700 rounded"></div>
        <div className="col-span-2 h-4 bg-slate-700 rounded"></div>
        <div className="col-span-1 flex gap-1">
          <div className="h-6 w-6 bg-slate-700 rounded"></div>
          <div className="h-6 w-6 bg-slate-700 rounded"></div>
          <div className="h-6 w-6 bg-slate-700 rounded"></div>
        </div>
      </div>
    </div>
  );

  if (initialLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-gray-100 p-6">
        <div className="container mx-auto">
          {/* Header Skeleton */}
          <div className="mb-8">
            <div className="h-10 bg-slate-700 rounded w-1/3 mb-4 animate-pulse"></div>
            <div className="h-4 bg-slate-700 rounded w-1/2 animate-pulse"></div>
          </div>

          {/* Controls Skeleton */}
          <div className="bg-slate-800/60 rounded-2xl p-6 mb-8 animate-pulse">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="h-10 bg-slate-700 rounded"></div>
              <div className="h-10 bg-slate-700 rounded"></div>
              <div className="h-10 bg-slate-700 rounded"></div>
              <div className="h-10 bg-slate-700 rounded"></div>
            </div>
          </div>

          {/* Content Skeletons */}
          <div className={viewMode === 'grid'
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            : "space-y-4"
          }>
            {[...Array(6)].map((_, i) => (
              viewMode === 'grid' ? <WorkCardSkeleton key={i} /> : <WorkRowSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-gray-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">
            <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              จัดการผลงาน
            </span>
          </h1>
          <p className="text-slate-400 text-lg">
            เพิ่ม แก้ไข และจัดการผลงานทั้งหมด
          </p>
        </div>

        {/* Controls */}
        <div className="bg-slate-800/60 backdrop-blur-sm rounded-2xl p-6 mb-8 shadow-2xl border border-slate-700/50">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between mb-6">
            <div className="flex gap-4 items-center">
              <button
                onClick={() => openModal('create')}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white rounded-lg transition-all duration-300 shadow-lg border border-emerald-500"
              >
                <Plus size={18} />
                เพิ่มผลงานใหม่
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-colors ${
                    viewMode === 'grid'
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-700/50 text-slate-300 hover:bg-slate-600/50'
                  }`}
                >
                  <Grid3X3 size={18} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition-colors ${
                    viewMode === 'list'
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-700/50 text-slate-300 hover:bg-slate-600/50'
                  }`}
                >
                  <List size={18} />
                </button>
              </div>
            </div>

            <div className="text-sm text-slate-400 bg-slate-700/50 px-3 py-1 rounded-full">
              ทั้งหมด {works.length} รายการ
            </div>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="text"
                placeholder="ค้นหาผลงาน..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-900/50 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-slate-200 placeholder-slate-400"
              />
            </div>

            {/* Category Filter */}
            <div className="relative">
              <select
                value={filterCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  setFilterCategory(e.target.value);
                  setFilterSubcategory("all")
                 setSelectedSubCategory("all");
                }}
                className="block appearance-none w-full px-3 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 pr-8"
              >
                <option value="all">ทุกหมวดหมู่</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
              <ChevronDown size={16} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>


            {/* Subcategory Filter */}
            <div className="relative">
              <select
                value={filterSubcategory}
                 onChange={(e) => {
                  setSelectedSubCategory(e.target.value);
                setFilterSubcategory(e.target.value)
                }}
                className="block appearance-none w-full px-3 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 pr-8"
                disabled={filterCategory === 'all' || !subcategories.length} // Disable if no category selected or no subcategories
              >
                <option value="all">ทุกหมวดหมู่ย่อย</option>
               {subcategories
  .filter(
    sub =>
      sub?.category_id != null && // ✅ ตรวจสอบว่าไม่ใช่ undefined/null ก่อน
      (filterCategory === 'all' || sub.category_id.toString() === filterCategory.toString())
  )
  .map(sub => (
    <option key={sub.id} value={sub.id}>{sub.name}</option>
))}
              </select>
              <ChevronDown size={16} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>

            {/* Type Filter */}
            <div className="relative">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="block appearance-none w-full px-3 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 pr-8"
              >
                <option value="all">ทุกประเภท</option>
                <option value="custom">งานสั่งทำ</option>
                <option value="sample">งานตัวอย่าง</option>
              </select>
              <ChevronDown size={16} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>

            {/* Refresh */}
            <button
              onClick={fetchInitialData}
              disabled={loading}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-slate-700/50 hover:bg-slate-600/50 text-slate-300 rounded-lg transition-colors border border-slate-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
              รีเฟรช
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-500/20 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg mb-6 flex items-center gap-2 animate-fade-in">
            <AlertCircle size={18} />
            {error}
          </div>
        )}

        {/* Works Grid/List */}
        {loading ? (
          <div className={viewMode === 'grid'
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            : "space-y-4"
          }>
            {[...Array(6)].map((_, i) =>
              viewMode === 'grid' ? <WorkCardSkeleton key={i} /> : <WorkRowSkeleton key={i} />
            )}
          </div>
        ) : works.length === 0 ? (
          <div className="text-center py-20">
            <Package size={64} className="mx-auto text-slate-600 mb-4" />
            <h3 className="text-xl font-semibold text-slate-300 mb-2">ไม่พบผลงาน</h3>
            <p className="text-slate-500 mb-4">ลองเปลี่ยนเงื่อนไขการค้นหาหรือเพิ่มผลงานใหม่</p>
            <button
              onClick={() => openModal('create')}
              className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white rounded-lg transition-all duration-300 shadow-lg"
            >
              เพิ่มผลงานแรก
            </button>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {works.map((work) => (
              <div
                key={work.id}
                className="bg-slate-800/50 backdrop-blur-sm rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 border border-slate-700/50 hover:border-blue-500/50"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-lg font-semibold text-slate-100 line-clamp-1">
                      {work.name}
                    </h3>
                    <div className="flex gap-1">
                      {work.is_custom && (
                        <span className="px-2 py-1 bg-violet-600/20 text-violet-400 text-xs rounded-full border border-violet-500/30">
                          <Zap size={10} className="inline mr-1" />
                          สั่งทำ
                        </span>
                      )}
                      {work.is_sample && (
                        <span className="px-2 py-1 bg-cyan-600/20 text-cyan-400 text-xs rounded-full border border-cyan-500/30">
                          <Palette size={10} className="inline mr-1" />
                          ตัวอย่าง
                        </span>
                      )}
                    </div>
                  </div>

                  <p className="text-sm text-slate-400 mb-4 line-clamp-2">
                    {work.main_description}
                  </p>

                  <div className="flex flex-wrap items-center justify-between text-xs text-slate-500 mb-4 gap-2">
                    <span className="flex items-center gap-1">
                      <Tag size={12} />
                      {work.category_name}
                    </span>
                    <span className="flex items-center gap-1">
                      <ChevronDown size={12} className="rotate-[-90deg]" /> {/* Placeholder for subcategory icon */}
                    {work.subcategory_name}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar size={12} />
                      {new Date(work.created_at).toLocaleDateString('th-TH', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </span>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => openModal('view', work)}
                      className="flex-1 px-3 py-2 bg-blue-600/20 text-blue-400 rounded-lg hover:bg-blue-600/30 transition-colors border border-blue-500/30 flex items-center justify-center gap-2"
                    >
                      <Eye size={14} />
                      ดู
                    </button>
                    <button
                      onClick={() => openModal('edit', work)}
                      className="flex-1 px-3 py-2 bg-emerald-600/20 text-emerald-400 rounded-lg hover:bg-emerald-600/30 transition-colors border border-emerald-500/30 flex items-center justify-center gap-2"
                    >
                      <Edit3 size={14} />
                      แก้ไข
                    </button>
                    <button
                      onClick={() => handleDelete(work.id)}
                      className="px-3 py-2 bg-red-600/20 text-red-400 rounded-lg hover:bg-red-600/30 transition-colors border border-red-500/30"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {works.map((work) => (
              <div
                key={work.id}
                className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-4 shadow-lg border border-slate-700/50 hover:border-blue-500/50 transition-all duration-300"
              >
                <div className="grid grid-cols-12 gap-4 items-center">
                  <div className="col-span-12 md:col-span-3">
                    <h3 className="font-semibold text-slate-100 mb-1">{work.name}</h3>
                    <div className="flex gap-1">
                      {work.is_custom && (
                        <span className="px-2 py-1 bg-violet-600/20 text-violet-400 text-xs rounded-full">
                          สั่งทำ
                        </span>
                      )}
                      {work.is_sample && (
                        <span className="px-2 py-1 bg-cyan-600/20 text-cyan-400 text-xs rounded-full">
                          ตัวอย่าง
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="col-span-12 md:col-span-4 text-sm text-slate-400 line-clamp-2">
                    {work.main_description}
                  </div>

                  <div className="col-span-6 md:col-span-2 text-sm text-slate-500">
                    {work.category_name}
                    <br />
                    <span className="text-xs">{work.subcategory_name}</span>
                  </div>

                  <div className="col-span-6 md:col-span-2 text-sm text-slate-500">
                    {new Date(work.created_at).toLocaleDateString('th-TH', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </div>

                  <div className="col-span-12 md:col-span-1 flex gap-1 justify-end">
                    <button
                      onClick={() => openModal('view', work)}
                      className="p-2 bg-blue-600/20 text-blue-400 rounded hover:bg-blue-600/30 transition-colors"
                    >
                      <Eye size={14} />
                    </button>
                    <button
                      onClick={() => openModal('edit', work)}
                      className="p-2 bg-emerald-600/20 text-emerald-400 rounded hover:bg-emerald-600/30 transition-colors"
                    >
                      <Edit3 size={14} />
                    </button>
                    <button
                      onClick={() => handleDelete(work.id)}
                      className="p-2 bg-red-600/20 text-red-400 rounded hover:bg-red-600/30 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      {pagination.total > 1 && (
           <div className="flex items-center justify-center gap-2 mt-8">
             <button
              onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
               disabled={currentPage === 1}
               className="flex items-center px-3 py-2 text-sm font-medium text-gray-300 bg-gray-800 border border-gray-700 rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
             >
               <ChevronLeft size={16} className="mr-1" />
               ก่อนหน้า
             </button>
   
             {Array.from({ length: pagination.page }, (_, i) => i + 1).map((page) => (
               <button
                 key={pagination.page}
                 onClick={() => setCurrentPage(pagination.page)}
                 className={`px-3 py-2 text-sm rounded-lg ${
                   currentPage === pagination.page
                     ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                     : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                 }`}
               >
                 {page}
               </button>
             ))}
   
             <button
              onClick={() => setCurrentPage(p => Math.min(p + 1, pagination.total))}
               disabled={currentPage === pagination.page}
               className="flex items-center px-3 py-2 text-sm font-medium text-gray-300 bg-gray-800 border border-gray-700 rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
             >
               ถัดไป
               <ChevronRight size={16} className="ml-1" />
             </button>
           </div>
         )}
        {/* Modal */}
     {showModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-slate-800 rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-700">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-slate-100">
                  {modalMode === 'create' && 'เพิ่มผลงานใหม่'}
                  {modalMode === 'edit' && 'แก้ไขผลงาน'}
                  {modalMode === 'view' && 'รายละเอียดผลงาน'}
                </h2>
                <button
                  onClick={closeModal}
                  className="p-2 rounded-full bg-slate-700/50 hover:bg-slate-600/50 text-slate-300 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Modal Content */}
              {modalMode === 'view' && selectedWork ? (
                <div className="space-y-4 text-slate-300">
                  <div>
                    <strong className="block text-slate-400 mb-1">ชื่อผลงาน:</strong>
                    <p>{selectedWork.name}</p>
                  </div>
                  <div>
                    <strong className="block text-slate-400 mb-1">คำอธิบายหลัก:</strong>
                    <p>{selectedWork.main_description}</p>
                  </div>
                  {selectedWork.sub_description && (
                    <div>
                      <strong className="block text-slate-400 mb-1">คำอธิบายย่อย:</strong>
                      <p>{selectedWork.sub_description}</p>
                    </div>
                  )}
                  <div>
                    <strong className="block text-slate-400 mb-1">หมวดหมู่หลัก:</strong>
                    <p>{selectedWork.category_name}</p>
                  </div>
                  <div>
                    <strong className="block text-slate-400 mb-1">หมวดหมู่ย่อย:</strong>
                    <p>{selectedWork.subcategory_name}</p>
                  </div>
                  {selectedWork.product_reference_id && (
                    <div>
                      <strong className="block text-slate-400 mb-1">อ้างอิงสินค้า:</strong>
                      <p>{getProductName(selectedWork.product_reference_id)}</p>
                    </div>
                  )}
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <strong className="text-slate-400">งานสั่งทำ:</strong>
                      {selectedWork.is_custom ? <CheckCircle size={18} className="text-emerald-500" /> : <XCircle size={18} className="text-red-500" />}
                    </div>
                    <div className="flex items-center gap-2">
                      <strong className="text-slate-400">งานตัวอย่าง:</strong>
                      {selectedWork.is_sample ? <CheckCircle size={18} className="text-emerald-500" /> : <XCircle size={18} className="text-red-500" />}
                    </div>
                  </div>
                  <div className="text-sm text-slate-500 mt-4">
                    สร้างเมื่อ: {new Date(selectedWork.created_at).toLocaleDateString('th-TH', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </div>
                  {selectedWork.updated_at && (
                    <div className="text-sm text-slate-500">
                      อัปเดตล่าสุด: {new Date(selectedWork.updated_at).toLocaleDateString('th-TH', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </div>
                  )}
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="name" className="block text-slate-300 text-sm font-medium mb-1">ชื่อผลงาน <span className="text-red-400">*</span></label>
                    <input
                      type="text"
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className={`w-full px-4 py-2 bg-slate-900/50 border ${formErrors.name ? 'border-red-500' : 'border-slate-600'} rounded-lg text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50`}
                      placeholder="ใส่ชื่อผลงาน"
                    />
                    {formErrors.name && <p className="text-red-400 text-xs mt-1">{formErrors.name}</p>}
                  </div>

                  <div>
                    <label htmlFor="main_description" className="block text-slate-300 text-sm font-medium mb-1">คำอธิบายหลัก <span className="text-red-400">*</span></label>
                    <textarea
                      id="main_description"
                      value={formData.main_description}
                      onChange={(e) => setFormData({ ...formData, main_description: e.target.value })}
                      className={`w-full px-4 py-2 bg-slate-900/50 border ${formErrors.main_description ? 'border-red-500' : 'border-slate-600'} rounded-lg text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 h-24`}
                      placeholder="ใส่คำอธิบายหลักของผลงาน"
                    ></textarea>
                    {formErrors.main_description && <p className="text-red-400 text-xs mt-1">{formErrors.main_description}</p>}
                  </div>

                  <div>
                    <label htmlFor="sub_description" className="block text-slate-300 text-sm font-medium mb-1">คำอธิบายย่อย (ไม่จำเป็น)</label>
                    <textarea
                      id="sub_description"
                      value={formData.sub_description}
                      onChange={(e) => setFormData({ ...formData, sub_description: e.target.value })}
                      className="w-full px-4 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 h-20"
                      placeholder="ใส่คำอธิบายย่อยเพิ่มเติม"
                    ></textarea>
                  </div>

                  {/* Simplified Image Management Section */}
              {modalMode !== 'create' && (
                  <div className="bg-slate-900/30 border border-slate-600 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => {NavigateTOWorks(selectedWork.id)}}
                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white text-sm rounded-lg transition-all duration-300 shadow-md hover:shadow-lg"
                      >
                        <Image size={16} />
                        จัดการรูปภาพ
                      </button>
                    </div>
                  </div>
              )}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="main_category_id" className="block text-slate-300 text-sm font-medium mb-1">หมวดหมู่หลัก <span className="text-red-400">*</span></label>
                      <div className="relative">
                        <select
                          id="main_category_id"
                          value={formData.main_category_id}
                          onChange={(e) => {
  setFormData({ ...formData, main_category_id: e.target.value }); 
}}
                          className={`block appearance-none w-full px-4 py-2 bg-slate-900/50 border ${formErrors.main_category_id ? 'border-red-500' : 'border-slate-600'} rounded-lg text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 pr-8`}
                        >
                          <option value="">เลือกหมวดหมู่หลัก</option>
                          {categories
                            .filter(cat => cat.name !== "ทั้งหมด")
                            .map(cat => (
                              <option key={cat.id} value={cat.id}>{cat.name}</option>
                          ))}
                        </select>
                        <ChevronDown size={16} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 pointer-events-none" />
                      </div>
                      {formErrors.main_category_id && <p className="text-red-400 text-xs mt-1">{formErrors.main_category_id}</p>}
                    </div>

                    <div>
                      <label htmlFor="subcategory_id" className="block text-slate-300 text-sm font-medium mb-1">หมวดหมู่ย่อย <span className="text-red-400">*</span></label>
                      <div className="relative">
                        <select
                          id="subcategory_id"
                          value={formData.subcategory_id}
                                                 onChange={(e) => {
  setFormData({ ...formData, subcategory_id: e.target.value }); 
}}
                          className={`block appearance-none w-full px-4 py-2 bg-slate-900/50 border ${formErrors.subcategory_id ? 'border-red-500' : 'border-slate-600'} rounded-lg text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 pr-8`}
                          disabled={!formData.main_category_id || subcategories.length === 0}
                        >
                          <option value="">เลือกหมวดหมู่ย่อย</option>
                          {subcategories
                            .filter(sub => sub.name !== "ทั้งหมด")
                            .map(sub => (
                              <option key={sub.id} value={sub.id}>{sub.name}</option>
                          ))}
                        </select>
                        <ChevronDown size={16} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 pointer-events-none" />
                      </div>
                      {formErrors.subcategory_id && <p className="text-red-400 text-xs mt-1">{formErrors.subcategory_id}</p>}
                    </div>
                  </div>

                  <div>
                    <label htmlFor="product_reference_id" className="block text-slate-300 text-sm font-medium mb-1">อ้างอิงสินค้า (ไม่จำเป็น)</label>
                    <div className="relative">
                      <select
                        id="product_reference_id"
                          value={showCustomInput ? "custom" : formData.product_reference_id}

                        onChange={handleChangeDropdown}
                        className="block appearance-none w-full px-4 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 pr-8"
                      >
                        <option value="">ไม่มี</option>
                         <option value="custom">อื่นๆ (พิมพ์ ID เอง)</option>
                        {products.map(prod => (
                          <option key={prod.id} value={prod.id}>{prod.name}</option>
                        ))}
                      </select>
                      <ChevronDown size={16} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 pointer-events-none" />
                       {showCustomInput && (
        <input
          type="text"
          placeholder="ใส่ ID เอง"
          value={formData.product_reference_id}
          onChange={(e) =>
            setFormData({ ...formData, product_reference_id: e.target.value })
          }
          className="mt-2 w-full px-4 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
        />
      )}
                    </div>
                         

                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="is_custom"
                        checked={formData.is_custom}
                        onChange={(e) => setFormData({ ...formData, is_custom: e.target.checked })}
                        className="h-4 w-4 text-blue-600 bg-slate-700 border-slate-600 rounded focus:ring-blue-500"
                      />
                      <label htmlFor="is_custom" className="ml-2 text-slate-300 text-sm">งานสั่งทำ</label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="is_sample"
                        checked={formData.is_sample}
                        onChange={(e) => setFormData({ ...formData, is_sample: e.target.checked })}
                        className="h-4 w-4 text-blue-600 bg-slate-700 border-slate-600 rounded focus:ring-blue-500"
                      />
                      <label htmlFor="is_sample" className="ml-2 text-slate-300 text-sm">งานตัวอย่าง</label>
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 mt-6">
                    <button
                      type="button"
                      onClick={closeModal}
                      className="flex items-center gap-2 px-5 py-2 bg-slate-700/50 hover:bg-slate-600/50 text-slate-300 rounded-lg transition-colors border border-slate-600"
                    >
                      <X size={16} />
                      ยกเลิก
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg transition-all duration-300 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {submitting ? (
                        <>
                          <Loader2 size={16} className="animate-spin" />
                          กำลังบันทึก...
                        </>
                      ) : (
                        <>
                          <Save size={16} />
                          {modalMode === 'create' ? 'บันทึก' : 'อัปเดต'}
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WorksAdminManagement;