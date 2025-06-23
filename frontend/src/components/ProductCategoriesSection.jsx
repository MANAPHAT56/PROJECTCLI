import React, { useState, useEffect } from 'react';
import { MessageCircle, Phone, Mail, Search, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
// Contact Section Component
const ContactSection = () => {
  const contactMethods = [
    {
      icon: <MessageCircle size={20} />,
      title: "Line",
      subtitle: "@yourshop",
      action: "เพิ่มเพื่อน"
    },
    {
      icon: <MessageCircle size={20} />,
      title: "Messenger", 
      subtitle: "m.me/yourshop",
      action: "ส่งข้อความ"
    },
    {
      icon: <Phone size={20} />,
      title: "โทรศัพท์",
      subtitle: "02-123-4567",
      action: "โทรเลย"
    },
    {
      icon: <Mail size={20} />,
      title: "อีเมล",
      subtitle: "info@yourshop.com", 
      action: "ส่งเมล"
    }
  ];
  return (
    <div className="bg-gradient-to-br from-blue-900 via-indigo-800 to-purple-700 py-12 md:py-16 px-4 relative overflow-hidden mt-12">
      {/* Background Decoration */}
      <div className="absolute inset-0 bg-gradient-radial from-blue-500/10 via-transparent to-transparent pointer-events-none"></div>
      
      <div className="max-w-6xl mx-auto relative z-10">
        <h2 className="text-center text-3xl md:text-4xl font-extrabold text-white mb-8 md:mb-12 bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
          ติดต่อเราได้ที่
        </h2> 
        
        {/* Mobile: 2 columns, Desktop: 4 columns */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-8">
          {contactMethods.map((method, index) => (
            <div
              key={index}
              className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl md:rounded-2xl p-4 md:p-8 text-center cursor-pointer transition-all duration-500 hover:transform hover:-translate-y-2 hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/25 hover:border-blue-500/30 hover:bg-blue-500/10 group relative overflow-hidden"
            >
              {/* Shimmer Effect */}
              <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
              
              {/* Icon - smaller on mobile */}
              <div className="w-12 h-12 md:w-20 md:h-20 mx-auto mb-3 md:mb-6 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center text-white transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 shadow-lg shadow-blue-500/30">
                {method.icon}
              </div>
              
              {/* Content - smaller text on mobile */}
              <h3 className="text-sm md:text-xl font-bold text-white mb-1 md:mb-2">{method.title}</h3>
              <p className="text-slate-300 mb-3 md:mb-6 text-xs md:text-base">{method.subtitle}</p>
              <div className="text-yellow-400 text-xs md:text-sm font-semibold flex items-center justify-center gap-1 md:gap-2 transition-all duration-300 group-hover:text-blue-300 group-hover:translate-x-1">
                <span>{method.action}</span>
                <ChevronRight size={12} className="md:w-4 md:h-4" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// New Products Section Component
const NewProductsSection = () => {
    const [showAll, setShowAll] = useState(false);
  const [products,setProducts] = useState([]);
  const navigate = useNavigate();
const navigateToProduct = (productId) =>{
    navigate(`/detailProducts/${productId}`);
  }
   useEffect(() => {
    fetch(`http://localhost:5000/api/store/newproductsHome`)
      .then(res => res.json())
      .then(data => setProducts(data))
      .catch(err => console.error('Error fetching categories:', err));
  }, []);
  
  const displayedProducts = showAll ? products : products.slice(0, 4);

  return (
    <div className="bg-gradient-to-b from-slate-50 to-slate-200 py-12 md:py-16 px-4">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-center text-2xl md:text-4xl font-extrabold text-slate-800 mb-8 md:mb-12 relative">
          สินค้ามาใหม่
          <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-16 md:w-20 h-1 bg-gradient-to-r from-blue-500 to-blue-700 rounded"></div>
        </h2>
        
        {/* Mobile: 2 columns, Desktop: 4 columns */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-8 mb-8 md:mb-12">
          {displayedProducts.map((product, index) => (
            <div
              key={product.id}
              className="bg-white rounded-lg md:rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-500 hover:transform hover:-translate-y-2 border border-slate-200 hover:border-blue-500 group"
            >
              <div className="relative overflow-hidden h-32 md:h-56 bg-slate-100">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  loading="lazy"
                />
                
                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600/90 to-blue-800/90 opacity-0 group-hover:opacity-100 transition-all duration-500 flex items-center justify-center backdrop-blur-sm">
                  <button onClick={()=>navigateToProduct(product.id)} className="bg-white text-slate-800 px-3 py-1.5 md:px-6 md:py-3 rounded-full font-semibold flex items-center gap-1 md:gap-2 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 hover:scale-105 shadow-lg text-xs md:text-base">
                    <Search size={12} className="md:w-4 md:h-4" />
                    <span className="hidden md:inline">ดูรายละเอียด</span>
                    <span className="md:hidden">ดู</span>
                  </button>
                </div>
                
                {/* Badge */}
                <div className="absolute top-2 right-2 bg-gradient-to-r from-red-500 to-red-600 text-white px-2 py-1 md:px-4 md:py-2 rounded-full text-xs font-bold uppercase tracking-wide shadow-lg">
                  ใหม่
                </div>
              </div>
              
              <div className="p-3 md:p-6">
                <span className="text-blue-600 text-xs font-bold uppercase tracking-wide mb-1 md:mb-2 block">{product.category}</span>
                <h3 className="font-bold text-slate-800 mb-2 md:mb-4 text-sm md:text-xl line-clamp-2 leading-tight">
                  {product.name}
                </h3>
                <div className="flex items-center justify-between">
                  <span className="text-lg md:text-2xl font-extrabold text-blue-600">฿{product.price}</span>
                  <ChevronRight size={16} className="md:w-5 md:h-5 text-slate-400" />
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {!showAll && (
          <div className="text-center">
            <button
              onClick={() => setShowAll(true)}
              className="bg-gradient-to-r from-blue-500 to-blue-700 text-white px-6 py-3 md:px-12 md:py-4 rounded-full text-sm md:text-lg font-bold uppercase tracking-wide transition-all duration-500 hover:transform hover:-translate-y-1 hover:scale-105 shadow-lg hover:shadow-2xl hover:shadow-blue-500/40"
            >
              ดูสินค้าเพิ่มเติม
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
const TopsellerProductsSection = () => {
    const [showAll, setShowAll] = useState(false);
  const [products,setProducts] = useState([]);
   const navigate = useNavigate();
const navigateToProduct = (productId) =>{
    navigate(`/detailProducts/${productId}`);
  }
   useEffect(() => {
    fetch(`http://localhost:5000/api/store/topsellerHome`)
      .then(res => res.json())
      .then(data => setProducts(data))
      .catch(err => console.error('Error fetching categories:', err));
  }, []);
  
  const displayedProducts = showAll ? products : products.slice(0, 4);

  return (
    <div className="bg-gradient-to-b from-slate-50 to-slate-200 py-12 md:py-16 px-4">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-center text-2xl md:text-4xl font-extrabold text-slate-800 mb-8 md:mb-12 relative">
          สินค้ายอดขายสูงสุด
          <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-16 md:w-20 h-1 bg-gradient-to-r from-blue-500 to-blue-700 rounded"></div>
        </h2>
        
        {/* Mobile: 2 columns, Desktop: 4 columns */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-8 mb-8 md:mb-12">
          {displayedProducts.map((product, index) => (
            <div
              key={product.id}
              className="bg-white rounded-lg md:rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-500 hover:transform hover:-translate-y-2 border border-slate-200 hover:border-blue-500 group"
            >
              <div className="relative overflow-hidden h-32 md:h-56 bg-slate-100">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  loading="lazy"
                />
                
                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600/90 to-blue-800/90 opacity-0 group-hover:opacity-100 transition-all duration-500 flex items-center justify-center backdrop-blur-sm">
                  <button   onClick={() => navigateToProduct(product.id)} className="bg-white text-slate-800 px-3 py-1.5 md:px-6 md:py-3 rounded-full font-semibold flex items-center gap-1 md:gap-2 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 hover:scale-105 shadow-lg text-xs md:text-base">
                    <Search size={12} className="md:w-4 md:h-4" />
                    <span className="hidden md:inline">ดูรายละเอียด</span>
                    <span className="md:hidden">ดู</span>
                  </button>
                </div>
                
                {/* Badge */}
                <div className="absolute top-2 right-2 bg-gradient-to-r from-red-500 to-red-600 text-white px-2 py-1 md:px-4 md:py-2 rounded-full text-xs font-bold uppercase tracking-wide shadow-lg">
                  ใหม่
                </div>
              </div>
              
              <div className="p-3 md:p-6">
                <span className="text-blue-600 text-xs font-bold uppercase tracking-wide mb-1 md:mb-2 block">{product.category}</span>
                <h3 className="font-bold text-slate-800 mb-2 md:mb-4 text-sm md:text-xl line-clamp-2 leading-tight">
                  {product.name}
                </h3>
                <div className="flex items-center justify-between">
                  <span className="text-lg md:text-2xl font-extrabold text-blue-600">฿{product.price}</span>
                  <ChevronRight size={16} className="md:w-5 md:h-5 text-slate-400" />
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {!showAll && (
          <div className="text-center">
            <button
              onClick={() => setShowAll(true)}
              className="bg-gradient-to-r from-blue-500 to-blue-700 text-white px-6 py-3 md:px-12 md:py-4 rounded-full text-sm md:text-lg font-bold uppercase tracking-wide transition-all duration-500 hover:transform hover:-translate-y-1 hover:scale-105 shadow-lg hover:shadow-2xl hover:shadow-blue-500/40"
            >
              ดูสินค้าเพิ่มเติม
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// Product Categories Section Component
const ProductCategoriesSection = () => {
  const categories = [
    { name: "มือถือ & แท็บเล็ต", icon: "📱", count: "245+" },
    { name: "คอมพิวเตอร์", icon: "💻", count: "189+" },
    { name: "อุปกรณ์เสียง", icon: "🎧", count: "156+" },
    { name: "กล้องถ่ายรูป", icon: "📷", count: "98+" },
    { name: "นาฬิกาอัจฉริยะ", icon: "⌚", count: "67+" },
    { name: "เครื่องใช้ไฟฟ้า", icon: "🔌", count: "234+" },
    { name: "เกมและของเล่น", icon: "🎮", count: "123+" },
    { name: "อุปกรณ์ฟิตเนส", icon: "💪", count: "87+" },
    { name: "รถยนต์ & จักรยาน", icon: "🚗", count: "76+" },
    { name: "แฟชั่น & เครื่องประดับ", icon: "👗", count: "345+" }
  ];

  return (
  <div className="bg-gradient-to-br from-blue-900 via-indigo-800 to-purple-700 py-12 md:py-16 px-4 relative overflow-hidden">

      {/* Background Decoration */}
      <div className="absolute inset-0 bg-gradient-radial from-blue-500/10 via-transparent to-transparent pointer-events-none"></div>
      
      <div className="max-w-6xl mx-auto relative z-10">
        <h2 className="text-center text-2xl md:text-4xl font-extrabold text-white mb-8 md:mb-12 bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
          หมวดหมู่สินค้า
        </h2>
        
        {/* Mobile: 3 columns, Desktop: 5 columns */}
        <div className="grid grid-cols-3 md:grid-cols-5 gap-2 md:gap-6">
          {categories.map((category, index) => (
            <div
              key={index}
              className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-lg md:rounded-2xl p-3 md:p-8 text-center cursor-pointer transition-all duration-500 hover:transform hover:-translate-y-2 hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/25 hover:bg-blue-500/10 hover:border-blue-500/30 group relative overflow-hidden"
            >
              {/* Icon - smaller on mobile */}
              <div className="text-2xl md:text-6xl mb-2 md:mb-4 transition-all duration-500 group-hover:scale-110 group-hover:rotate-3">
                {category.icon}
              </div>
              
              {/* Content - smaller text on mobile */}
              <h3 className="font-bold text-white mb-1 md:mb-2 text-xs md:text-base leading-tight transition-colors duration-300 group-hover:text-blue-300">
                {category.name}
              </h3>
              <p className="text-white/70 text-xs md:text-sm font-medium">
                {category.count} สินค้า
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Main App Component
const App = () => {
  return (
    <div className="min-h-screen font-sans">
      <ContactSection />
      <NewProductsSection />
      <TopsellerProductsSection />
      <ProductCategoriesSection />
    </div>
  );
};

export default App;