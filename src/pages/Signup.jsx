/* src/pages/Signup.jsx */
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Construction, User, Lock, Eye, EyeOff, Tag, 
  Users, FileText, AlertCircle, CheckCircle 
} from 'lucide-react';
import axios from '../api/axiosInstance';
import { motion } from 'framer-motion';
import API_URL from '../config';
import { useAuth } from '../AuthContext';
import './Signup.css';

const roleOptions = [
  'Admin', 'Site Engineer', 'Site Manager',
  'Operation Head', 'Marketing Head', 'Project Manager', 'Purchase Manager',
  'Finance Manager', 'Engineering Head', 'HR', 'Accountant', 'Buyer', 'Store keeper'
];

const Signup = () => {
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    password: '',
    confirmPassword: '',
    role: '',
    escalationManager: '',
    description: ''
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Client-side validations
    if (!formData.name.trim() || !formData.username.trim() || !formData.password || !formData.role) {
      setError('Please fill in all required fields.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (formData.password.length < 4) {
      setError('Password must be at least 4 characters long.');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await axios.post(`${API_URL}/api/auth/register`, {
        name: formData.name,
        username: formData.username,
        password: formData.password,
        role: formData.role,
        escalationManager: formData.escalationManager,
        description: formData.description
      });

      const { token, ...user } = res.data;

      // Save token and user info to localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      // Update Context
      login(user);

      setSuccess('Account created successfully!');
      setTimeout(() => {
        navigate('/');
      }, 1500);

    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="signup-container" style={{
      backgroundImage: 'linear-gradient(rgba(9, 13, 22, 0.85), rgba(17, 24, 39, 0.95)), url(/construction-bg.jpg)',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
    }}>
      <div className="signup-bg-glow-1"></div>
      <div className="signup-bg-glow-2"></div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        <div className="signup-card">
          <header className="signup-header">
            <h1 className="signup-brand-logo">
              <Construction size={34} />
              MG BUILDERS
            </h1>
            <p className="signup-subtitle">
              Join the Construction Management Portal
            </p>
          </header>

          {error && (
            <div className="signup-alert error">
              <AlertCircle size={20} />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="signup-alert success">
              <CheckCircle size={20} />
              <span>{success}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="signup-grid">
              
              <div className="signup-form-group">
                <label htmlFor="name">Full Name *</label>
                <div className="signup-input-wrapper">
                  <span className="signup-input-icon-prefix">
                    <Tag size={18} />
                  </span>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    placeholder="Enter full name"
                    value={formData.name}
                    onChange={handleChange}
                    className="signup-input"
                  />
                </div>
              </div>

              <div className="signup-form-group">
                <label htmlFor="username">Username *</label>
                <div className="signup-input-wrapper">
                  <span className="signup-input-icon-prefix">
                    <User size={18} />
                  </span>
                  <input
                    type="text"
                    id="username"
                    name="username"
                    required
                    placeholder="Choose username"
                    value={formData.username}
                    onChange={handleChange}
                    className="signup-input"
                  />
                </div>
              </div>

              <div className="signup-form-group">
                <label htmlFor="password">Password *</label>
                <div className="signup-input-wrapper">
                  <span className="signup-input-icon-prefix">
                    <Lock size={18} />
                  </span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    name="password"
                    required
                    placeholder="Enter password"
                    value={formData.password}
                    onChange={handleChange}
                    className="signup-input"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="signup-input-icon-suffix"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="signup-form-group">
                <label htmlFor="confirmPassword">Confirm Password *</label>
                <div className="signup-input-wrapper">
                  <span className="signup-input-icon-prefix">
                    <Lock size={18} />
                  </span>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    id="confirmPassword"
                    name="confirmPassword"
                    required
                    placeholder="Repeat password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="signup-input"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="signup-input-icon-suffix"
                    aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="signup-form-group">
                <label htmlFor="role">Role *</label>
                <div className="signup-input-wrapper">
                  <span className="signup-input-icon-prefix">
                    <Users size={18} />
                  </span>
                  <select
                    id="role"
                    name="role"
                    required
                    value={formData.role}
                    onChange={handleChange}
                    className="signup-select"
                  >
                    <option value="" disabled>Select a role</option>
                    {roleOptions.map((role) => (
                      <option key={role} value={role}>{role}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="signup-form-group">
                <label htmlFor="escalationManager">Escalation Manager</label>
                <div className="signup-input-wrapper">
                  <span className="signup-input-icon-prefix">
                    <User size={18} />
                  </span>
                  <input
                    type="text"
                    id="escalationManager"
                    name="escalationManager"
                    placeholder="Manager's name"
                    value={formData.escalationManager}
                    onChange={handleChange}
                    className="signup-input"
                  />
                </div>
              </div>

              <div className="signup-form-group signup-grid-full">
                <label htmlFor="description">Description / Purpose</label>
                <div className="signup-input-wrapper">
                  <span className="signup-input-icon-prefix" style={{ alignSelf: 'flex-start', marginTop: '0.85rem' }}>
                    <FileText size={18} />
                  </span>
                  <textarea
                    id="description"
                    name="description"
                    placeholder="Briefly state your purpose or department details"
                    value={formData.description}
                    onChange={handleChange}
                    className="signup-textarea"
                  />
                </div>
              </div>

            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="signup-submit-btn"
            >
              {isSubmitting ? 'Creating Account...' : 'Sign Up'}
            </button>

            <footer className="signup-footer">
              <span>Already have an account?</span>
              <span
                className="signup-login-link"
                onClick={() => navigate('/login')}
              >
                Sign In
              </span>
            </footer>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default Signup;
