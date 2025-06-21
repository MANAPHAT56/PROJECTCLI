import React, { useState, useEffect } from 'react';
import { MessageCircle, Phone, Mail, Search, ChevronRight } from 'lucide-react';

// CSS Styles as a separate object (simulating external CSS file)
const styles = `
  .shop-container {
    min-height: 100vh;
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  }

  /* Contact Section Styles */
  .contact-section {
    background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
    padding: 3rem 1rem;
    position: relative;
    overflow: hidden;
    margin-top: 3rem;
  }

  .contact-section::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: radial-gradient(circle at 30% 40%, rgba(59, 130, 246, 0.1) 0%, transparent 50%);
    pointer-events: none;
  }

  .contact-container {
    max-width: 1200px;
    margin: 0 auto;
    position: relative;
    z-index: 1;
  }

  .contact-title {
    text-align: center;
    font-size: 2.5rem;
    font-weight: 800;
    color: white;
    margin-bottom: 3rem;
    background: linear-gradient(135deg, #ffffff 0%, #e2e8f0 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .contact-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 2rem;
  }

  .contact-card {
    background: rgba(255, 255, 255, 0.05);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 1.5rem;
    padding: 2rem;
    text-align: center;
    cursor: pointer;
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
    overflow: hidden;
  }

  .contact-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
    transition: left 0.6s ease;
  }

  .contact-card:hover::before {
    left: 100%;
  }

  .contact-card:hover {
    transform: translateY(-8px) scale(1.02);
    box-shadow: 0 25px 50px rgba(59, 130, 246, 0.25);
    border-color: rgba(59, 130, 246, 0.3);
    background: rgba(59, 130, 246, 0.1);
  }

  .contact-icon {
    width: 80px;
    height: 80px;
    margin: 0 auto 1.5rem;
    background: linear-gradient(135deg, #3b82f6, #1d4ed8);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 2rem;
    transition: all 0.4s ease;
    box-shadow: 0 10px 30px rgba(59, 130, 246, 0.3);
  }

  .contact-card:hover .contact-icon {
    transform: scale(1.15) rotate(5deg);
    box-shadow: 0 15px 40px rgba(59, 130, 246, 0.4);
  }

  .contact-method {
    font-size: 1.5rem;
    font-weight: 700;
    color: white;
    margin-bottom: 0.5rem;
  }

  .contact-info {
    color: #cbd5e1;
    margin-bottom: 1.5rem;
    font-size: 1.1rem;
  }

  .contact-action {
    color: #60a5fa;
    font-size: 1rem;
    font-weight: 600;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    transition: all 0.3s ease;
  }

  .contact-card:hover .contact-action {
    color: #93c5fd;
    transform: translateX(5px);
  }

  /* Products Section Styles */
  .products-section {
    background: linear-gradient(to bottom, #f8fafc, #e2e8f0);
    padding: 4rem 1rem;
    position: relative;
  }

  .products-container {
    max-width: 1200px;
    margin: 0 auto;
  }

  .section-title {
    text-align: center;
    font-size: 2.5rem;
    font-weight: 800;
    color: #1e293b;
    margin-bottom: 3rem;
    position: relative;
  }

  .section-title::after {
    content: '';
    position: absolute;
    bottom: -10px;
    left: 50%;
    transform: translateX(-50%);
    width: 80px;
    height: 4px;
    background: linear-gradient(135deg, #3b82f6, #1d4ed8);
    border-radius: 2px;
  }

  .products-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 2rem;
    margin-bottom: 3rem;
  }

  .product-card {
    background: white;
    border-radius: 1.5rem;
    overflow: hidden;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    border: 1px solid #f1f5f9;
    position: relative;
  }

  .product-card:hover {
    transform: translateY(-10px);
    box-shadow: 0 25px 50px rgba(0, 0, 0, 0.15);
    border-color: #3b82f6;
  }

  .product-image {
    position: relative;
    overflow: hidden;
    height: 220px;
    background: #f8fafc;
  }

  .product-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.6s ease;
  }

  .product-card:hover .product-image img {
    transform: scale(1.1);
  }

  .product-badge {
    position: absolute;
    top: 1rem;
    right: 1rem;
    background: linear-gradient(135deg, #ef4444, #dc2626);
    color: white;
    padding: 0.5rem 1rem;
    border-radius: 2rem;
    font-size: 0.8rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    box-shadow: 0 4px 15px rgba(239, 68, 68, 0.3);
  }

  .product-overlay {
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, rgba(59, 130, 246, 0.9), rgba(29, 78, 216, 0.9));
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: all 0.4s ease;
    backdrop-filter: blur(2px);
  }

  .product-card:hover .product-overlay {
    opacity: 1;
  }

  .product-overlay-btn {
    background: white;
    color: #1e293b;
    border: none;
    padding: 1rem 1.5rem;
    border-radius: 2rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    transform: translateY(20px);
  }

  .product-card:hover .product-overlay-btn {
    transform: translateY(0);
  }

  .product-overlay-btn:hover {
    transform: scale(1.05);
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
  }

  .product-info {
    padding: 1.5rem;
  }

  .product-category {
    color: #3b82f6;
    font-size: 0.8rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    margin-bottom: 0.5rem;
  }

  .product-name {
    font-size: 1.2rem;
    font-weight: 700;
    color: #1e293b;
    margin-bottom: 1rem;
    line-height: 1.4;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .product-price {
    font-size: 1.8rem;
    font-weight: 800;
    color: #3b82f6;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .show-more-btn {
    display: block;
    margin: 0 auto;
    background: linear-gradient(135deg, #3b82f6, #1d4ed8);
    color: white;
    border: none;
    padding: 1.2rem 3rem;
    border-radius: 3rem;
    font-size: 1.1rem;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.4s ease;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    box-shadow: 0 10px 30px rgba(59, 130, 246, 0.3);
  }

  .show-more-btn:hover {
    transform: translateY(-3px) scale(1.05);
    box-shadow: 0 20px 40px rgba(59, 130, 246, 0.4);
  }

  /* Categories Section Styles */
  .categories-section {
    background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
    padding: 4rem 1rem;
    position: relative;
    overflow: hidden;
  }

  .categories-section::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: radial-gradient(circle at 70% 60%, rgba(59, 130, 246, 0.1) 0%, transparent 50%);
    pointer-events: none;
  }

  .categories-container {
    max-width: 1200px;
    margin: 0 auto;
    position: relative;
    z-index: 1;
  }

  .categories-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1.5rem;
  }

  .category-card {
    background: rgba(255, 255, 255, 0.05);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 1.5rem;
    padding: 2rem 1rem;
    text-align: center;
    cursor: pointer;
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
    overflow: hidden;
  }

  .category-card:hover {
    transform: translateY(-8px) scale(1.05);
    box-shadow: 0 25px 50px rgba(59, 130, 246, 0.25);
    background: rgba(59, 130, 246, 0.1);
    border-color: rgba(59, 130, 246, 0.3);
  }

  .category-icon {
    font-size: 3.5rem;
    margin-bottom: 1rem;
    transition: all 0.4s ease;
    display: block;
  }

  .category-card:hover .category-icon {
    transform: scale(1.2) rotate(5deg);
  }

  .category-name {
    font-weight: 700;
    color: white;
    margin-bottom: 0.5rem;
    font-size: 1rem;
    transition: color 0.3s ease;
  }

  .category-card:hover .category-name {
    color: #93c5fd;
  }

  .category-count {
    color: rgba(255, 255, 255, 0.7);
    font-size: 0.9rem;
    font-weight: 500;
  }

  /* Mobile Responsive Styles */
  @media (max-width: 768px) {
    .contact-section {
      padding: 2rem 0.5rem;
    }

    .contact-title {
      font-size: 1.8rem;
      margin-bottom: 2rem;
    }

    .contact-grid {
      grid-template-columns: 1fr;
      gap: 1rem;
    }

    .contact-card {
      padding: 1.5rem;
    }

    .contact-icon {
      width: 60px;
      height: 60px;
      font-size: 1.5rem;
    }

    .contact-method {
      font-size: 1.2rem;
    }

    .contact-info {
      font-size: 1rem;
    }

    .products-section {
      padding: 2.5rem 0.5rem;
    }

    .section-title {
      font-size: 1.8rem;
      margin-bottom: 2rem;
    }

    .products-grid {
      grid-template-columns: repeat(2, 1fr);
      gap: 1rem;
    }

    .product-card {
      border-radius: 1rem;
    }

    .product-image {
      height: 160px;
    }

    .product-info {
      padding: 1rem;
    }

    .product-name {
      font-size: 1rem;
    }

    .product-price {
      font-size: 1.4rem;
    }

    .show-more-btn {
      padding: 1rem 2rem;
      font-size: 1rem;
    }

    .categories-section {
      padding: 2.5rem 0.5rem;
    }

    .categories-grid {
      grid-template-columns: repeat(2, 1fr);
      gap: 1rem;
    }

    .category-card {
      padding: 1.5rem 1rem;
    }

    .category-icon {
      font-size: 2.5rem;
    }

    .category-name {
      font-size: 0.9rem;
    }

    .category-count {
      font-size: 0.8rem;
    }
  }

  @media (max-width: 480px) {
    .contact-title {
      font-size: 1.5rem;
    }

    .section-title {
      font-size: 1.5rem;
    }

    .products-grid {
      grid-template-columns: 1fr;
    }

    .product-image {
      height: 200px;
    }

    .categories-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  /* Animation Classes */
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

  .animate-fade-in {
    animation: fadeInUp 0.6s ease forwards;
  }

  .animate-delay-1 {
    animation-delay: 0.1s;
  }

  .animate-delay-2 {
    animation-delay: 0.2s;
  }

  .animate-delay-3 {
    animation-delay: 0.3s;
  }

  .animate-delay-4 {
    animation-delay: 0.4s;
  }
`;

// Contact Section Component
const ContactSection = () => {
  const contactMethods = [
    {
      icon: <MessageCircle size={16} />,
      title: "Line",
      subtitle: "@yourshop",
      action: "เพิ่มเพื่อน"
    },
    {
      icon: <MessageCircle size={16} />,
      title: "Messenger", 
      subtitle: "m.me/yourshop",
      action: "ส่งข้อความ"
    },
    {
      icon: <Phone size={16} />,
      title: "โทรศัพท์",
      subtitle: "02-123-4567",
      action: "โทรเลย"
    },
    {
      icon: <Mail size={16} />,
      title: "อีเมล",
      subtitle: "info@yourshop.com", 
      action: "ส่งเมล"
    }
  ];

  return (
    <div className="contact-section">
      <div className="contact-container">
        <h2 className="contact-title">ติดต่อเราได้ที่</h2>
        <div className="contact-grid">
          {contactMethods.map((method, index) => (
            <div
              key={index}
              className={`contact-card animate-fade-in animate-delay-${index + 1}`}
            >
              <div className="contact-icon">
                {method.icon}
              </div>
              <h3 className="contact-method">{method.title}</h3>
              <p className="contact-info">{method.subtitle}</p>
              <div className="contact-action">
                <span>{method.action}</span>
                <ChevronRight size={10} />
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
  
  const products = [
    { id: 1, name: "สมาร์ทโฟน Galaxy S24", price: "29,990", image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=300&h=300&fit=crop", category: "มือถือ" },
    { id: 2, name: "แล็ปท็อป MacBook Air M2", price: "42,900", image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=300&h=300&fit=crop", category: "คอมพิวเตอร์" },
    { id: 3, name: "หูฟัง AirPods Pro", price: "8,900", image: "https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?w=300&h=300&fit=crop", category: "อุปกรณ์เสียง" },
    { id: 4, name: "นาฬิกา Apple Watch", price: "12,900", image: "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=300&h=300&fit=crop", category: "นาฬิกา" },
    { id: 5, name: "แท็บเล็ต iPad Air", price: "21,900", image: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=300&h=300&fit=crop", category: "แท็บเล็ต" },
    { id: 6, name: "กล้อง DSLR Canon", price: "35,900", image: "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=300&h=300&fit=crop", category: "กล้อง" },
    { id: 7, name: "เครื่องเล่นเกม PS5", price: "18,990", image: "https://images.unsplash.com/photo-1607853202273-797f1c22a38e?w=300&h=300&fit=crop", category: "เกม" },
    { id: 8, name: "ลำโพง JBL Charge", price: "4,990", image: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=300&h=300&fit=crop", category: "อุปกรณ์เสียง" }
  ];

  const displayedProducts = showAll ? products : products.slice(0, 4);

  return (
    <div className="products-section">
      <div className="products-container">
        <h2 className="section-title">สินค้ามาใหม่</h2>
        <div className="products-grid">
          {displayedProducts.map((product, index) => (
            <div
              key={product.id}
              className={`product-card animate-fade-in animate-delay-${(index % 4) + 1}`}
            >
              <div className="product-image">
                <img
                  src={product.image}
                  alt={product.name}
                  loading="lazy"
                />
                <div className="product-overlay">
                  <button className="product-overlay-btn">
                    <Search size={16} />
                    <span>ดูรายละเอียด</span>
                  </button>
                </div>
                <div className="product-badge">ใหม่</div>
              </div>
              <div className="product-info">
                <span className="product-category">{product.category}</span>
                <h3 className="product-name">{product.name}</h3>
                <div className="product-price">
                  <span>฿{product.price}</span>
                  <ChevronRight size={20} />
                </div>
              </div>
            </div>
          ))}
        </div>
        {!showAll && (
          <button
            onClick={() => setShowAll(true)}
            className="show-more-btn"
          >
            ดูสินค้าเพิ่มเติม
          </button>
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
    <div className="categories-section">
      <div className="categories-container">
        <h2 className="section-title" style={{color: 'white'}}>หมวดหมู่สินค้า</h2>
        <div className="categories-grid">
          {categories.map((category, index) => (
            <div
              key={index}
              className={`category-card animate-fade-in animate-delay-${(index % 4) + 1}`}
            >
              <div className="category-icon">{category.icon}</div>
              <h3 className="category-name">{category.name}</h3>
              <p className="category-count">{category.count} สินค้า</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Main App Component
const App = () => {
  useEffect(() => {
    // Inject styles
    const styleSheet = document.createElement("style");
    styleSheet.textContent = styles;
    document.head.appendChild(styleSheet);

    return () => {
      document.head.removeChild(styleSheet);
    };
  }, []);

  return (
    <div className="shop-container">
      <ContactSection />
      <NewProductsSection />
      <ProductCategoriesSection />
    </div>
  );
};

export default App;