/* src/pages/Login.jsx */
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Construction, User, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';
import axios from '../api/axiosInstance'; 
import { motion } from 'framer-motion';
import API_URL from '../config';
import { useAuth } from '../AuthContext';
import './Login.css';

const Login = () => {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const res = await axios.post(`${API_URL}/api/auth/login`, {
        username: formData.username,
        password: formData.password,
      });

      const { token, ...user } = res.data;

      // Save token and user to localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      login(user);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
      setIsSubmitting(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="login-container" style={{
      backgroundImage: 'linear-gradient(rgba(9, 13, 22, 0.85), rgba(17, 24, 39, 0.95)), url(/construction-bg.jpg)',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
    }}>
      <div className="login-bg-glow-1"></div>
      <div className="login-bg-glow-2"></div>

      <motion.div 
        initial={{ opacity: 0, y: 30 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        <div className="login-card">
          <header className="login-header">
            <h1 className="login-brand-logo">
              <Construction size={34} />
              MG BUILDERS
            </h1>
            <p className="login-subtitle">
              Construction Management Portal
            </p>
          </header>

          {error && (
            <div className="login-alert">
              <AlertCircle size={20} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="login-form-group">
              <label htmlFor="username">Username</label>
              <div className="login-input-wrapper">
                <span className="login-input-icon-prefix">
                  <User size={18} />
                </span>
                <input
                  type="text"
                  id="username"
                  name="username"
                  required
                  placeholder="Enter your username"
                  autoComplete="username"
                  autoFocus
                  value={formData.username}
                  onChange={handleChange}
                  className="login-input"
                />
              </div>
            </div>

            <div className="login-form-group">
              <label htmlFor="password">Password</label>
              <div className="login-input-wrapper">
                <span className="login-input-icon-prefix">
                  <Lock size={18} />
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  required
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  value={formData.password}
                  onChange={handleChange}
                  className="login-input"
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="login-input-icon-suffix"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="login-submit-btn"
            >
              {isSubmitting ? 'Signing In...' : 'Sign In'}
            </button>

            <footer className="login-footer">
              <span>Don't have an account?</span>
              <span
                className="login-signup-link"
                onClick={() => navigate('/signup')}
              >
                Sign Up
              </span>
            </footer>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
