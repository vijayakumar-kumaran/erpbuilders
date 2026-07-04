import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { AuthProvider } from './AuthContext'; // ✅ import

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider> {/* ✅ Wrap your App */}
      <App />
    </AuthProvider>
  </StrictMode>
);