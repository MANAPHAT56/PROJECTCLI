const allArticles = [
  { id: 1, title: "5 ไอเดียของพรีเมี่ยมปี 2025", content: "ของขวัญสำหรับลูกค้าคือ...", fullContent: "ของขวัญสำหรับลูกค้าคือการแสดงออกถึงความห่วงใย..." },
  { id: 2, title: "ทำไมองค์กรถึงนิยมกระบอกน้ำ", content: "ในปีที่ผ่านมา เราเห็นกระบอกน้ำกลายเป็น...", fullContent: "ในปีที่ผ่านมา เราเห็นกระบอกน้ำกลายเป็นเครื่องมือส่งเสริมภาพลักษณ์..." },
  // เพิ่มอีกตามต้องการ
];

exports.getArticlesPaginated = (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const pageSize = 3;
  const start = (page - 1) * pageSize;
  const paginated = allArticles.slice(start, start + pageSize);
  const totalPages = Math.ceil(allArticles.length / pageSize);

  res.json({ articles: paginated, currentPage: page, totalPages });
};

exports.getArticleById = (req, res) => {
  const article = allArticles.find(a => a.id === parseInt(req.params.id));
  if (!article) return res.status(404).json({ error: "ไม่พบบทความ" });
  res.json(article);
};
