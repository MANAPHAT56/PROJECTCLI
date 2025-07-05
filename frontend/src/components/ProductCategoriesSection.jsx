import React, { useState, useEffect } from 'react';
import { MessageCircle, Phone, Mail, Search, ChevronRight, Loader, ShoppingCart } from 'lucide-react'; // Import ShoppingCart
import { useNavigate } from 'react-router-dom';
import  Contact from './footer'
 const apiBaseUrl  = "http://localhost:5000";
// --- Skeleton Components ---

// Skeleton for a Product Card
const ProductCardSkeleton = ({ index }) => (
  <div
    className="bg-white rounded-lg md:rounded-2xl overflow-hidden shadow-md border border-slate-200 animate-pulse"
    style={{ animationDelay: `${index * 50}ms` }}
  >
    <div className="relative h-32 md:h-56 bg-gray-200">
      {/* Image placeholder */}
      <div className="absolute top-2 right-2 bg-gray-300 w-10 h-6 rounded-full"></div> {/* Badge placeholder */}
    </div>
    <div className="p-3 md:p-6">
      <div className="h-4 bg-gray-200 rounded w-1/3 mb-1 md:mb-2"></div> {/* Category placeholder */}
      <div className="h-5 bg-gray-200 rounded w-full mb-2 md:mb-4"></div> {/* Product name line 1 */}
      <div className="h-5 bg-gray-200 rounded w-3/4"></div> {/* Product name line 2 */}
      <div className="flex items-center justify-between mt-4">
        <div className="h-6 bg-gray-200 rounded w-1/4"></div> {/* Price placeholder */}
        <div className="w-8 h-8 bg-gray-200 rounded-full"></div> {/* Cart button placeholder */}
      </div>
    </div>
  </div>
);

// Skeleton for a Category Card
const CategoryCardSkeleton = ({ index }) => (
  <div
    className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-lg md:rounded-2xl p-3 md:p-8 text-center animate-pulse"
    style={{ animationDelay: `${index * 50}ms` }}
  >
    <div className="w-12 h-12 md:w-20 md:h-20 mx-auto mb-2 md:mb-4 bg-gray-700 rounded-full flex items-center justify-center"></div> {/* Icon placeholder */}
    <div className="h-4 bg-gray-700 rounded w-3/4 mx-auto mb-1 md:mb-2"></div> {/* Name placeholder */}
    <div className="h-3 bg-gray-700 rounded w-1/2 mx-auto"></div> {/* Count placeholder */}
  </div>
);

// --- Contact Section Component ---
const ContactSection = () => {
  const contactMethods = [
    {
      icon: <MessageCircle size={20} />,
      title: "Line",
      subtitle: "@yourshop",
      action: "เพิ่มเพื่อน",
      links: "https://line.me/ti/p/b3mjc54sSb"
    },
    {
      icon: <MessageCircle size={20} />,
      title: "Messenger",
      subtitle: "m.me/yourshop",
      action: "ส่งข้อความ",
      links: "https://m.me/manaphat97"
    },
    {
      icon: <Phone size={20} />,
      title: "โทรศัพท์",
      subtitle: "097-260-2016",
      action: "โทรเลย",
      links: "#"
    },
    {
      icon: <Mail size={20} />,
      title: "อีเมล",
      subtitle: "ttpho5874@gmail.com",
      action: "ส่งเมล",
      links: "#"
    }
  ];

  const [loading, setLoading] = useState(true); // Add loading state for ContactSection header

  useEffect(() => {
    // Simulate loading for the header, or tie it to a global loading state if data is fetched here
    const timer = setTimeout(() => {
      setLoading(false);
    }, 100); // Simulate some load time
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="bg-gradient-to-br from-blue-900 via-indigo-800 to-purple-700 py-12 md:py-16 px-4 relative overflow-hidden mt-12">
      {/* Background Decoration */}
      <div className="absolute inset-0 bg-gradient-radial from-blue-500/10 via-transparent to-transparent pointer-events-none"></div>

      <div className="max-w-6xl mx-auto relative z-10">
        {loading ? (
          <div className="text-center mb-8 md:mb-12 animate-pulse">
            <div className="h-10 md:h-12 bg-gray-700 rounded w-64 mx-auto"></div> {/* Title skeleton */}
          </div>
        ) : (
          <h2 className="text-center text-3xl md:text-4xl font-extrabold text-white mb-8 md:mb-12 bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
            ติดต่อเราได้ที่
          </h2>
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-8">
          {contactMethods.map((method, index) => (
            <a
              key={index}
              href={method.links}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl md:rounded-2xl p-4 md:p-8 text-center cursor-pointer transition-all duration-500 hover:transform hover:-translate-y-2 hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/25 hover:border-blue-500/30 hover:bg-blue-500/10 group relative overflow-hidden no-underline block"
            >
              {/* Shimmer */}
              <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>

              {/* Icon */}
              <div className="w-12 h-12 md:w-20 md:h-20 mx-auto mb-3 md:mb-6 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center text-white transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 shadow-lg shadow-blue-500/30">
                {method.icon}
              </div>

              <h3 className="text-sm md:text-xl font-bold text-white mb-1 md:mb-2">{method.title}</h3>
              <p className="text-slate-300 mb-3 md:mb-6 text-xs md:text-base">{method.subtitle}</p>
              <div className="text-yellow-400 text-xs md:text-sm font-semibold flex items-center justify-center gap-1 md:gap-2 transition-all duration-300 group-hover:text-blue-300 group-hover:translate-x-1">
                <span>{method.action}</span>
                <ChevronRight size={12} className="md:w-4 md:h-4" />
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
};

// --- New Products Section Component ---
const NewProductsSection = () => {
  const [showAll, setShowAll] = useState(false);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true); // Add loading state
  const navigate = useNavigate();

  const navigateToProduct = (productId) => {
    navigate(`/detailProducts/${productId}`);
  };

  useEffect(() => {
    setLoading(true); // Set loading to true when fetching starts
    fetch(`${apiBaseUrl}/api/store/newproductsHome`)
      .then(res => res.json())
      .then(data => setProducts(data))
      .catch(err => console.error('Error fetching new products:', err))
      .finally(() => {
        setTimeout(() => setLoading(false), 500); // Simulate network delay
      });
  }, []);

  const displayedProducts = showAll ? products : products.slice(0, 4);

  return (
    <div className="bg-gradient-to-b from-slate-50 to-slate-200 py-12 md:py-16 px-4">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-center text-2xl md:text-4xl font-extrabold text-slate-800 mb-8 md:mb-12 relative">
          {loading ? (
            <div className="h-8 bg-gray-300 rounded w-48 mx-auto animate-pulse"></div> // Skeleton for title
          ) : (
            <>
              สินค้ามาใหม่
              <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-16 md:w-20 h-1 bg-gradient-to-r from-blue-500 to-blue-700 rounded"></div>
            </>
          )}
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-8 mb-8 md:mb-12">
          {loading
            ? Array.from({ length: 4 }).map((_, index) => ( // Render 4 skeletons while loading
              <ProductCardSkeleton key={`new-product-skeleton-${index}`} index={index} />
            ))
            : displayedProducts.map((product, index) => (
              <div
                key={product.id}
                className="bg-white rounded-lg md:rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-500 border border-slate-200 hover:border-blue-500 group relative"
              >
                <div className="relative overflow-hidden h-32 md:h-56 bg-slate-100">
                  <img
                    src={product.image || 'https://via.placeholder.com/400x300/e2e8f0/ffffff?text=No+Image'} // Fallback for image
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    loading="lazy"
                  />

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
                      <button onClick={() => navigateToProduct(product.id)} className="p-1.5 rounded-full bg-emerald-100 text-emerald-600 hover:bg-emerald-200 transition-colors">
                                  <ShoppingCart size={14} /> 
                                </button>
                  </div>
                </div>
              </div>
            ))}
        </div>

        {!showAll && products.length > 4 && !loading && ( // Only show "ดูเพิ่มเติม" if there are more products and not loading
          <div className="text-center">
            <button
              onClick={() => setShowAll(true)}
              className="bg-gradient-to-r from-blue-500 to-blue-700 text-white px-6 py-3 md:px-12 md:py-4 rounded-full text-sm md:text-lg font-bold uppercase tracking-wide transition-all duration-500 hover:transform hover:-translate-y-1 hover:scale-105 shadow-lg hover:shadow-2xl hover:shadow-blue-500/40"
            >
              ดูสินค้าเพิ่มเติม
            </button>
          </div>
        )}
        {loading && ( // Skeleton for "Show More" button while loading
          <div className="text-center">
            <div className="h-12 bg-gray-300 rounded-full w-48 mx-auto animate-pulse"></div>
          </div>
        )}
      </div>
    </div>
  );
};

// --- Topseller Products Section Component ---
const TopsellerProductsSection = () => {
  const [showAll, setShowAll] = useState(false);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true); // Add loading state
  const navigate = useNavigate();
  const navigateToProduct = (productId) => {
    navigate(`/detailProducts/${productId}`);
  };

  useEffect(() => {
    setLoading(true); // Set loading to true when fetching starts
    fetch(`${apiBaseUrl}/api/store/topsellerHome`)
      .then(res => res.json())
      .then(data => setProducts(data))
      .catch(err => console.error('Error fetching top seller products:', err))
      .finally(() => {
        setTimeout(() => setLoading(false), 500); // Simulate network delay
      });
  }, []);

  const displayedProducts = showAll ? products : products.slice(0, 4);

  return (
    <div className="bg-gradient-to-b from-slate-50 to-slate-200 py-12 md:py-16 px-4">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-center text-2xl md:text-4xl font-extrabold text-slate-800 mb-8 md:mb-12 relative">
          {loading ? (
            <div className="h-8 bg-gray-300 rounded w-64 mx-auto animate-pulse"></div> // Skeleton for title
          ) : (
            <>
              สินค้ายอดขายสูงสุด
              <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-16 md:w-20 h-1 bg-gradient-to-r from-blue-500 to-blue-700 rounded"></div>
            </>
          )}
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-8 mb-8 md:mb-12">
          {loading
            ? Array.from({ length: 4 }).map((_, index) => ( // Render 4 skeletons while loading
              <ProductCardSkeleton key={`topseller-product-skeleton-${index}`} index={index} />
            ))
            : displayedProducts.map((product, index) => (
              <div
                key={product.id}
                className="bg-white rounded-lg md:rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-500 border border-slate-200 hover:border-blue-500 group relative"
              >
                <div className="relative overflow-hidden h-32 md:h-56 bg-slate-100">
                  <img
                    src={product.image || 'https://via.placeholder.com/400x300/e2e8f0/ffffff?text=No+Image'} // Fallback for image
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    loading="lazy"
                  />

                  {/* Badge */}
                  <div className="absolute top-2 right-2 bg-gradient-to-r from-amber-500 to-amber-600 text-white px-2 py-1 md:px-4 md:py-2 rounded-full text-xs font-bold uppercase tracking-wide shadow-lg">
                    ขายดี
                  </div>
                </div>

                <div className="p-3 md:p-6">
                  <span className="text-blue-600 text-xs font-bold uppercase tracking-wide mb-1 md:mb-2 block">{product.category}</span>
                  <h3 className="font-bold text-slate-800 mb-2 md:mb-4 text-sm md:text-xl line-clamp-2 leading-tight">
                    {product.name}
                  </h3>
                  <div className="flex items-center justify-between">
                    <span className="text-lg md:text-2xl font-extrabold text-blue-600">฿{product.price}</span>
                      <button onClick={() => navigateToProduct(product.id)} className="p-1.5 rounded-full bg-emerald-100 text-emerald-600 hover:bg-emerald-200 transition-colors">
                                  <ShoppingCart size={14} /> 
                                </button>
                  </div>
                </div>
              </div>
            ))}
        </div>

        {!showAll && products.length > 4 && !loading && (
          <div className="text-center">
            <button
              onClick={() => setShowAll(true)}
              className="bg-gradient-to-r from-blue-500 to-blue-700 text-white px-6 py-3 md:px-12 md:py-4 rounded-full text-sm md:text-lg font-bold uppercase tracking-wide transition-all duration-500 hover:transform hover:-translate-y-1 hover:scale-105 shadow-lg hover:shadow-2xl hover:shadow-blue-500/40"
            >
              ดูสินค้าเพิ่มเติม
            </button>
          </div>
        )}
        {loading && (
          <div className="text-center">
            <div className="h-12 bg-gray-300 rounded-full w-48 mx-auto animate-pulse"></div>
          </div>
        )}
      </div>
    </div>
  );
};

// --- Product Categories Section Component ---
const ProductCategoriesSection = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true); // Add loading state
  const navigate = useNavigate();

  const navigateTocategory = (categoryId) => {
    navigate(`/category/${categoryId}`);
  };

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setLoading(true); // Set loading to true when fetching starts
    fetch(`${apiBaseUrl}/api/store/Categorieshome`)
      .then(res => res.json())
      .then(data => setCategories(data))
      .catch(err => console.error('Error fetching categories:', err))
      .finally(() => {
        setTimeout(() => setLoading(false), 500); // Simulate network delay
      });
  }, []);

  return (
    <div className="bg-gradient-to-br from-blue-900 via-indigo-800 to-purple-700 py-12 md:py-16 px-4 relative overflow-hidden">
      {/* Background Decoration */}
      <div className="absolute inset-0 bg-gradient-radial from-blue-500/10 via-transparent to-transparent pointer-events-none"></div>

      <div className="max-w-6xl mx-auto relative z-10">
        <h2 className="text-center text-2xl md:text-4xl font-extrabold text-white mb-8 md:mb-12 bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
          {loading ? (
            <div className="h-8 bg-gray-300 rounded w-56 mx-auto animate-pulse"></div> // Skeleton for title
          ) : (
            "หมวดหมู่สินค้า"
          )}
        </h2>

        <div className="grid grid-cols-3 md:grid-cols-5 gap-2 md:gap-6">
          {loading
            ? Array.from({ length: 5 }).map((_, index) => ( // Render 5 skeletons while loading
              <CategoryCardSkeleton key={`category-skeleton-${index}`} index={index} />
            ))
            : categories.map((category, index) => (
              <div
                onClick={() => navigateTocategory(category.id)}
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
      <Contact/>
    </div>
  );
};

export default App;