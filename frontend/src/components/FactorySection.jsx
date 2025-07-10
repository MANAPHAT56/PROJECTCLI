import React, { useState, useEffect, useRef } from 'react';
import { Printer, Eye, Camera, Palette, Package, Warehouse } from 'lucide-react';

const FactoryAtmosphereSection = () => {
  const [visibleItems, setVisibleItems] = useState([]);
  const sectionRef = useRef(null);
  const itemRefs = useRef([]);

  const factoryZones = [
    {
      title: "เครื่องพิมพ์ออฟเซ็ท",
      desc: "เครื่องพิมพ์คุณภาพสูง",
      icon: <Printer className="w-6 h-6 sm:w-8 sm:h-8 text-white" />,
      image: "https://images.unsplash.com/photo-1586953208448-b95a79798f07?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
      gradient: "from-blue-600/30 to-cyan-600/30"
    },
    {
      title: "โซนออกแบบ",
      desc: "พื้นที่สร้างสรรค์งานศิลป์",
      icon: <Palette className="w-6 h-6 sm:w-8 sm:h-8 text-white" />,
      image: "https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
      gradient: "from-purple-600/30 to-pink-600/30"
    },
    {
      title: "โซนพิมพ์ดิจิตอล",
      desc: "พิมพ์รวดเร็ว ความละเอียดสูง",
      icon: <Camera className="w-6 h-6 sm:w-8 sm:h-8 text-white" />,
      image: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
      gradient: "from-green-600/30 to-teal-600/30"
    },
    {
      title: "โซนอิงค์เจ็ท",
      desc: "พิมพ์ขนาดใหญ่",
      icon: <Eye className="w-6 h-6 sm:w-8 sm:h-8 text-white" />,
      image: "https://images.unsplash.com/photo-1541746972996-4e0b0f93e586?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
      gradient: "from-orange-600/30 to-red-600/30"
    },
    {
      title: "โซนผลิตพรีเมี่ยม",
      desc: "สร้างสรรค์ของขวัญ",
      icon: <Package className="w-6 h-6 sm:w-8 sm:h-8 text-white" />,
      image: "https://images.unsplash.com/photo-1615484477778-ca3b77940c25?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
      gradient: "from-indigo-600/30 to-purple-600/30"
    },
    {
      title: "คลังสินค้า",
      desc: "จัดเก็บและจัดส่งสินค้า",
      icon: <Warehouse className="w-6 h-6 sm:w-8 sm:h-8 text-white" />,
      image: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
      gradient: "from-slate-600/30 to-gray-600/30"
    }
  ];

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = parseInt(entry.target.getAttribute('data-index'));
            const rowIndex = Math.floor(index / 2);
            
            // Animate items in the same row with a slight delay
            setTimeout(() => {
              setVisibleItems(prev => {
                if (!prev.includes(index)) {
                  return [...prev, index];
                }
                return prev;
              });
            }, (index % 2) * 200); // Stagger animation within the row
          }
        });
      },
      {
        threshold: 0.2,
        rootMargin: '50px'
      }
    );

    itemRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <section className="py-12 sm:py-20 overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header with enhanced animation */}
        {/* <div className="text-center mb-12 sm:mb-16">
          <h3 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 animate-fade-in-up">
            บรรยากาศภายในโรงงาน
          </h3>
          <div className="w-24 h-1 bg-gradient-to-r from-blue-400 to-cyan-400 mx-auto rounded-full animate-scale-in"></div>
          <p className="text-lg text-blue-200 mt-6 animate-fade-in-up-delay">
            สัมผัสบรรยากาศการผลิตที่ทันสมัยและมีคุณภาพ
          </p>
        </div> */}

        {/* Grid with enhanced animations */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8 lg:gap-10">
          {factoryZones.map((zone, index) => (
            <div
              key={index}
              ref={(el) => (itemRefs.current[index] = el)}
              data-index={index}
              className={`group relative backdrop-blur-sm bg-white/5 rounded-2xl lg:rounded-3xl overflow-hidden border border-white/10 hover:bg-white/10 transition-all duration-700 hover:transform hover:scale-[1.02] hover:shadow-2xl hover:shadow-blue-500/20 ${
                visibleItems.includes(index)
                  ? 'animate-float-in-up opacity-100'
                  : 'opacity-0 translate-y-12'
              }`}
              style={{
                transitionDelay: `${(index % 2) * 0.2}s`,
                animation: visibleItems.includes(index) 
                  ? `floatInUp 0.8s ease-out ${(index % 2) * 0.2}s both` 
                  : 'none'
              }}
            >
              {/* Image Section */}
              <div className="aspect-w-16 aspect-h-9 h-48 sm:h-56 lg:h-64 relative overflow-hidden">
                <img
                  src={zone.image}
                  alt={zone.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  loading="lazy"
                />
                
                {/* Gradient Overlay */}
                <div className={`absolute inset-0 bg-gradient-to-br ${zone.gradient} group-hover:from-blue-400/30 group-hover:to-cyan-400/30 transition-all duration-500`}></div>
                
                {/* Floating Icon */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center group-hover:scale-110 group-hover:rotate-12 transition-all duration-500 shadow-lg">
                    {zone.icon}
                  </div>
                </div>
                
                {/* Number Badge */}
                <div className="absolute top-3 right-3 w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full flex items-center justify-center text-white text-sm sm:text-base font-bold shadow-lg group-hover:scale-110 transition-transform duration-300">
                  {index + 1}
                </div>

                {/* Shimmer Effect */}
                <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
              </div>

              {/* Content Section */}
              <div className="p-4 sm:p-6 lg:p-8">
                <h4 className="text-lg sm:text-xl lg:text-2xl font-semibold text-white mb-2 group-hover:text-cyan-300 transition-colors duration-300">
                  {zone.title}
                </h4>
                <p className="text-sm sm:text-base lg:text-lg text-blue-200 group-hover:text-blue-100 transition-colors duration-300">
                  {zone.desc}
                </p>
                
                {/* Decorative Line */}
                <div className="w-0 group-hover:w-12 h-0.5 bg-gradient-to-r from-cyan-400 to-blue-400 mt-4 transition-all duration-500 rounded-full"></div>
              </div>

              {/* Hover Border Effect */}
              <div className="absolute inset-0 rounded-2xl lg:rounded-3xl border-2 border-transparent group-hover:border-cyan-400/50 transition-all duration-500"></div>
            </div>
          ))}
        </div>

        {/* Bottom Decoration */}
        <div className="mt-16 sm:mt-20 text-center">
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-white/5 backdrop-blur-sm rounded-full border border-white/10">
            <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
            <span className="text-blue-200 text-sm">กำลังผลิตด้วยเทคโนโลยีล่าสุด</span>
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes floatInUp {
          0% {
            opacity: 0;
            transform: translateY(60px) scale(0.95);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes fade-in-up {
          0% {
            opacity: 0;
            transform: translateY(30px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes scale-in {
          0% {
            transform: scaleX(0);
          }
          100% {
            transform: scaleX(1);
          }
        }

        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out;
        }

        .animate-fade-in-up-delay {
          animation: fade-in-up 0.8s ease-out 0.3s both;
        }

        .animate-scale-in {
          animation: scale-in 0.8s ease-out 0.5s both;
        }

        .animate-float-in-up {
          animation: floatInUp 0.8s ease-out both;
        }

        @media (max-width: 640px) {
          .grid {
            gap: 1rem;
          }
        }
      `}</style>
    </section>
  );
};

export default FactoryAtmosphereSection;