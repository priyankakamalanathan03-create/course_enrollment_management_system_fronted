import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { Mail, Lock, LogIn, GraduationCap } from 'lucide-react';
import toast from 'react-hot-toast';
import './Auth.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      await login(email, password);
      toast.success('Welcome back to CEMS Elite!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to login. Please check credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="glass-panel auth-box"
      >
        <div className="auth-header">
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="auth-logo-icon"
          >
            <GraduationCap size={48} color="#3b82f6" />
          </motion.div>
          <h1 className="auth-title">Welcome Back</h1>
          <p className="auth-subtitle">Sign in to continue to CEMS Elite</p>
        </div>

        <div className="auth-form" onKeyDown={(e) => e.key === 'Enter' && handleSubmit(e)}>
          <div className="input-group">
            <label>E<span>m</span>ail Address</label>
            <div className="input-wrapper">
              <Mail className="input-icon" size={18} />
              <input 
                type="text" 
                id="login-email"
                name="email_addr_login"
                className="input-field with-icon"
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                placeholder="you@example.com"
                required 
                autoComplete="nope"
                spellCheck="false"
              />
            </div>
          </div>

          <div className="input-group">
            <label>Password</label>
            <div className="input-wrapper">
              <Lock className="input-icon" size={18} />
              <input 
                type="text" 
                id="login-password"
                name="password_login"
                className="input-field with-icon"
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                onFocus={(e) => e.target.type = 'password'}
                placeholder="••••••••"
                required 
                autoComplete="current-password"
                style={{ WebkitTextSecurity: 'disc' }}
              />
            </div>
          </div>

          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSubmit} 
            className="btn-primary auth-submit"
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="flex-center">Authenticating...</span>
            ) : (
              <span className="flex-center">
                <LogIn size={20} className="mr-2" /> Sign In
              </span>
            )}
          </motion.button>
        </div>

        <p className="auth-footer">
          Don't have an account? <Link to="/register" className="auth-link">Register here</Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Login;