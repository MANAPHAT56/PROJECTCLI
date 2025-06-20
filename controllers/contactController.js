exports.submitContactForm = (req, res) => {
  const { name, email, subject, message } = req.body;

  if (!name || !email || !subject || !message) {
    return res.status(400).json({ error: 'กรุณากรอกข้อมูลให้ครบทุกช่อง' });
  }

  // TODO: บันทึกลงฐานข้อมูล หรือ ส่งอีเมล
  console.log('📩 ข้อความจากผู้ใช้:');
  console.log({ name, email, subject, message });

  res.json({ message: 'ส่งข้อความเรียบร้อยแล้ว ขอบคุณค่ะ' });
};
