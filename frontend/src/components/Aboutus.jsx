import React from 'react';
import { Building, Award, Users, Printer, Palette, Globe } from 'lucide-react';

export default function PhothongPrintingWebsite() {
   window.scrollTo({ top: 0, behavior: 'smooth' });
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 mt-15  ">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-600 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-600 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-600 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse delay-500"></div>
      </div>

      <div className="relative z-10">
        {/* Header */}
        <header className="backdrop-blur-sm bg-white/5 border-b border-white/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-lg flex items-center justify-center">
                  <Printer className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold text-white">โพธิ์ทอง พริ้นติ้ง</h1>
                  <p className="text-xs sm:text-sm text-blue-200">Phothong Printing (Thailand) Co.,Ltd.</p>
                </div>
              </div>
              <div className="hidden sm:flex items-center space-x-2 text-blue-200">
                <Globe className="w-4 h-4" />
                <span className="text-sm">Since 1994</span>
              </div>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section className="py-12 sm:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="backdrop-blur-sm bg-white/5 rounded-3xl p-6 sm:p-12 border border-white/10">
              <h2 className="text-2xl sm:text-5xl font-bold text-white mb-4 sm:mb-6">
                <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                  30 ปี
                </span>
                <br className="sm:hidden" />
                <span className="text-lg sm:text-5xl"> แห่งความเชี่ยวชาญ</span>
              </h2>
              <p className="text-base sm:text-xl text-blue-200 mb-6 sm:mb-8 max-w-3xl mx-auto leading-relaxed">
                บริการสิ่งพิมพ์ครบวงจร ด้วยเทคโนโลยีทันสมัย และการบริการที่ใส่ใจทุกขั้นตอน
              </p>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                <button className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-6 sm:px-8 py-3 rounded-full font-semibold hover:from-blue-600 hover:to-cyan-600 transition-all duration-300 shadow-lg hover:shadow-xl">
                  เริ่มต้นโครงการ
                </button>
                <button className="bg-white/10 backdrop-blur-sm text-white px-6 sm:px-8 py-3 rounded-full font-semibold hover:bg-white/20 transition-all duration-300 border border-white/20">
                  ดูผลงาน
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Services Grid */}
        <section className="py-12 sm:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h3 className="text-2xl sm:text-3xl font-bold text-white text-center mb-8 sm:mb-12">
              บริการของเรา
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {[
                { icon: Printer, title: 'ออฟเซ็ท', desc: 'พิมพ์คุณภาพสูง' },
                { icon: Palette, title: 'ดิจิตอล', desc: 'พิมพ์รวดเร็ว' },
                { icon: Award, title: 'อิงค์เจ็ท', desc: 'พิมพ์ขนาดใหญ่' },
                { icon: Building, title: 'พรีเมี่ยม', desc: 'ของขวัญ Custom' }
              ].map((service, index) => (
                <div key={index} className="backdrop-blur-sm bg-white/5 rounded-2xl p-4 sm:p-6 border border-white/10 hover:bg-white/10 transition-all duration-300 group">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-lg flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-110 transition-transform duration-300">
                    <service.icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <h4 className="text-lg sm:text-xl font-semibold text-white mb-2">{service.title}</h4>
                  <p className="text-sm sm:text-base text-blue-200">{service.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Company Info */}
        <section className="py-12 sm:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12">
              <div className="backdrop-blur-sm bg-white/5 rounded-3xl p-6 sm:p-8 border border-white/10">
                <h3 className="text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-6">ประวัติความเป็นมา</h3>
                <div className="space-y-3 sm:space-y-4 text-blue-200">
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-cyan-400 rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-sm sm:text-base"><strong className="text-white">พ.ศ. 1994:</strong> ก่อตั้งโรงพิมพ์</p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-cyan-400 rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-sm sm:text-base"><strong className="text-white">30 ปี:</strong> ประสบการณ์ในวงการ</p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-cyan-400 rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-sm sm:text-base"><strong className="text-white">ปัจจุบัน:</strong> ดำเนินงานโดยทายาทรุ่นที่ 2</p>
                  </div>
                </div>
              </div>

              <div className="backdrop-blur-sm bg-white/5 rounded-3xl p-6 sm:p-8 border border-white/10">
                <h3 className="text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-6">ผู้บริหาร</h3>
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full flex items-center justify-center">
                    <Users className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                  </div>
                  <div>
                    <h4 className="text-lg sm:text-xl font-semibold text-white">รัชพล ทรงอมรสิริ</h4>
                    <p className="text-sm sm:text-base text-blue-200">ผู้บริหาร</p>
                    <p className="text-xs sm:text-sm text-blue-300">ทายาทรุ่นที่ 2</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* One Stop Service */}
        <section className="py-12 sm:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="backdrop-blur-sm bg-gradient-to-r from-blue-600/20 to-cyan-600/20 rounded-3xl p-6 sm:p-12 border border-white/10 text-center">
              <h3 className="text-2xl sm:text-4xl font-bold text-white mb-4 sm:mb-6">
                One Stop Printing Services
              </h3>
              <p className="text-base sm:text-xl text-blue-200 mb-6 sm:mb-8 max-w-3xl mx-auto">
                บริการครบวงจร ตั้งแต่ออกแบบ จัดพิมพ์ ไปจนถึงของพรีเมี่ยม
                <br className="hidden sm:block" />
                เพื่อความสะดวกและประหยัดเวลาของลูกค้า
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-8 mt-6 sm:mt-8">
                <div className="text-center">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                    <Palette className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                  </div>
                  <h4 className="text-lg sm:text-xl font-semibold text-white">ออกแบบ</h4>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                    <Printer className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                  </div>
                  <h4 className="text-lg sm:text-xl font-semibold text-white">จัดพิมพ์</h4>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                    <Award className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                  </div>
                  <h4 className="text-lg sm:text-xl font-semibold text-white">พรีเมี่ยม</h4>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="backdrop-blur-sm bg-white/5 border-t border-white/10 py-6 sm:py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row items-center justify-between">
              <div className="flex items-center space-x-3 mb-4 sm:mb-0">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-lg flex items-center justify-center">
                  <Printer className="w-4 h-4 text-white" />
                </div>
                <span className="text-white font-semibold text-sm sm:text-base">โพธิ์ทอง พริ้นติ้ง</span>
              </div>
              <p className="text-blue-200 text-xs sm:text-sm text-center sm:text-right">
                © 2024 Phothong Printing (Thailand) Co.,Ltd. 
                <br className="sm:hidden" />
                <span className="hidden sm:inline"> | </span>
                All rights reserved.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}