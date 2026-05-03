import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { User, Mail, Lock, UserPlus, BookOpen, UserCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import './Auth.css';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'student'
  });
  const [isLoading, setIsLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await register(formData.name, formData.email, formData.password, formData.role);
      toast.success('Account created successfully! Welcome to CEMS Elite.');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to register. Please try again.');
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
            <UserPlus size={48} color="#3b82f6" />
          </motion.div>
          <h1 className="auth-title">Create Account</h1>
          <p className="auth-subtitle">Join the elite learning platform</p>
        </div>

        <div className="auth-form" onKeyDown={(e) => e.key === 'Enter' && handleSubmit(e)}>
          <div className="input-group">
            <label>Full Name</label>
            <div className="input-wrapper">
              <User className="input-icon" size={18} />
              <input 
                type="text" 
                name="new_full_name_entry"
                id="new_full_name_entry"
                className="input-field with-icon"
                value={formData.name} 
                onChange={(e) => setFormData({ ...formData, name: e.target.value })} 
                placeholder="John Doe"
                required 
                autoComplete="nope"
                spellCheck="false"
              />
            </div>
          </div>

          <div className="input-group">
            <label>E<span>m</span>ail Address</label>
            <div className="input-wrapper">
              <Mail className="input-icon" size={18} />
              <input 
                type="text" 
                name="new_email_entry"
                id="new_email_entry"
                className="input-field with-icon"
                value={formData.email} 
                onChange={(e) => setFormData({ ...formData, email: e.target.value })} 
                placeholder="you@example.com"
                required 
                autoComplete="nope"
                spellCheck="false"
              />
            </div>
          </div>

          <div className="input-group">
            <label>P<span>a</span>ssw<span>o</span>rd</label>
            <div className="input-wrapper">
              <Lock className="input-icon" size={18} />
              <input 
                type="text" 
                name="new_secure_key_entry"
                id="new_secure_key_entry"
                className="input-field with-icon"
                value={formData.password} 
                onChange={(e) => setFormData({ ...formData, password: e.target.value })} 
                placeholder="••••••••"
                required 
                autoComplete="nope"
                style={{ WebkitTextSecurity: 'disc' }}
                spellCheck="false"
              />
            </div>
            {formData.password.length > 0 && formData.password.length < 6 && (
              <span style={{color: 'var(--danger)', fontSize: '0.75rem', marginTop: '0.25rem'}}>Password must be at least 6 characters</span>
            )}
          </div>

          <div className="input-group role-selector">
            <label>I am a:</label>
            <div className="role-options">
              <label className={`role-card ${formData.role === 'student' ? 'active' : ''}`}>
                <input 
                  type="radio" 
                  name="role" 
                  value="student" 
                  checked={formData.role === 'student'} 
                  onChange={handleChange} 
                />
                <BookOpen className="role-icon mx-auto flex-center" size={24} style={{margin: '0 auto 0.5rem'}} />
                Student
              </label>
              <label className={`role-card ${formData.role === 'instructor' ? 'active' : ''}`}>
                <input 
                  type="radio" 
                  name="role" 
                  value="instructor" 
                  checked={formData.role === 'instructor'} 
                  onChange={handleChange} 
                />
                <UserCircle className="role-icon mx-auto flex-center" size={24} style={{margin: '0 auto 0.5rem'}} />
                Instructor
              </label>
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
               <span className="flex-center">Creating Account...</span>
            ) : (
               <span className="flex-center">
                 <UserPlus size={20} className="mr-2" /> Sign Up
               </span>
            )}
          </motion.button>
        </div>

        <p className="auth-footer">
          Already have an account? <Link to="/" className="auth-link">Sign in</Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Register;