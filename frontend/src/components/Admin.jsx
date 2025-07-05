import React, { useState, useEffect,useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Adminworks from './AdminWorks';
import { 
  Award,
  Plus,
  Search,
  Filter,
  Edit3,
  Trash2,
  Eye,
  Upload,
  Save,
  X,
  Package,
  Grid3X3,
  List,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  DollarSign,
  ShoppingCart,
  Star,
  Image as ImageIcon,
  Settings,
  BarChart3,
  Users,
  LogOut
} from 'lucide-react';

const AdminDashboard = () => {
  const descriptionRef = useRef();
  const nameRef = useRef();
  const priceRef = useRef();
   const stockRef = useRef();
   const iconRef = useRef();
  const [currentlyFocusedField, setCurrentlyFocusedField] = useState('name');
  const navigate = useNavigate();
  const [currentView, setCurrentView] = useState('products'); // products, categories, subcategories, dashboard
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
    const [selectedSubcategory, setSelectedSubCategory] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState(''); // 'add', 'edit', 'delete'
  const [selectedItem, setSelectedItem] = useState(null);
  const [gridView, setGridView] = useState(true);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
    const [pagination, setPagination] = useState({});
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
    let newProductId,newCategoryId,newSubcategoryId;
    const apiBaseUrl = "http://localhost:5000";
  const limit = 12;
 const navigateToProductsImage = (productId) => {
    // สำหรับการทดสอบ เราจะใช้ alert แต่ในระบบจริงคุณจะใช้ router
    // ในระบบจริงจะเป็นแบบนี้:
    navigate(`/images/${productId}`);
    // หรือ window.location.href = `/category/${encodeURIComponent(categoryName)}`;
  };
    useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500); // รอ 1 วินาที

    return () => {
      clearTimeout(handler); // ถ้าผู้ใช้ยังพิมพ์อยู่ ให้เคลียร์ timeout เดิม
    };
  }, [searchTerm]);
  // Form states
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    description: '',
    category_id: '',
    subcategory_id: '',
    stock: '',
    image_Main_path: '',
    image_Sub_path: ''
  },[currentPage]);
 console.log("reloadunderFormdata")
  // Mock data
  const filteredSubcategories = subcategories.filter(
  (sub) => sub.category_id === parseInt(selectedCategory)
);
useEffect(() => {
  if (currentlyFocusedField === 'description' && descriptionRef.current) {
    const el = descriptionRef.current;
    el.focus();
    const length = el.value.length;
    el.setSelectionRange(length, length);
  } else if (currentlyFocusedField === 'name' && nameRef.current) {
    const el = nameRef.current;
    el.focus();
    const length = el.value.length;
    el.setSelectionRange(length, length);
  }else if(currentlyFocusedField === 'price' && priceRef.current){
      const el = priceRef.current;
       el.focus();
    const length = el.value.length;
    el.setSelectionRange(length, length);
  }else if(currentlyFocusedField === 'stock' && stockRef.current){
      const el = stockRef.current;
       el.focus();
    const length = el.value.length;
    el.setSelectionRange(length, length);
  }else if(currentlyFocusedField === 'icon' && iconRef.current){
      const el = iconRef.current;
       el.focus();
    const length = el.value.length;
    el.setSelectionRange(length, length);
  }
}, [formData, currentlyFocusedField]);
useEffect(() => {
  const params = new URLSearchParams();
  params.append("page", currentPage);
  params.append("limit", limit);

  if (selectedCategory && selectedCategory!="all") {
    params.append("categoryId", selectedCategory);
  }

  if (selectedSubcategory && selectedSubcategory!="all") {
    params.append("subcategoryId", selectedSubcategory);
  }
  if (searchTerm) {
  params.append("searchTerm", searchTerm);
}

  axios
    .get(`${apiBaseUrl}/api/admin/products?${params.toString()}`)
    .then((res) => {
      setProducts(res.data.data);
      setPagination(res.data.pagination);
    });
}, [currentPage, selectedCategory, selectedSubcategory,debouncedSearchTerm]);
  useEffect(() => {
    axios.get(`${apiBaseUrl}/api/admin/Categories`).then((res) => {
     setCategories(res.data.categories);
    });
  }, []);
    useEffect(() => {
    axios.get(`${apiBaseUrl}/api/admin/subcategories`).then((res) => {
      setSubcategories(res.data.subcategories);
    });
  }, []);


  const formatPrice = (price) => {
    return new Intl.NumberFormat('th-TH').format(price);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('th-TH');
  };

  const handleModal = (type, item = null) => {
     console.log("reloadHandlemodal")
    setModalType(type);
    setSelectedItem(item);
      setShowModal(true);
    if (item && type === 'edit') {
       console.log("reloadSetformdata")
      setFormData({
        id: item.id || '',
        name: item.name || '',
        price: item.price || '',
        description: item.description || '',
        category_id: item.category_id || '',
        subcategory_id: item.subcategory_id || '',
        stock: item.stock || '',
        image_Main_path: item.image_Main_path || '',
        image_Sub_path: item.image_Sub_path || ''
      });
    } else {
      setFormData({
        name: '',
        price: '',
        description: '',
        category_id: '',
        subcategory_id: '',
        stock: '',
        image_Main_path: '',
        image_Sub_path: ''
      });
    }
    
  };
   const DeleteProduct = (productId) => {
      axios.delete(`${apiBaseUrl}/api/admin/delete/${productId}`).then((res) => {
    });
   }
   const DeleteCategory = (categoryId) => {
      axios.delete(`${apiBaseUrl}/api/admin/delete/category/${categoryId}`).then((res) => {
    });
   }
    const DeleteSubcategory = (subcategoryId) => {
      axios.delete(`${apiBaseUrl}/api/admin/delete/subcategory/${subcategoryId}`).then((res) => {
    });
   }
  const closeModal = () => {
    setShowModal(false);
    setSelectedItem(null);
    setModalType('');
    setFormData({
      name: '',
      price: '',
      description: '',
      category_id: '',
      subcategory_id: '',
      stock: '',
      image_Main_path: '',
      image_Sub_path: ''
    });
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    
    if (modalType === 'add') {

          if (currentView === 'products') {
                         const newProductData = {
                  id : null,
        // We're sending all form data, but explicitly ensuring numbers are numbers
        name: formData.name, // Assuming 'name' is also in formData
        description: formData.description, // Assuming 'description' is also in formData
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock),
        category_id: parseInt(formData.category_id),
        subcategory_id: parseInt(formData.subcategory_id) ,
        image_Main_path : formData.image_Main_path,
        total_purchases : 0,
        monthly_purchases : 0,
          created_at: new Date().toISOString().split('T')[0]
        
      };
      
    try {
          console.log(newProductData)
        const response = await fetch(`${apiBaseUrl}/api/admin/new`, {
            method: 'POST', // Use PUT for updating an existing resource
            headers: {
                'Content-Type': 'application/json',
                // Add any authorization headers here if required (e.g., 'Authorization': `Bearer ${token}`)
            },
            body: JSON.stringify(newProductData) // Send the prepared data as JSON
        });

        // if (!response.ok) {
        //     // If the server response is not OK (e.g., 400, 500 status)
        //     const errorData = await response.json();
            
        //     throw new Error(errorData.message || 'Failed to update product on server.');
        // }
       
        // console.log('Product update successful:', result);
           
        // If the API call is successful, then update the local state.
        // // This ensures your UI reflects what's now in the databas  e.
        //  console.log(response.json().productId+"newProdcutId data");
        const productId = await response.json();
           newProductId= productId.productId;
                 setProducts(products => [...products, {
      ...newProductData,
      id: newProductId // ใช้ ID จาก server หรือสร้างชั่วคราว
    }]);
    if(productId.productId!=undefined){
       navigateToProductsImage(productId.productId)
    }
    } catch (error) {
        console.error('Error updating product:', error);
    } 
      } else if (currentView === 'categories') {
        const newCategory = {
          ...formData,
        name: formData.name, // Assuming 'name' is also in formData
        description : formData.description,
        icon : formData.icon,
        id : null
        };
         try {
        const response = await fetch(`${apiBaseUrl}/api/admin/new/category`, {
            method: 'POST', // Use PUT for updating an existing resource
            headers: {
                'Content-Type': 'application/json',
                // Add any authorization headers here if required (e.g., 'Authorization': `Bearer ${token}`)
            },
            body: JSON.stringify(newCategory) // Send the prepared data as JSON
        });
        const category = await response.json();
           newCategoryId= category.categoryId;
                 setCategories(categories => [...categories, {
      ...newCategory,
      id: newCategoryId // ใช้ ID จาก server หรือสร้างชั่วคราว
    }]);
          //  console.log(newProductId.productId+"newProdcutId data");
    } catch (error) {
        console.error('Error updating product:', error);
    } 
         
      } else if(currentView == "subcategories") {
              const newSubcategory = {
          ...formData,
        name: formData.name, // Assuming 'name' is also in formData
        description : formData.description,
        icon : formData.icon,
        id : null
        };
         try {
        const response = await fetch(`${apiBaseUrl}/api/admin/new/subcategory`, {
            method: 'POST', // Use PUT for updating an existing resource
            headers: {
                'Content-Type': 'application/json',
                // Add any authorization headers here if required (e.g., 'Authorization': `Bearer ${token}`)
            },
            body: JSON.stringify(newSubcategory) // Send the prepared data as JSON
        });
        const subcategory = await response.json();
           newSubcategoryId= subcategory.subcategoryId;
                 setSubcategories(subcategories => [...subcategories, {
      ...newSubcategory,
      id: newSubcategoryId // ใช้ ID จาก server หรือสร้างชั่วคราว
    }]);
          //  console.log(newProductId.productId+"newProdcutId data");
    } catch (error) {
        console.error('Error updating product:', error);
    } 
        
} 
    } else if (modalType === 'edit') {
      if (currentView === 'products') {
        setProducts(products.map(p => 
          p.id === selectedItem.id 
            ? { 
                ...p, 
                ...formData,
                price: parseFloat(formData.price),
                stock: parseInt(formData.stock),
                category_id: parseInt(formData.category_id),
                subcategory_id: parseInt(formData.subcategory_id)
              }
            : p
        ));
          const newProductData = {
            id:selectedItem.id,
        // We're sending all form data, but explicitly ensuring numbers are numbers
        name: formData.name, // Assuming 'name' is also in formData
        description: formData.description, // Assuming 'description' is also in formData
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock),
        category_id: parseInt(formData.category_id),
        subcategory_id: parseInt(formData.subcategory_id) ,
        image_Main_path : formData.image_Main_path,
            total_purchases : 0,
        monthly_purchases : 0
        
      };

        // Add any other fields from formData that your product table expects
        try {
          console.log(newProductData)
        const response = await fetch(`${apiBaseUrl}/api/admin/edit/${selectedItem.id}`, {
            method: 'PUT', // Use PUT for updating an existing resource
            headers: {
                'Content-Type': 'application/json',
                // Add any authorization headers here if required (e.g., 'Authorization': `Bearer ${token}`)
            },
            body: JSON.stringify(newProductData), // Send the prepared data as JSON
        });

        if (!response.ok) {
            // If the server response is not OK (e.g., 400, 500 status)
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to update product on server.');
        }

        // const result = await response.json();
        // console.log('Product update successful:', result);

        // If the API call is successful, then update the local state.
        // This ensures your UI reflects what's now in the database.
        // setProducts(products.map(p =>
        //     p.id === selectedItem.id
        //         ? {
        //             ...p, // Keep existing product properties
        //             ...newProductData// Apply the newly updated data
        //         }
        //         : p
        // ));

    } catch (error) {
        console.error('Error updating product:', error);
    }
  }
   else if (currentView === 'categories') {
                             const newCategoryData = {
        name: formData.name, // Assuming 'name' is also in formData
        description : formData.description,
        icon : formData.icon,
        id : selectedItem.id

      };
        setCategories(categories.map(c => 
          c.id === selectedItem.id ? { ...c, ...formData,
             name: formData.name, // Assuming 'name' is also in formData
        description : formData.description,
        icon : formData.icon,
        id : parseInt(selectedItem.id)
} : c
        ));
         const response = await fetch(`${apiBaseUrl}/api/admin/edit/category/${selectedItem.id}`, {
            method: 'PUT', // Use PUT for updating an existing resource
            headers: {
                'Content-Type': 'application/json',
                // Add any authorization headers here if required (e.g., 'Authorization': `Bearer ${token}`)
            },
            body: JSON.stringify(newCategoryData), // Send the prepared data as JSON
        });
         if (!response.ok) {
            // If the server response is not OK (e.g., 400, 500 status)
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to update product on server.');
        }
      }else if(currentView == "subcategories"){
          const newSubcategoryData = {
        name: formData.name,
        icon : formData.icon,
        category_id : formData.category_id

      };
       setSubcategories(subcategories.map(s => 
          s.id === selectedItem.id ? { ...s, ...formData,
             name: formData.name, // Assuming 'name' is also in formData
        description : formData.description,
        icon : formData.icon,
        id : parseInt(selectedItem.id)
} : s
        ));
         const response = await fetch(`${apiBaseUrl}/api/admin/edit/subcategory/${selectedItem.id}`, {
            method: 'PUT', // Use PUT for updating an existing resource
            headers: {
                'Content-Type': 'application/json',
                // Add any authorization headers here if required (e.g., 'Authorization': `Bearer ${token}`)
            },
            body: JSON.stringify(newSubcategoryData), // Send the prepared data as JSON
        });
         if (!response.ok) {
            // If the server response is not OK (e.g., 400, 500 status)
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to update product on server.');
        }
      }
      } 
         closeModal();
    }
   
 
  const handleDelete = () => {
    if (currentView === 'products') {
      setProducts(products.filter(p => p.id !== selectedItem.id));
          DeleteProduct(selectedItem.id);
    } else if (currentView === 'categories') {
      setCategories(categories.filter(c => c.id !== selectedItem.id));
      DeleteCategory(selectedItem.id);
    }else if (currentView === 'subcategories') {
      setSubcategories(subcategories.filter(s => s.id !== selectedItem.id));
      DeleteSubcategory(selectedItem.id);
    }
    closeModal();
  };

  // Navigation Menu
  const navigationItems = [
    { id: 'dashboard', name: 'แดชบอร์ด', icon: BarChart3 },
    { id: 'products', name: 'จัดการสินค้า', icon: Package },
    { id: 'categories', name: 'หมวดหมู่หลัก', icon: Grid3X3 },
    { id: 'subcategories', name: 'หมวดหมู่ย่อย', icon: List },
    {id : 'works',name:'จัดการผลงาน',icon : Award}
  ];

  const Sidebar = () => (
    <div className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-gray-900/95 backdrop-blur-sm border-r border-gray-700 transform transition-transform duration-300 ${showMobileMenu ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
      <div className="flex items-center justify-between p-6 border-b border-gray-700">
        <h1 className="text-xl font-bold text-white">Admin Panel</h1>
        <button 
          onClick={() => setShowMobileMenu(false)}
          className="lg:hidden text-gray-400 hover:text-white"
        >
          <X size={20} />
        </button>
      </div>
      
      <nav className="mt-6">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => {
                setCurrentView(item.id);
                setShowMobileMenu(false);
              }}
              className={`w-full flex items-center gap-3 px-6 py-3 text-left transition-colors ${
                currentView === item.id 
                  ? 'bg-blue-600/20 border-r-2 border-blue-500 text-blue-400' 
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <Icon size={18} />
              {item.name}
            </button>
          );
        })}
      </nav>

      <div className="absolute bottom-6 left-6 right-6">
        <button className="w-full flex items-center gap-3 px-4 py-3 text-gray-300 hover:bg-gray-800 hover:text-white rounded-lg transition-colors">
          <LogOut size={18} />
          ออกจากระบบ
        </button>
      </div>
    </div>
  );

  const TopBar = () => (
    <div className="bg-gray-900/70 backdrop-blur-sm border-b border-gray-700 px-4 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setShowMobileMenu(true)}
            className="lg:hidden text-gray-400 hover:text-white"
          >
            <Settings size={20} />
          </button>
          <h2 className="text-xl font-semibold text-white">
            {navigationItems.find(item => item.id === currentView)?.name}
          </h2>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 text-sm text-gray-400">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            ออนไลน์
          </div>
          <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
            A
          </div>
        </div>
      </div>
    </div>
  );

  const DashboardView = () => (
    <div className="p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Stats Cards */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">ยอดขายรวม</p>
              <p className="text-2xl font-bold">฿2,456,789</p>
            </div>
            <DollarSign size={32} className="text-blue-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">สินค้าทั้งหมด</p>
              <p className="text-2xl font-bold">{products.length}</p>
            </div>
            <Package size={32} className="text-green-200" />
          </div>
        </div>

        {/* <div className="bg-gradient-to-r from-orange-600 to-red-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm">คำสั่งซื้อใหม่</p>
              <p className="text-2xl font-bold">156</p>
            </div>
            <ShoppingCart size={32} className="text-orange-200" />
          </div>
        </div> */}

        <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">ลูกค้าใหม่</p>
              <p className="text-2xl font-bold">89</p>
            </div>
            <Users size={32} className="text-purple-200" />
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-4">การดำเนินการด่วน</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <button 
            onClick={() => {
              setCurrentView('products');
              handleModal('add');
            }}
            className="flex items-center gap-3 p-4 bg-blue-600/20 border border-blue-600/30 rounded-xl hover:bg-blue-600/30 transition-colors text-blue-400"
          >
            <Plus size={20} />
            เพิ่มสินค้าใหม่
          </button>
          
          <button 
            onClick={() => setCurrentView('categories')}
            className="flex items-center gap-3 p-4 bg-green-600/20 border border-green-600/30 rounded-xl hover:bg-green-600/30 transition-colors text-green-400"
          >
            <Grid3X3 size={20} />
            จัดการหมวดหมู่
          </button>
          
          <button className="flex items-center gap-3 p-4 bg-orange-600/20 border border-orange-600/30 rounded-xl hover:bg-orange-600/30 transition-colors text-orange-400">
            <BarChart3 size={20} />
            ดูรายงาน
          </button>
          
        </div>
      </div>
    </div>
  );

  const ProductsView = () => (
    <div className="p-6">
      {/* Search and Controls */}
      <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700 mb-6">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              autoFocus
              type="text"
              placeholder="ค้นหาสินค้า..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-white placeholder-gray-400"
            />
          </div>
          
          <div className="flex gap-2">
            <select
              value={selectedCategory}
              onChange={(e) => {setSelectedCategory(e.target.value);
                  setSelectedSubCategory("all"); // reset subcategory ทุกครั้งที่เปลี่ยนหมวดหลัก
              }}
              className="px-4 py-3 bg-gray-800 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            >
              <option value="all">ทุกหมวดหมู่</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                  
                </option>
              ))}
            </select>
            {selectedCategory !== "all" && (
    <select
      value={selectedSubcategory}
      onChange={(e) => setSelectedSubCategory(e.target.value)}
      className="px-4 py-3 bg-gray-800 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
    >
      <option value="all">ทุกหมวดย่อย</option>
      {filteredSubcategories.map((sub) => (
        <option key={sub.id} value={sub.id}>
          {sub.name}
        </option>
      ))}
    </select>
  )}
            <button
              onClick={() => setGridView(!gridView)}
              className="px-4 py-3 bg-gray-800 border border-gray-600 rounded-xl text-gray-300 hover:text-white transition-colors"
            >
              {gridView ? <List size={18} /> : <Grid3X3 size={18} />}
            </button>
            
            <button
              onClick={() => handleModal('add')}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all flex items-center gap-2"
            >
              <Plus size={18} />
              <span className="hidden sm:inline">เพิ่มสินค้า</span>
            </button>
          </div>
        </div>
      </div>

      {/* Products Grid/List */}
      {gridView ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => (
            <div key={product.id} className="bg-gray-900/50 backdrop-blur-sm rounded-2xl overflow-hidden border border-gray-700 hover:border-blue-500/50 transition-all group">
              <div className="relative">
              <div className="w-full h-48 bg-gray-800 flex items-center justify-center overflow-hidden">
  <div className="max-w-full max-h-full">
    <img 
      src={"https://cdn.toteja.co/" + product.image_Main_path} 
      alt={product.name} 
      className="w-full h-full object-contain" 
    />
  </div>
</div>
                
                <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleModal('edit', product)}
                    className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full transition-colors"
                  >
                    <Edit3 size={14} />
                  </button>
                  <button
                  onClick={() => {
  handleModal('delete', product);
}}
                    className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-full transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              
              <div className="p-4">
                <h3 className="font-semibold text-white mb-2 line-clamp-2">{product.name}</h3>
                <p className="text-gray-400 text-sm mb-3 line-clamp-2">{product.description}</p>
                
                <div className="flex items-center justify-between mb-3">
                  <span className="text-lg font-bold text-green-400">฿{formatPrice(product.price)}</span>
                  <span className="text-sm text-gray-500">คงเหลือ: {product.stock}</span>
                </div>
                
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>ขายแล้ว: {product.total_purchases}</span>
                  <span>{formatDate(product.created_at)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-800/50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">สินค้า</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">ราคา</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">คงเหลือ</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">ยอดขาย</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">วันที่เพิ่ม</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">จัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {products.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-800/30">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-12 h-12 bg-gray-800 rounded-lg flex items-center justify-center mr-4">
                          <ImageIcon size={16} className="text-gray-600" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-white">{product.name}</div>
                          <div className="text-sm text-gray-400">{product.description}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-green-400 font-semibold">
                      ฿{formatPrice(product.price)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {product.stock}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {product.total_purchases}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {formatDate(product.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleModal('edit', product)}
                          className="text-blue-400 hover:text-blue-300"
                        >
                          <Edit3 size={16} />
                        </button>
                        <button
                    
                                       onClick={() => {
  handleModal('delete', product);
}}
                          className="text-red-400 hover:text-red-300"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination */}
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
    </div>
  );

  const CategoriesView = () => (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">จัดการหมวดหมู่หลัก</h2>
        <button
          onClick={() => handleModal('add')}
          className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all flex items-center gap-2"
        >
          <Plus size={18} />
          เพิ่มหมวดหมู่
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((category) => (
          <div key={category.id} className="bg-gray-900/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700 hover:border-blue-500/50 transition-all group">
            <div className={`w-full h-32 bg-gradient-to-r ${category.gradient} rounded-xl flex items-center justify-center mb-4`}>
              <div className="text-white text-2xl font-bold">{category.name.charAt(0)}</div>
            </div>
            
            <h3 className="font-semibold text-white mb-2">{category.name}</h3>
            <p className="text-sm text-gray-400 mb-4">Icon: {category.icon}</p>
            
            <div className="flex gap-2">
              <button
                onClick={() => handleModal('edit', category)}
                className="flex-1 py-2 bg-blue-600/20 text-blue-400 rounded-lg hover:bg-blue-600/30 transition-colors flex items-center justify-center gap-2"
              >
                <Edit3 size={14} />
                แก้ไข
              </button>
              <button
                  onClick={() => handleModal('delete', category)}
                className="flex-1 py-2 bg-red-600/20 text-red-400 rounded-lg hover:bg-red-600/30 transition-colors flex items-center justify-center gap-2"
              >
                <Trash2 size={14} />
                ลบ
              </button>
            </div>
          </div>
        ))}
      </div>
      </div>
  )
   const SubcategoriesView = (  {categories,
  subcategories,
  handleModal}) => {
  const [selectedMainCategory, setSelectedMainCategory] = useState(''); // Empty string for "All Categories"

  // Filtered subcategories based on the selectedMainCategory
  const filteredSubcategories = selectedMainCategory
    ? subcategories.filter(sub =>  String(sub.category_id) === selectedMainCategory)
    : subcategories; // If no category selected, show all

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">จัดการหมวดหมู่ย่อย</h2>
        <button
          onClick={() => handleModal('add')}
          className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all flex items-center gap-2"
        >
          <Plus size={18} />
          เพิ่มหมวดหมู่ย่อย
        </button>
      </div>

      {/* --- Main Category Filter Dropdown --- */}
      <div className="mb-6 w-1/3"> {/* Adjust width as needed */}
        <label htmlFor="main-category-filter" className="block text-slate-300 text-sm font-medium mb-1">
          กรองตามหมวดหมู่หลัก:
        </label>
        <div className="relative">
          <select
            id="main-category-filter"
            value={selectedMainCategory}
            onChange={(e) => setSelectedMainCategory(e.target.value)}
            className="block appearance-none w-full px-4 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 pr-8"
          >
            <option value="">ทั้งหมด</option> {/* Option to show all subcategories */}
            {categories.map(category => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          <ChevronDown size={16} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 pointer-events-none" />
        </div>
      </div>
      {/* --- End of Main Category Filter --- */}


      <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-800/50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">ชื่อ</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">หมวดหมู่หลัก</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {/* Render filtered subcategories */}
              {filteredSubcategories.length > 0 ? (
                filteredSubcategories.map((subcategory) => (
                  <tr key={subcategory.id} className="hover:bg-gray-800/30">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-white">{subcategory.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {/* Find the main category name using category_id */}
                      {categories.find(c => c.id === subcategory.category_id)?.name || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleModal('edit', subcategory)}
                          className="text-blue-400 hover:text-blue-300"
                        >
                          <Edit3 size={16} />
                        </button>
                        <button
                          onClick={() => handleModal('delete', subcategory)}
                          className="text-red-400 hover:text-red-300"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" className="px-6 py-4 text-center text-gray-400">
                    ไม่พบหมวดหมู่ย่อยสำหรับหมวดหมู่หลักนี้
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

  const Modal = () => {
    if (!showModal) return null;

    const renderFormFields = () => {
      switch (currentView) {
        case 'products':
          return (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  
                  <label className="block text-sm font-medium text-gray-300 mb-1">ชื่อสินค้า</label>
                  <input
                    type="text"
                      ref={nameRef}
                    value={formData.name}
                     onFocus={() => setCurrentlyFocusedField('name')}
                    onChange={(e) => setFormData(prev => ({
  ...prev,
  name: e.target.value
}))}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-white"
                    placeholder="ชื่อสินค้า"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">ราคา</label>
                  <input
                  ref = {priceRef}
                    type="text"
                    value={formData.price}
                      onFocus={() => setCurrentlyFocusedField('price')}
                      onChange={(e) => setFormData(prev => ({
  ...prev,
  price: e.target.value
}))}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-white"
                    placeholder="ราคา"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">คำอธิบาย</label>
                <textarea
                           onFocus={() => setCurrentlyFocusedField('description')}
                  ref={descriptionRef}
                  value={formData.description}
                   onChange={(e) => setFormData(prev => ({
  ...prev,
  description: e.target.value
}))}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-white"
                  placeholder="คำอธิบายสินค้า"
                  rows={3}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">หมวดหมู่หลัก</label>
                  <select
                    value={formData.category_id}
               onChange={(e) => setFormData(prev => ({
  ...prev,
  category_id: e.target.value
}))}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-white"
                  >
                    <option value="">เลือกหมวดหมู่</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>{category.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">หมวดหมู่ย่อย</label>
                  <select
                    value={formData.subcategory_id}
                  onChange={(e) => setFormData(prev => ({
  ...prev,
  subcategory_id: e.target.value
}))}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-white"
                  >
                    <option value="">เลือกหมวดหมู่ย่อย</option>
                    {subcategories
                      .filter(sub => sub.category_id == formData.category_id)
                      .map((subcategory) => (
                        <option key={subcategory.id} value={subcategory.id}>{subcategory.name}</option>
                      ))}
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">จำนวนสต็อก</label>
                  <input
                        onFocus={() => setCurrentlyFocusedField('stock')}
                    type="text"
                    ref = {stockRef}
                    value={formData.stock}
                    onChange={(e) => setFormData(prev => ({
  ...prev,
  stock: e.target.value
}))}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-white"
                    placeholder="จำนวนสต็อก"
                  />
                </div>
                <div className="mt-2">
      {modalType !== 'add' && ( // Added conditional rendering here
                  <div className="mt-4">
                    <button
                      type="button"
                      onClick={() => {
                        // เก็บข้อมูลแบบฟอร์มชั่วคราวก่อนไปหน้าจัดการรูปภาพ
                        // localStorage.setItem('productFormDraft', JSON.stringify(formData));
                        navigateToProductsImage(formData.id);
                      }}
                      className="mt-2 w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl flex items-center justify-center gap-2"
                    > 
                      <ImageIcon size={16} />
                      จัดการรูปภาพสินค้า
                    </button>
                  </div>
                )}
        
      </div>
              </div>
              
              <div>
                {/* <label className="block text-sm font-medium text-gray-300 mb-1">รูปภาพหลัก</label> */}
                {/* <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={formData.image_Sub_path}
                    onChange={(e) => setFormData({...formData, image_Sub_path: e.target.value})}
                    className="flex-1 px-4 py-3 bg-gray-800 border border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-white"
                    placeholder="URL รูปภาพ"
                  />
                  <button className="px-4 py-3 bg-gray-700 hover:bg-gray-600 rounded-xl text-gray-300">
                    <Upload size={16} />
                  </button>
                </div> */}

              </div>
            </>
          );
        case 'categories':
          return (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">ชื่อหมวดหมู่</label>
                <input
                 onFocus={() => setCurrentlyFocusedField('name')}
                  ref={nameRef}
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({
  ...prev,
  name: e.target.value
}))}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-white"
                  placeholder="ชื่อหมวดหมู่"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">ไอคอน</label>
                <input
                 onFocus={() => setCurrentlyFocusedField('icon')}
                  ref = {iconRef}
                  type="text"
                  value={formData.icon}
                 onChange={(e) => setFormData(prev => ({
  ...prev,
  icon: e.target.value
}))}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-white"
                  placeholder="ชื่อไอคอน (เช่น 'Monitor')"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">คำอธิบาย</label>
                <div className="flex items-center gap-2">
                  <input
                   onFocus={() => setCurrentlyFocusedField('description')}
                   ref = {descriptionRef}
                    type="text"
                    value={formData.description}
                     onChange={(e) => setFormData(prev => ({
  ...prev,
  description: e.target.value
}))}
                    className="flex-1 px-4 py-3 bg-gray-800 border border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-white"
                    placeholder="คำอธิบาย"
                  />
                  {/* <button className="px-4 py-3 bg-gray-700 hover:bg-gray-600 rounded-xl text-gray-300">
                   
                    <Upload size={16} />
                  </button> */}
                </div>
              </div>
            </>
          );
        case 'subcategories':
          return (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">ชื่อหมวดหมู่ย่อย</label>
                <input
                  onFocus={() => setCurrentlyFocusedField('name')}
                  ref={nameRef}
                  type="text"
                  value={formData.name}
                 onChange={(e) => setFormData(prev => ({
  ...prev,
  name: e.target.value
}))}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-white"
                  placeholder="ชื่อหมวดหมู่ย่อย"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">หมวดหมู่หลัก</label>
                <select
                  value={formData.category_id}
                 onChange={(e) => setFormData(prev => ({
  ...prev,
  category_id: e.target.value
}))}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-white"
                >
                  <option value="">เลือกหมวดหมู่หลัก</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>{category.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">ไอคอน</label>
                <input
                  onFocus={() => setCurrentlyFocusedField('icon')}
                  ref = {iconRef}
                  type="text"
                  value={formData.icon}
                   onChange={(e) => setFormData(prev => ({
  ...prev,
  icon: e.target.value
}))}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-white"
                  placeholder="ชื่อไอคอน (เช่น 'Smartphone')"
                />
              </div>
            </>
          );
        default:
          return null;
      }
    };

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
        <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-md mx-4">
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-white">
                {modalType === 'add' && 'เพิ่ม'}
                {modalType === 'edit' && 'แก้ไข'}
                {modalType === 'delete' && 'ลบ'}
                {' '}
                {currentView === 'products' && 'สินค้า'}
                {currentView === 'categories' && 'หมวดหมู่หลัก'}
                {currentView === 'subcategories' && 'หมวดหมู่ย่อย'}
              </h3>
              <button onClick={closeModal} className="text-gray-400 hover:text-white">
                <X size={20} />
              </button>
            </div>
            
            {modalType !== 'delete' ? (
              <form onSubmit={handleFormSubmit}>
                <div className="space-y-4 mb-6">
                  {renderFormFields()}
                </div>
                
                <div className="flex gap-3">
                  <button
                    type="submit"
                    className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all flex items-center justify-center gap-2"
                  >
                    <Save size={16} />
                    บันทึก
                  </button>
                  <button
                    type="button"
                    onClick={closeModal}
                    className="flex-1 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-xl transition-colors"
                  >
                    ยกเลิก
                  </button>
                </div>
              </form>
            ) : (
              <div>
                <p className="text-gray-300 mb-6">คุณแน่ใจหรือไม่ว่าต้องการลบรายการนี้?</p>
                <div className="flex gap-3">
                  <button
                    onClick={handleDelete}
                    className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl transition-colors flex items-center justify-center gap-2"
                  >
                    <Trash2 size={16} />
                    ลบ
                  </button>
                  <button
                    onClick={closeModal}
                    className="flex-1 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-xl transition-colors"
                  >
                    ยกเลิก
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };
  
  // Main render
  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 flex">
      <Sidebar />
      
      <div className="flex-1 flex flex-col lg:ml-64">
        <TopBar />
        
        <main className="flex-1 overflow-y-auto">
          {currentView === 'dashboard' && <DashboardView />}
          {currentView === 'products' && <ProductsView />}
          {currentView === 'categories' && <CategoriesView />}
          {currentView === 'subcategories' && <SubcategoriesView    categories={categories} // Pass categories as a prop
        subcategories={subcategories} // Pass subcategories as a prop
        handleModal={handleModal}/>}
          {currentView === 'works' && <Adminworks/>}
        </main>
      </div>
      
      <Modal />
    </div>
  );
};
export default AdminDashboard;

