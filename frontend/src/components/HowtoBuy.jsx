import React, { useState } from 'react';
import { 
  MessageCircle, 
  FileText, 
  Palette, 
  CheckCircle, 
  Truck, 
  Star,
  ArrowRight,
  Phone,
  Mail,
  Clock,
  Users,
  Printer
} from 'lucide-react';
import { useEffect } from 'react';
import Contact from './footer'
export default function PhothongOrderProcess() {
      useEffect(()=>{
         window.scrollTo({ top: 0, behavior: 'smooth' });
  },[])
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    {
      id: 1,
      title: "ปรึกษาและสอบถาม",
      subtitle: "รับคำปรึกษาฟรี",
      description: "ติดต่อสอบถามรายละเอียด ประเภทงานพิมพ์ จำนวน และความต้องการพิเศษ",
      icon: MessageCircle,
      details: [
        "สอบถามผ่านโทรศัพท์หรือ LINE",
        "ให้คำปรึกษาประเภทกระดาษและเทคนิคการพิมพ์",
        "แนะนำขนาดและรูปแบบที่เหมาะสม",
        "ประเมินราคาเบื้องต้น"
      ],
      contact: {
        phone: "02-XXX-XXXX",
        line: "@phothong",
        time: "จันทร์-เสาร์ 8:00-17:00"
      }
    },
    {
      id: 2,
      title: "ส่งไฟล์และใบเสนอราคา",
      subtitle: "รับใบเสนอราคาฟรี",
      description: "ส่งไฟล์งานออกแบบหรือข้อมูลที่ต้องการพิมพ์ เพื่อรับใบเสนอราคาที่แม่นยำ",
      icon: FileText,
      details: [
        "รับไฟล์ AI, PDF, PNG หรือรูปแบบอื่นๆ",
        "ตรวจสอบไฟล์และคุณภาพงาน",
        "จัดทำใบเสนอราคาที่ละเอียด",
        "ระบุระยะเวลาการผลิต"
      ],
      fileTypes: ["AI", "PDF", "PNG", "JPG", "PSD", "CDR"]
    },
    {
      id: 3,
      title: "ออกแบบและปรับแต่ง",
      subtitle: "บริการออกแบบฟรี*",
      description: "ทีมดีไซเนอร์มืออาชีพช่วยออกแบบหรือปรับปรุงงานให้สวยงามและพร้อมพิมพ์",
      icon: Palette,
      details: [
        "ออกแบบใหม่หรือปรับปรุงไฟล์เดิม",
        "ตรวจสอบความถูกต้องของสี",
        "จัดเลย์เอาท์ให้เหมาะสมกับการพิมพ์",
        "ส่ง Proof ให้ตรวจสอบก่อนพิมพ์"
      ],
      note: "*สำหรับงานที่มีปริมาณตามเงื่อนไข"
    },
    {
      id: 4,
      title: "อนุมัติและชำระเงิน",
      subtitle: "ยืนยันงานและชำระ",
      description: "ตรวจสอบ Proof สุดท้าย อนุมัติงาน และชำระเงินตามเงื่อนไขที่ตกลง",
      icon: CheckCircle,
      details: [
        "ตรวจสอบ Proof และรายละเอียดขั้นสุดท้าย",
        "ลงลายมือชื่ออนุมัติงาน",
        "ชำระเงินมั่นจำหรือเต็มจำนวน",
        "รับหมายเลข Job เพื่อติดตามงาน"
      ],
      payment: ["เงินสด", "โอนธนาคาร", "บัตรเครดิต", "เช็ค"]
    },
    {
      id: 5,
      title: "ผลิตและควบคุมคุณภาพ",
      subtitle: "ผลิตด้วยเทคโนโลยีทันสมัย",
      description: "เริ่มกระบวนการผลิต ควบคุมคุณภาพทุกขั้นตอน พร้อมแจ้งความคืบหน้า",
      icon: Printer,
      details: [
        "ผลิตด้วยเครื่องจักรคุณภาพสูง",
        "ควบคุมคุณภาพสีและความคมชัด",
        "ตรวจสอบการตัด การพับ การเข้าเล่ม",
        "แจ้งสถานะความคืบหน้าผ่าน LINE"
      ],
      duration: "3-7 วันทำการ (ขึ้นอยู่กับชนิดงาน)"
    },
    {
      id: 6,
      title: "จัดส่งและรับประกัน",
      subtitle: "จัดส่งและบริการหลังการขาย",
      description: "จัดส่งงานที่สมบูรณ์แบบ พร้อมบริการหลังการขายและรับประกันคุณภาพ",
      icon: Truck,
      details: [
        "บรรจุงานอย่างปลอดภัย",
        "จัดส่งตามนัดหมาย",
        "ตรวจสอบงานร่วมกับลูกค้า",
        "รับประกันคุณภาพงานพิมพ์"
      ],
      delivery: ["รับที่โรงพิมพ์", "จัดส่งในกรุงเทพฯ", "ส่งต่างจังหวัด"]
    }
  ];

  const getStepButtonClass = (index) => {
    if (activeStep === index) {
      return 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg';
    }
    return 'bg-white/10 text-blue-200 hover:bg-white/20';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 mt-15">
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
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-lg flex items-center justify-center">
                <Printer className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-white">ขั้นตอนการสั่งซื้อ</h1>
                <p className="text-xs sm:text-sm text-blue-200">โพธิ์ทอง พริ้นติ้ง - บริการครบวงจร</p>
              </div>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section className="py-8 sm:py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="backdrop-blur-sm bg-white/5 rounded-3xl p-6 sm:p-8 border border-white/10">
              <h2 className="text-2xl sm:text-4xl font-bold text-white mb-4">
                <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                  6 ขั้นตอน
                </span>
                <br className="sm:hidden" />
                <span className="text-lg sm:text-4xl"> ง่ายๆ สู่งานพิมพ์คุณภาพ</span>
              </h2>
              <p className="text-sm sm:text-lg text-blue-200 mb-6 max-w-3xl mx-auto">
                ตั้งแต่ปรึกษา ออกแบบ จนถึงจัดส่ง เราใส่ใจทุกรายละเอียดเพื่อความพึงพอใจของคุณ
              </p>
            </div>
          </div>
        </section>

        {/* Steps Navigation */}
        <section className="py-4 sm:py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex overflow-x-auto pb-4 gap-2 sm:gap-4">
              {steps.map((step, index) => (
                <button
                  key={step.id}
                  onClick={() => setActiveStep(index)}
                  className={`flex-shrink-0 px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-medium transition-all duration-300 ${getStepButtonClass(index)}`}
                >
                  <span className="hidden sm:inline">ขั้นตอนที่ </span>{step.id}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Active Step Detail */}
        <section className="py-8 sm:py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="backdrop-blur-sm bg-white/5 rounded-3xl p-6 sm:p-8 border border-white/10">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
                {/* Left Column - Step Info */}
                <div>
                  <div className="flex items-center space-x-4 mb-4 sm:mb-6">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full flex items-center justify-center">
                      {React.createElement(steps[activeStep].icon, { className: "w-6 h-6 sm:w-8 sm:h-8 text-white" })}
                    </div>
                    <div>
                      <div className="text-xs sm:text-sm text-cyan-400 font-medium">
                        ขั้นตอนที่ {steps[activeStep].id}
                      </div>
                      <h3 className="text-xl sm:text-2xl font-bold text-white">
                        {steps[activeStep].title}
                      </h3>
                      <p className="text-sm sm:text-base text-blue-200">
                        {steps[activeStep].subtitle}
                      </p>
                    </div>
                  </div>

                  <p className="text-sm sm:text-base text-blue-100 mb-6">
                    {steps[activeStep].description}
                  </p>

                  <div className="space-y-3">
                    {steps[activeStep].details.map((detail, index) => (
                      <div key={index} className="flex items-start space-x-3">
                        <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-400 mt-0.5 flex-shrink-0" />
                        <span className="text-xs sm:text-sm text-blue-200">{detail}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right Column - Additional Info */}
                <div className="space-y-4 sm:space-y-6">
                  {/* Contact Info for Step 1 */}
                  {activeStep === 0 && steps[activeStep].contact && (
                    <div className="backdrop-blur-sm bg-white/5 rounded-2xl p-4 sm:p-6 border border-white/10">
                      <h4 className="text-lg font-semibold text-white mb-4">ช่องทางการติดต่อ</h4>
                      <div className="space-y-3">
                        <div className="flex items-center space-x-3">
                          <Phone className="w-4 h-4 text-cyan-400" />
                          <span className="text-sm text-blue-200">{steps[activeStep].contact.phone}</span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <MessageCircle className="w-4 h-4 text-cyan-400" />
                          <span className="text-sm text-blue-200">LINE ID: {steps[activeStep].contact.line}</span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <Clock className="w-4 h-4 text-cyan-400" />
                          <span className="text-sm text-blue-200">{steps[activeStep].contact.time}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* File Types for Step 2 */}
                  {activeStep === 1 && steps[activeStep].fileTypes && (
                    <div className="backdrop-blur-sm bg-white/5 rounded-2xl p-4 sm:p-6 border border-white/10">
                      <h4 className="text-lg font-semibold text-white mb-4">ไฟล์ที่รองรับ</h4>
                      <div className="grid grid-cols-3 gap-2">
                        {steps[activeStep].fileTypes.map((type, index) => (
                          <div key={index} className="bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-lg p-2 text-center">
                            <span className="text-sm font-medium text-white">{type}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Design Note for Step 3 */}
                  {activeStep === 2 && steps[activeStep].note && (
                    <div className="backdrop-blur-sm bg-white/5 rounded-2xl p-4 sm:p-6 border border-white/10">
                      <h4 className="text-lg font-semibold text-white mb-3">หมายเหตุ</h4>
                      <p className="text-sm text-blue-200">{steps[activeStep].note}</p>
                    </div>
                  )}

                  {/* Payment Methods for Step 4 */}
                  {activeStep === 3 && steps[activeStep].payment && (
                    <div className="backdrop-blur-sm bg-white/5 rounded-2xl p-4 sm:p-6 border border-white/10">
                      <h4 className="text-lg font-semibold text-white mb-4">วิธีการชำระเงิน</h4>
                      <div className="grid grid-cols-2 gap-2">
                        {steps[activeStep].payment.map((method, index) => (
                          <div key={index} className="bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-lg p-2 text-center">
                            <span className="text-xs sm:text-sm text-white">{method}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Duration for Step 5 */}
                  {activeStep === 4 && steps[activeStep].duration && (
                    <div className="backdrop-blur-sm bg-white/5 rounded-2xl p-4 sm:p-6 border border-white/10">
                      <h4 className="text-lg font-semibold text-white mb-3">ระยะเวลาการผลิต</h4>
                      <p className="text-sm text-blue-200">{steps[activeStep].duration}</p>
                    </div>
                  )}

                  {/* Delivery Options for Step 6 */}
                  {activeStep === 5 && steps[activeStep].delivery && (
                    <div className="backdrop-blur-sm bg-white/5 rounded-2xl p-4 sm:p-6 border border-white/10">
                      <h4 className="text-lg font-semibold text-white mb-4">ตัวเลือกการจัดส่ง</h4>
                      <div className="space-y-2">
                        {steps[activeStep].delivery.map((option, index) => (
                          <div key={index} className="flex items-center space-x-3">
                            <Truck className="w-4 h-4 text-cyan-400" />
                            <span className="text-sm text-blue-200">{option}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Navigation Buttons */}
                  <div className="flex space-x-3">
                    {activeStep > 0 && (
                      <button
                        onClick={() => setActiveStep(activeStep - 1)}
                        className="flex-1 bg-white/10 backdrop-blur-sm text-white px-4 py-2 rounded-full font-medium hover:bg-white/20 transition-all duration-300 text-sm"
                      >
                        ก่อนหน้า
                      </button>
                    )}
                    {activeStep < steps.length - 1 && (
                      <button
                        onClick={() => setActiveStep(activeStep + 1)}
                        className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-4 py-2 rounded-full font-medium hover:from-blue-600 hover:to-cyan-600 transition-all duration-300 flex items-center justify-center space-x-2 text-sm"
                      >
                        <span>ถัดไป</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Quick Contact CTA */}
        <section className="py-8 sm:py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="backdrop-blur-sm bg-gradient-to-r from-blue-600/20 to-cyan-600/20 rounded-3xl p-6 sm:p-8 border border-white/10 text-center">
              <h3 className="text-xl sm:text-2xl font-bold text-white mb-4">
                พร้อมเริ่มต้นโครงการของคุณแล้วหรือยัง?
              </h3>
              <p className="text-sm sm:text-base text-blue-200 mb-6">
                ติดต่อเราวันนี้เพื่อรับคำปรึกษาฟรีและใบเสนอราคา
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-6 py-3 rounded-full font-semibold hover:from-blue-600 hover:to-cyan-600 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2">
                  <Phone className="w-4 h-4" />
                  <span>โทรสอบถาม</span>
                </button>
                <button className="bg-white/10 backdrop-blur-sm text-white px-6 py-3 rounded-full font-semibold hover:bg-white/20 transition-all duration-300 border border-white/20 flex items-center justify-center space-x-2">
                  <MessageCircle className="w-4 h-4" />
                  <span>แชท LINE</span>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <Contact/>
      </div>
    </div>
  );
}