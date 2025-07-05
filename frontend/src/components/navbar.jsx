import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronRight, Menu, X, Home, Package, ShoppingCart, Award, Users, FileText, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
  // ใช้สำหรับการนำทาง
const ModernNavbar = () => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [activeNestedDropdown, setActiveNestedDropdown] = useState(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const useNavigationItems = () => {
  const [categories, setCategories] = useState([]);
       const apiBaseUrl = 'http://localhost:5000';
  useEffect(() => {
    fetch(`${apiBaseUrl}/api/store/CategoryNav`) // URL นี้ให้เปลี่ยนตาม API ของคุณ
      .then((res) => res.json())
      .then((data) => setCategories(data))
      .catch((err) => console.error('Error fetching categories:', err));
  }, []);
  const navigationItem = [
    { name: 'หน้าแรก', to: '/', icon: Home },
    {
      name: 'สินค้า',
      to: '#',
      icon: Package,
      dropdown: [
        { name: 'สินค้าธรรมดา', to: '/categories-with-products' },
        {
          name: 'หมวดหมู่สินค้า',
          to: '#',
          hasNested: true,
          nested: categories.map((cat) => ({
            name: cat.name,
            to: `/category/${cat.id}`
          }))
        }
      ]
    },
    { name: 'ขั้นตอนการสั่งซื้อ', to: '/HowtoBuy', icon: ShoppingCart },
    { name: 'เกี่ยวกับเรา', to: '/Aboutus', icon: Users },
        { name: 'ผลงานเเละตัวอย่าง', to: '/works', icon: Award }
  ];
   return navigationItem;
};
const navigationItems=useNavigationItems();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
    setActiveDropdown(null);
    setActiveNestedDropdown(null);
  };

  const handleDropdownToggle = (index) => {
    setActiveDropdown(activeDropdown === index ? null : index);
    setActiveNestedDropdown(null);
  };

  const handleNestedDropdownToggle = (index) => {
    setActiveNestedDropdown(activeNestedDropdown === index ? null : index);
  };

  const handleNavClick = (to) => {
    if (to !== '#') {
      // console.log('Navigate to:', to);
      // Navigate to page - replace with your routing logic
      navigate(to);
    }
    setIsMenuOpen(false);
    setActiveDropdown(null);
    setActiveNestedDropdown(null);
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled 
        ? 'bg-slate-900/95 backdrop-blur-lg shadow-2xl border-b border-blue-500/20' 
        : 'bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0 group">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <span className="text-white font-bold text-lg">L</span>
              </div>
              <span className="text-white font-bold text-xl bg-gradient-to-r from-blue-400 to-blue-300 bg-clip-text text-transparent">
                โพธิ์ทอง
              </span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-1">
            {navigationItems.map((item, index) => (
              <div key={index} className="relative group">
                {item.dropdown ? (
                  <button
                    onClick={() => handleDropdownToggle(index)}
                    className="group flex items-center px-4 py-2 rounded-lg text-sm font-medium text-gray-300 hover:text-white hover:bg-blue-800/50 transition-all duration-300 transform hover:scale-105"
                  >
                    <item.icon className="w-4 h-4 mr-2 opacity-70 group-hover:opacity-100 transition-opacity" />
                    {item.name}
                    <ChevronDown
                      className={`w-4 h-4 ml-1 transition-transform duration-200 ${
                        activeDropdown === index ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                ) : (
                  <button
                    onClick={() => handleNavClick(item.to)}
                    className="flex items-center px-4 py-2 rounded-lg text-sm font-medium text-gray-300 hover:text-white hover:bg-blue-800/50 transition-all duration-300 transform hover:scale-105"
                  >
                    <item.icon className="w-4 h-4 mr-2 opacity-70 group-hover:opacity-100 transition-opacity" />
                    {item.name}
                  </button>
                )}

                {/* Desktop Dropdown Menu */}
                {item.dropdown && (
                  <div
                    className={`absolute top-full left-0 mt-2 w-64 bg-slate-800/95 backdrop-blur-lg rounded-xl shadow-2xl border border-blue-500/20 transform transition-all duration-300 ${
                      activeDropdown === index
                        ? 'opacity-100 translate-y-0 visible'
                        : 'opacity-0 -translate-y-2 invisible'
                    }`}
                  >
                    <div className="py-2">
                      {item.dropdown.map((dropdownItem, dropdownIndex) => (
                        <div key={dropdownIndex} className="relative">
                          {dropdownItem.hasNested ? (
                            <div className="group/nested">
                              <button
                                onClick={() => handleNestedDropdownToggle(dropdownIndex)}
                                className="w-full flex items-center justify-between px-4 py-3 text-sm text-gray-300 hover:text-white hover:bg-blue-700/50 transition-all duration-200 border-l-2 border-transparent hover:border-blue-400"
                              >
                                {dropdownItem.name}
                                <ChevronRight className="w-4 h-4" />
                              </button>
                              
                              {/* Nested Dropdown */}
                              <div
                                className={`absolute left-full top-0 ml-2 w-64 bg-slate-800/95 backdrop-blur-lg rounded-xl shadow-2xl border border-blue-500/20 transform transition-all duration-300 ${
                                  activeNestedDropdown === dropdownIndex
                                    ? 'opacity-100 translate-x-0 visible'
                                    : 'opacity-0 -translate-x-2 invisible'
                                }`}
                              >
                                <div className="py-2">
                                  {dropdownItem.nested.map((nestedItem, nestedIndex) => (
                                    <button
                                      key={nestedIndex}
                                      onClick={() => handleNavClick(nestedItem.to)}
                                      className="block w-full text-left px-4 py-3 text-sm text-gray-300 hover:text-white hover:bg-blue-700/50 transition-all duration-200 border-l-2 border-transparent hover:border-blue-400"
                                    >
                                      {nestedItem.name}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            </div>
                          ) : (
                            <button
                              onClick={() => handleNavClick(dropdownItem.to)}
                              className="block w-full text-left px-4 py-3 text-sm text-gray-300 hover:text-white hover:bg-blue-700/50 transition-all duration-200 border-l-2 border-transparent hover:border-blue-400"
                            >
                              {dropdownItem.name}
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Mobile menu button */}
          <div className="lg:hidden">
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-lg text-gray-300 hover:text-white hover:bg-blue-800/50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300"
            >
              {isMenuOpen ? (
                <X className="w-6 h-6 transform rotate-180 transition-transform duration-300" />
              ) : (
                <Menu className="w-6 h-6 transform transition-transform duration-300" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      <div className={`lg:hidden transition-all duration-300 ease-in-out ${
        isMenuOpen 
          ? 'max-h-screen opacity-100' 
          : 'max-h-0 opacity-0 overflow-hidden'
      }`}>
        <div className="px-2 pt-2 pb-3 space-y-1 bg-slate-900/98 backdrop-blur-lg border-t border-blue-500/20">
          {navigationItems.map((item, index) => (
            <div key={index}>
              {item.dropdown ? (
                <button
                  onClick={() => handleDropdownToggle(index)}
                  className="group w-full flex items-center px-4 py-3 rounded-lg text-base font-medium text-gray-300 hover:text-white hover:bg-blue-800/50 transition-all duration-300"
                >
                  <item.icon className="w-5 h-5 mr-3 opacity-70 group-hover:opacity-100 transition-opacity" />
                  {item.name}
                  <ChevronDown className={`w-4 h-4 ml-auto transition-transform duration-200 ${
                    activeDropdown === index ? 'rotate-180' : ''
                  }`} />
                </button>
              ) : (
                <button
                  onClick={() => handleNavClick(item.to)}
                  className="group w-full flex items-center px-4 py-3 rounded-lg text-base font-medium text-gray-300 hover:text-white hover:bg-blue-800/50 transition-all duration-300"
                >
                  <item.icon className="w-5 h-5 mr-3 opacity-70 group-hover:opacity-100 transition-opacity" />
                  {item.name}
                </button>
              )}

              {/* Mobile Dropdown */}
              {item.dropdown && (
                <div className={`ml-6 space-y-1 transition-all duration-300 ${
                  activeDropdown === index 
                    ? 'max-h-screen opacity-100' 
                    : 'max-h-0 opacity-0 overflow-hidden'
                }`}>
                  {item.dropdown.map((dropdownItem, dropdownIndex) => (
                    <div key={dropdownIndex}>
                      {dropdownItem.hasNested ? (
                        <div>
                          <button
                            onClick={() => handleNestedDropdownToggle(dropdownIndex)}
                            className="w-full flex items-center justify-between px-4 py-2 text-sm text-gray-400 hover:text-white hover:bg-blue-700/30 rounded-lg transition-all duration-200 border-l-2 border-blue-500/30 ml-4"
                          >
                            {dropdownItem.name}
                            <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${
                              activeNestedDropdown === dropdownIndex ? 'rotate-180' : ''
                            }`} />
                          </button>
                          
                          {/* Mobile Nested Dropdown */}
                          <div className={`ml-6 space-y-1 transition-all duration-300 ${
                            activeNestedDropdown === dropdownIndex 
                              ? 'max-h-screen opacity-100' 
                              : 'max-h-0 opacity-0 overflow-hidden'
                          }`}>
                            {dropdownItem.nested.map((nestedItem, nestedIndex) => (
                              <button
                                key={nestedIndex}
                                onClick={() => handleNavClick(nestedItem.to)}
                                className="block w-full text-left px-4 py-2 text-xs text-gray-500 hover:text-white hover:bg-blue-700/20 rounded-lg transition-all duration-200 border-l-2 border-blue-500/20 ml-6"
                              >
                                {nestedItem.name}
                              </button>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleNavClick(dropdownItem.to)}
                          className="block w-full text-left px-4 py-2 text-sm text-gray-400 hover:text-white hover:bg-blue-700/30 rounded-lg transition-all duration-200 border-l-2 border-blue-500/30 ml-4"
                        >
                          {dropdownItem.name}
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Animated border bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-50"></div>
    </nav>
  );
};

export default ModernNavbar;