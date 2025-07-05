import React, { useState, useEffect } from 'react';
import { ChevronRight, ShoppingCart, Heart, Star, Eye, Plus, Loader } from 'lucide-react'; // Import Loader icon
import { useNavigate } from 'react-router-dom';
import Footer from './footer';

const ProductShowcase = () => {
  const navigate = useNavigate();
  const [visibleProducts, setVisibleProducts] = useState({});
  const [favorites, setFavorites] = useState(new Set());
  const [animatedCards, setAnimatedCards] = useState(new Set());
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true); // Add loading state
  const apiBaseUrl = "http://localhost:5000"
  useEffect(()  => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setLoading(true); // Set loading to true when fetching starts
    fetch(`${apiBaseUrl}/api/store/categories/`)
      .then(res => res.json())
      .then(data => {
        setCategories(data);
        const initial = {};
        // Ensure data is an array before iterating, or handle object iteration
        if (Array.isArray(data)) {
          data.forEach(category => {
            initial[category.name] = 4; // Assuming category.name is unique
          });
        } else if (typeof data === 'object' && data !== null) {
          // If categories is an object, iterate over its values
          Object.values(data).forEach(category => {
            initial[category.name] = 4;
          });
        }
        setVisibleProducts(initial);
      })
      .catch(err => {
        console.error('Error fetching categories:', err);
        setCategories([]); // Set to empty array on error
      })
      .finally(() => {
        // Add a small delay to show the skeleton effect
          setLoading(false); // Set loading to false after data is fetched
    // Adjust delay as needed
      });
  }, []);

  // Animate cards on load - now depends on loading state too
  useEffect(() => {
    if (!loading && Object.keys(categories).length > 0) {
      const timer = setTimeout(() => {
        const allProductIds = Object.values(categories).flatMap(cat =>
          (cat.products || []).slice(0, 4).map(p => p.id)
        );
        setAnimatedCards(new Set(allProductIds));
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [categories, loading]);

  const showMoreProducts = (categoryName) => {
    setVisibleProducts(prev => ({
      ...prev,
      [categoryName]: categories[categoryName].products.length
    }));

    // Animate new cards
    const newCards = categories[categoryName].products.slice(visibleProducts[categoryName]);
    setTimeout(() => {
      setAnimatedCards(prev => new Set([...prev, ...newCards.map(p => p.id)]));
    }, 50);
  };

  const toggleFavorite = (productId) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(productId)) {
        newFavorites.delete(productId);
      } else {
        newFavorites.add(productId);
      }
      return newFavorites;
    });
  };

  const navigateToCategory = (categoryId) => {
    console.log(categoryId);
    navigate(`/category/${categoryId}`);
  };

  const navigateToProduct = (productId) => {
    navigate(`/detailProducts/${productId}`);
  };

  // Skeleton Card Component
  const ProductSkeletonCard = ({ index }) => (
    <div
      className={`group product-card bg-white/80 backdrop-blur-sm rounded-2xl p-4 sm:p-6
        border border-sky-200/50 cursor-pointer
        animate-pulse`} // Add animate-pulse for shimmer effect
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div className="relative mb-3 sm:mb-4">
        <div className="mb-3 sm:mb-4 bg-gray-200 rounded-xl w-full h-32 sm:h-40"></div>
        <div className="absolute top-2 right-2 p-1.5 sm:p-2 rounded-full bg-gray-300 w-8 h-8"></div>
      </div>
      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      <div className="flex items-center justify-between mt-4">
        <div className="h-6 bg-gray-200 rounded w-1/4"></div>
        <div className="flex space-x-1 sm:space-x-2">
          <div className="p-1.5 sm:p-2 rounded-full bg-gray-300 w-8 h-8"></div>
        </div>
      </div>
    </div>
  );

  const ProductCard = ({ product, index }) => {
    const isAnimated = animatedCards.has(product.id);
    const isFavorite = favorites.has(product.id);

    return (
      <div
        className={`group product-card bg-white/80 backdrop-blur-sm rounded-2xl p-4 sm:p-6
          hover:bg-white/90 transition-all duration-500 hover:scale-105 hover:shadow-2xl
          border border-sky-200/50 hover:border-blue-400/50 cursor-pointer
          ${isAnimated ? 'animate-fade-in-up' : 'opacity-0'}`}
        style={{ animationDelay: `${index * 100}ms` }}
      >
        <div className="relative mb-3 sm:mb-4">
          <div className="mb-3 sm:mb-4 group-hover:scale-110 transition-transform duration-300 text-center">
            <img
              src={product.image || product.image_Main_path}
              alt={product.name}
              className="w-full h-32 sm:h-40 object-cover rounded-xl"
            />
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleFavorite(product.id);
            }}
            className={`absolute top-2 right-2 p-1.5 sm:p-2 rounded-full transition-all duration-300 backdrop-blur-sm
              ${isFavorite ? 'text-red-500 bg-red-100/80' : 'text-gray-400 hover:text-red-500 bg-white/80'}`}
          >
            <Heart size={16} fill={isFavorite ? 'currentColor' : 'none'} />
          </button>
        </div>

        <h3 className="text-sm sm:text-base lg:text-lg font-semibold text-slate-800 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
          {product.name}
        </h3>

        <div className="flex items-center justify-between">
          <span className="text-lg sm:text-xl lg:text-2xl font-bold text-sky-600">{product.price}</span>
          <div className="flex space-x-1 sm:space-x-2">
            <button onClick={() => navigateToProduct(product.id)} className="p-1.5 sm:p-2 rounded-full bg-green-100 text-green-600 hover:bg-green-200 transition-colors">
              <ShoppingCart size={14} />
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-blue-50 to-cyan-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-indigo-900 via-purple-800 to-blue-700 py-10">
        <div className="absolute inset-0 bg-black/20"></div>

        <div className="container mx-auto px-4 max-w-7xl relative z-10">
          <div className="mt-20 text-center animate-fade-in">
            <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">
              โพธิ์ทอง พริ้นติ้ง
            </h1>
            <p className="text-base md:text-lg text-slate-100 mb-6 max-w-2xl mx-auto">
              ค้นพบสินค้าคุณภาพดี ราคาดี จากทุกหมวดหมู่ในที่เดียว
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-4 text-sm">
              <div className="flex items-center text-amber-300">
                <Star className="text-amber-400 mr-1" size={16} fill="currentColor" />
                <span>รับสกรีนโลโก้ทุกรูปเเบบ</span>
              </div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 w-full h-8 bg-gradient-to-t from-indigo-800 to-transparent"></div>
      </div>

      {/* Products Section */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl py-16">
        {loading ? (
          // Skeleton Loader for categories and products
          Array.from({ length: 3 }).map((_, categoryIndex) => ( // Show 3 skeleton categories
            <div key={`skeleton-category-${categoryIndex}`} className="mb-20">
              {/* Category Header Skeleton */}
              <div className="flex items-center mb-12 animate-slide-in-left"
                style={{ animationDelay: `${categoryIndex * 200}ms` }}>
                <div className="text-4xl mr-4 p-4 rounded-2xl bg-gray-300 shadow-lg animate-pulse w-16 h-16"></div>
                <div>
                  <div className="h-6 bg-gray-300 rounded w-64 mb-2 animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded w-48 animate-pulse"></div>
                </div>
              </div>

              {/* Products Grid Skeleton */}
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 mb-8">
                {Array.from({ length: 4 }).map((_, productIndex) => (
                  <ProductSkeletonCard key={`skeleton-product-${categoryIndex}-${productIndex}`} index={productIndex} />
                ))}
              </div>

              {/* Show More Button Skeleton */}
              <div className="text-center mb-6">
                <div className="h-12 bg-gray-300 rounded-full w-48 mx-auto animate-pulse"></div>
              </div>

              {/* View All Category Button Skeleton */}
              <div className="text-center">
                <div className="h-12 bg-gray-300 rounded-full w-64 mx-auto animate-pulse"></div>
              </div>
            </div>
          ))
        ) : (
          // Actual Content
          Object.entries(categories).map(([categoryName, categoryData], categoryIndex) => (
            <div key={categoryData.name} className="mb-20">
              {/* Category Header */}
              <div className="flex items-center mb-12 animate-slide-in-left"
                style={{ animationDelay: `${categoryIndex * 200}ms` }}>
                <div className={`text-4xl mr-4 p-4 rounded-2xl bg-gradient-to-r ${categoryData.gradient} shadow-lg`}>
                  {categoryData.icon}
                </div>
                <div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-2">{categoryData.name}</h2>
                  <p className="text-slate-600">สินค้าคุณภาพดีที่คัดสรรมาแล้ว</p>
                </div>
              </div>

              {/* Products Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 mb-8">
                {(categoryData.products || []).slice(0, visibleProducts[categoryName] || 4).map((product, index) => (
                  <ProductCard key={product.id} product={product} index={index} />
                ))}
              </div>

              {/* Show More Button */}
              {visibleProducts[categoryName] < (categoryData.products || []).length && (
                <div className="text-center mb-6">
                  <button
                    onClick={() => showMoreProducts(categoryName)}
                    className="group inline-flex items-center px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-green-500 to-emerald-600
                      text-white font-semibold rounded-full hover:from-green-400 hover:to-emerald-500
                      transition-all duration-300 transform hover:scale-105 hover:shadow-xl text-sm sm:text-base"
                  >
                    <Plus size={20} className="mr-2 group-hover:rotate-180 transition-transform duration-300" />
                    ดูเพิ่มเติม
                    <ChevronRight size={20} className="ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                  </button>
                </div>
              )}

              {/* View All Category Button */}
              <div className="text-center">
                <button
                  onClick={() => navigateToCategory(categoryData.id)}
                  className="group inline-flex items-center px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-sky-500 to-blue-600
                    text-white font-semibold rounded-full hover:from-sky-400 hover:to-blue-500
                    transition-all duration-300 transform hover:scale-105 hover:shadow-xl text-sm sm:text-base"
                >
                  <Eye size={20} className="mr-2 group-hover:scale-110 transition-transform duration-300" />
                  ดูสินค้าทั้งหมดใน {categoryData.name}
                  <ChevronRight size={20} className="ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
      {/* Footer */}
      <Footer />
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

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-50px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .animate-fade-in-up {
          animation: fadeInUp 0.6s ease-out forwards;
        }

        .animate-fade-in {
          animation: fadeIn 1s ease-out;
        }

        .animate-slide-in-left {
          animation: slideInLeft 0.8s ease-out;
        }

        /* Add Tailwind's animate-pulse for shimmer effect */
        .animate-pulse {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: .5;
          }
        }

        .product-card {
          backdrop-filter: blur(10px);
        }

        .product-card:hover {
          box-shadow: 0 25px 50px -12px rgba(14, 165, 233, 0.3);
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

export default ProductShowcase;