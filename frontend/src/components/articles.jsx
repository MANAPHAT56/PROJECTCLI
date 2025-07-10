import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Gift, Target, Users, TrendingUp, Star, Award, Heart, Menu, X } from 'lucide-react';
  import Navbar from './navbar'; // Assuming you have a Navbar component
const PremiumProductsWebsite = ({activeSection}) => {
  const [expandedCard, setExpandedCard] = useState(null);

  const objectives = [
    {
      icon: <TrendingUp className="w-8 h-8 text-blue-500" />,
      title: "ส่งเสริมการขาย",
      description: "กระตุ้นยอดขายและดึงดูดลูกค้าใหม่ผ่านการมอบของขวัญเมื่อซื้อสินค้าตามเงื่อนไขที่กำหนด",
      details: "วิธีการที่มีประสิทธิภาพในการสร้างความสนใจและความต้องการในตัวสินค้า"
    },
    {
      icon: <Target className="w-8 h-8 text-green-500" />,
      title: "ส่งเสริมทางการตลาด",
      description: "สร้างการรับรู้แบรนด์และการจดจำแบรนด์ผ่านสินค้าที่มีโลโก้หรือสัญลักษณ์ของแบรนด์",
      details: "เมื่อสินค้านั้นถูกใช้ในชีวิตประจำวัน จะช่วยเสริมสร้างแบรนด์อย่างต่อเนื่อง"
    },
    {
      icon: <Users className="w-8 h-8 text-purple-500" />,
      title: "ประชาสัมพันธ์องค์กร",
      description: "ส่งเสริมภาพลักษณ์องค์กรและสร้างความสัมพันธ์ที่ดีระหว่างองค์กรกับลูกค้าหรือพันธมิตร",
      details: "การมอบของที่ระลึกในโอกาสพิเศษจะช่วยเสริมสร้างภาพลักษณ์ที่ดีและความน่าเชื่อถือ"
    },
    {
      icon: <Heart className="w-8 h-8 text-red-500" />,
      title: "สร้างความประทับใจ",
      description: "การให้ของพรีเมี่ยมที่มีคุณภาพสูงและดีไซน์ดี ทำให้ผู้รับรู้สึกประทับใจ",
      details: "สร้างความสัมพันธ์ที่ดีกับแบรนด์หรือองค์กรอย่างยั่งยืน"
    }
  ];

  const benefits = [
    {
      icon: <Gift className="w-6 h-6 text-blue-500" />,
      title: "ความหลากหลาย",
      description: "มีสินค้าหลากหลายประเภทให้เลือกตามความต้องการและงบประมาณ"
    },
    {
      icon: <Star className="w-6 h-6 text-yellow-500" />,
      title: "คุณภาพและราคา",
      description: "สินค้าที่นำเข้าจากจีนมักมีคุณภาพที่ดี และราคาที่สามารถเข้าถึงได้"
    },
    {
      icon: <Award className="w-6 h-6 text-green-500" />,
      title: "กำหนดแบบได้ตามต้องการ",
      description: "สามารถสั่งผลิตสินค้าที่มีโลโก้หรือออกแบบพิเศษเพื่อให้ตรงกับภาพลักษณ์ของแบรนด์"
    }
  ];

  const toggleCard = (index) => {
    setExpandedCard(expandedCard === index ? null : index);
  };


  return (
    <div className="mt-15 min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
   <Navbar/>
      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Home Section */}
        {activeSection === 'home' && (
          <div className="animate-in fade-in-0 duration-500">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-5xl font-bold text-gray-800 mb-6">
                ความหมายและประโยชน์ในการส่งเสริมธุรกิจ
              </h2>
              <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-6 md:p-8">
                <p className="text-lg text-gray-700 leading-relaxed mb-6">
                  สินค้าพรีเมี่ยม หรือที่มักเรียกกันว่า "ของพรีเมี่ยม" หรือ "สินค้าที่ระลึก" เป็นสินค้าที่มีคุณค่าและความหมายในการมอบให้แก่ลูกค้า พนักงาน หรือพันธมิตรทางธุรกิจ เพื่อสร้างความประทับใจและความสัมพันธ์ที่ดียิ่งขึ้น
                </p>
                <p className="text-lg text-gray-700 leading-relaxed">
                  สินค้าพรีเมี่ยมมักถูกใช้ในหลายโอกาส เช่น ของขวัญในวันสำคัญ สินค้าส่งเสริมการขาย หรือเป็นสินค้าสำหรับการประชาสัมพันธ์องค์กร
                </p>
              </div>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8 mb-12">
              <div className="bg-gradient-to-br from-blue-500 to-purple-600 text-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
                <Gift className="w-12 h-12 mb-4 mx-auto" />
                <h3 className="text-xl font-bold text-center mb-2">ของขวัญในวันสำคัญ</h3>
                <p className="text-center text-blue-100">สร้างความประทับใจในโอกาสพิเศษ</p>
              </div>
              
              <div className="bg-gradient-to-br from-green-500 to-teal-600 text-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
                <TrendingUp className="w-12 h-12 mb-4 mx-auto" />
                <h3 className="text-xl font-bold text-center mb-2">ส่งเสริมการขาย</h3>
                <p className="text-center text-green-100">เพิ่มยอดขายและดึงดูดลูกค้าใหม่</p>
              </div>
              
              <div className="bg-gradient-to-br from-orange-500 to-red-600 text-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
                <Users className="w-12 h-12 mb-4 mx-auto" />
                <h3 className="text-xl font-bold text-center mb-2">ประชาสัมพันธ์องค์กร</h3>
                <p className="text-center text-orange-100">เสริมสร้างภาพลักษณ์องค์กร</p>
              </div>
            </div>
          </div>
        )}

        {/* Objectives Section */}
        {activeSection === 'objectives' && (
          <div className="animate-in fade-in-0 duration-500">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
                วัตถุประสงค์ของสินค้าพรีเมี่ยม
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                เข้าใจเป้าหมายหลักของการใช้สินค้าพรีเมี่ยมในธุรกิจของคุณ
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8">
              {objectives.map((objective, index) => (
                <div 
                  key={index}
                  className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden"
                >
                  <div className="p-6">
                    <div className="flex items-center mb-4">
                      {objective.icon}
                      <h3 className="text-xl font-bold text-gray-800 ml-3">
                        {objective.title}
                      </h3>
                    </div>
                    <p className="text-gray-600 mb-4 leading-relaxed">
                      {objective.description}
                    </p>
                    <button 
                      onClick={() => toggleCard(index)}
                      className="flex items-center justify-between w-full px-4 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                    >
                      <span className="text-sm font-medium text-gray-700">
                        {expandedCard === index ? 'ซ่อนรายละเอียด' : 'ดูรายละเอียดเพิ่มเติม'}
                      </span>
                      {expandedCard === index ? 
                        <ChevronUp className="w-4 h-4 text-gray-500" /> : 
                        <ChevronDown className="w-4 h-4 text-gray-500" />
                      }
                    </button>
                    {expandedCard === index && (
                      <div className="mt-4 p-4 bg-blue-50 rounded-lg animate-in slide-in-from-top-2 duration-300">
                        <p className="text-gray-700 text-sm leading-relaxed">
                          {objective.details}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Benefits Section */}
        {activeSection === 'benefits' && (
          <div className="animate-in fade-in-0 duration-500">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
                ข้อดีของสินค้าพรีเมี่ยมนำเข้า
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                เหตุผลที่สินค้าพรีเมี่ยมนำเข้าจากประเทศจีนเป็นที่นิยมในตลาดปัจจุบัน
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8 mb-12">
              {benefits.map((benefit, index) => (
                <div 
                  key={index}
                  className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 text-center hover:scale-105"
                >
                  <div className="flex justify-center mb-4">
                    {benefit.icon}
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-3">
                    {benefit.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {benefit.description}
                  </p>
                </div>
              ))}
            </div>
            
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl shadow-lg p-8 text-center">
              <h3 className="text-2xl font-bold mb-4">สินค้าโปรโมชั่นและสินค้านำเข้าจากประเทศจีน</h3>
              <p className="text-lg mb-6 text-blue-100 leading-relaxed">
                สินค้าโปรโมชั่นเป็นเครื่องมือทางการตลาดที่มีความยืดหยุ่น สามารถปรับใช้ได้ตามวัตถุประสงค์และกลุ่มเป้าหมายที่แตกต่างกัน
              </p>
              <div className="grid md:grid-cols-2 gap-6 text-left">
                <div className="bg-black bg-opacity-20 rounded-lg p-4">
                  <h4 className="font-bold mb-2  text-white">ประเภทสินค้าที่นิยม</h4>
                  <ul className="text-sm text-white/90 space-y-1">
                    <li>• อุปกรณ์อิเล็กทรอนิกส์</li>
                    <li>• ของใช้ในบ้าน</li>
                    <li>• ของใช้ส่วนตัว</li>
                    <li>• สินค้าดีไซน์สวยงาม</li>
                  </ul>
                </div>
                <div className="bg-black bg-opacity-20 rounded-lg p-4">
                  <h4 className="font-bold mb-2">ข้อได้เปรียบ</h4>
                  <ul className="text-sm text-white/90 space-y-1">
                    <li>• ราคาที่แข่งขันได้</li>
                    <li>• สั่งผลิตในปริมาณมาก</li>
                    <li>• ตามความต้องการของลูกค้า</li>
                    <li>• คุณภาพที่ยอมรับได้</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-12 mt-16">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h3 className="text-2xl font-bold mb-4">สรุป</h3>
            <div className="max-w-4xl mx-auto">
              <p className="text-gray-300 leading-relaxed mb-6">
                สินค้าพรีเมี่ยมเป็นเครื่องมือที่สำคัญในการสร้างและเสริมสร้างความสัมพันธ์ทางธุรกิจ 
                สามารถใช้ในหลายสถานการณ์เพื่อกระตุ้นการขาย สร้างการรับรู้และจดจำแบรนด์ 
                หรือเพื่อประชาสัมพันธ์องค์กร
              </p>
              <p className="text-gray-300 leading-relaxed">
                การเลือกใช้สินค้าพรีเมี่ยมที่เหมาะสมและมีคุณภาพสูง 
                จะช่วยสร้างภาพลักษณ์ที่ดีและส่งเสริมธุรกิจให้ก้าวหน้าไปได้อย่างยั่งยืน
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PremiumProductsWebsite;