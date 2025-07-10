import React from 'react';

const FactoryGallery = () => {
  // Sample factory images - you can replace these with actual image URLs
  const factoryImages = [
    "https://cdn.toteja.co/imagesCli/1.webp",
    "https://cdn.toteja.co/imagesCli/2.webp",
    "https://cdn.toteja.co/imagesCli/3.webp",
    "https://cdn.toteja.co/imagesCli/4.webp",
    "https://cdn.toteja.co/imagesCli/5.webp",
    "https://cdn.toteja.co/imagesCli/6.webp",
    "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1567789884554-0b844b597180?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1565793298595-6a879b1d9492?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1567789884554-0b844b597180?w=400&h=300&fit=crop"
  ];

  return (
    <section className="py-12 sm:py-20 overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h3 className="text-2xl sm:text-3xl font-bold text-white text-center mb-8 sm:mb-12">
          บรรยากาศภายในโรงงาน
        </h3>
        
        {/* Desktop View - 4 images per row */}
        <div className="hidden lg:block relative">
          <div className="overflow-hidden">
            <div 
              className="flex gap-6 animate-scroll-left"
              style={{
                width: 'calc(400px * 24 + 120px)', // 24 images + gaps
                animation: 'scrollLeft 40s linear infinite'
              }}
            >
              {/* Double the images for seamless loop */}
              {[...factoryImages, ...factoryImages].map((image, index) => (
                <div
                  key={index}
                  className="flex-shrink-0 w-80 h-60 rounded-2xl overflow-hidden shadow-2xl hover:shadow-cyan-500/20 transition-all duration-500 hover:scale-105"
                >
                  <img
                    src={image}
                    alt={`Factory atmosphere ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tablet View - 3 images per row */}
        <div className="hidden md:block lg:hidden relative">
          <div className="overflow-hidden">
            <div 
              className="flex gap-4 animate-scroll-left"
              style={{
                width: 'calc(280px * 24 + 80px)',
                animation: 'scrollLeft 35s linear infinite'
              }}
            >
              {[...factoryImages, ...factoryImages].map((image, index) => (
                <div
                  key={index}
                  className="flex-shrink-0 w-64 h-48 rounded-xl overflow-hidden shadow-2xl hover:shadow-cyan-500/20 transition-all duration-500 hover:scale-105"
                >
                  <img
                    src={image}
                    alt={`Factory atmosphere ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Mobile View - 2 images per row */}
        <div className="block md:hidden relative">
          <div className="overflow-hidden">
            <div 
              className="flex gap-3 animate-scroll-left"
              style={{
                width: 'calc(200px * 24 + 60px)',
                animation: 'scrollLeft 30s linear infinite'
              }}
            >
              {[...factoryImages, ...factoryImages].map((image, index) => (
                <div
                  key={index}
                  className="flex-shrink-0 w-44 h-32 rounded-lg overflow-hidden shadow-2xl hover:shadow-cyan-500/20 transition-all duration-500"
                >
                  <img
                    src={image}
                    alt={`Factory atmosphere ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes scrollLeft {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        
        .animate-scroll-left {
          animation: scrollLeft linear infinite;
        }
        
        /* Pause animation on hover */
        .animate-scroll-left:hover {
          animation-play-state: paused;
        }
      `}</style>
    </section>
  );
};

export default FactoryGallery;