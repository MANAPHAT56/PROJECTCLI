export const fetchWithAuth = async (url, options = {}) => {
  const token = localStorage.getItem('token');

  const res = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  console.log(res.json())
 if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    const error = new Error('Request failed');
    error.status = res.status;
    error.data = errorData;
    throw error; // 👈 ทำให้ .catch() ทำงาน
  }
  return res.json();
};
