import { GoogleLogin } from '@react-oauth/google';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

const LoginPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = async (res) => {
    setLoading(true);
    try {
      const googleToken = res.credential;

      const response = await axios.post('http://localhost:5000/auth/google', {
        token: googleToken,
      });

    if (response.status !== 200) {
  throw new Error('Login failed');
}

      localStorage.setItem('token', response.data.accessToken);
      alert('Login สำเร็จ!');
      navigate('/admin');
    } catch (err) {
      console.error('Google login error:', err.message);
      alert('เข้าสู่ระบบไม่สำเร็จ');
      navigate('/login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>เข้าสู่ระบบด้วย Google</h2>
      {loading ? (
        <p style={styles.loading}>กำลังเข้าสู่ระบบ...</p>
      ) : (
        <GoogleLogin
          onSuccess={handleGoogleLogin}
          onError={() => {
            alert('Google Login ผิดพลาด');
            navigate('/login');
          }}
          shape="pill"
          size="large"
          theme="outline"
        />
      )}
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '400px',
    margin: '100px auto',
    padding: '2rem',
    textAlign: 'center',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    borderRadius: '10px',
    backgroundColor: '#fff',
    fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif',
  },
  title: {
    marginBottom: '1.5rem',
    color: '#333',
  },
  loading: {
    fontSize: '1.2rem',
    color: '#666',
  },
};

export default LoginPage;
