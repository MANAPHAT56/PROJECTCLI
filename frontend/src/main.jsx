// import { StrictMode } from 'react'
// import { createRoot } from 'react-dom/client'
import ReactDOM from 'react-dom/client';
import './index.css'
import App from './App.jsx'

import { GoogleOAuthProvider } from '@react-oauth/google';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
    <App />
  </GoogleOAuthProvider>
);