// mock data
const works = [
  { id: 1, title: 'เสื้อทีมบริษัท', image: '/works/work1.jpg', description: 'ออกแบบเสื้อพนักงานให้บริษัท A' },
  { id: 2, title: 'กระบอกน้ำพรีเมี่ยม', image: '/works/work2.jpg', description: 'ผลิตกระบอกน้ำลายพิเศษ' },
  { id: 3, title: 'แฟลชไดรฟ์สกรีนโลโก้', image: '/works/work3.jpg', description: 'ทำแฟลชไดรฟ์ให้บริษัท B' },
  { id: 4, title: 'ถุงผ้าสั่งทำ', image: '/works/work4.jpg', description: 'ถุงผ้าลายเฉพาะแบรนด์' },
  { id: 5, title: 'สมุดโน้ตแบบปกแข็ง', image: '/works/work5.jpg', description: 'งานพรีเมี่ยมจากโรงเรียน C' }
];

exports.getAllWorks = (req, res) => {
  res.json(works);
};
