import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { LogOut, GraduationCap, UserCircle } from "lucide-react";
import "../pages/Dashboard.css";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <motion.nav 
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="navbar glass-panel"
      style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 2rem', marginBottom: '2rem' }}
    >
      <div className="navbar-brand flex items-center gap-2">
        <GraduationCap size={32} color="var(--accent-color)" />
        <h2 className="brand-title" style={{ margin: 0, fontSize: '1.5rem', fontWeight: 'bold' }}>CEMS Elite</h2>
      </div>

      <div className="navbar-user flex items-center gap-4">
        <div className="user-info flex items-center gap-3">
          <div className="text-right flex flex-col justify-center">
            <span className="user-name block" style={{fontWeight: '600'}}>{user?.name}</span>
            <span className={`user-role badge-${user?.role} inline-block`} style={{marginTop: '4px'}}>
              {user?.role?.toUpperCase()}
            </span>
          </div>
          <div style={{background: 'rgba(255,255,255,0.1)', padding: '0.5rem', borderRadius: '50%'}}>
            <UserCircle size={24} color="var(--text-secondary)" />
          </div>
        </div>

        <div style={{width: '1px', height: '30px', background: 'var(--glass-border)', margin: '0 0.5rem'}}></div>

        <motion.button 
          whileHover={{ scale: 1.05, backgroundColor: 'rgba(239, 68, 68, 0.15)' }}
          whileTap={{ scale: 0.95 }}
          onClick={handleLogout} 
          className="btn-logout flex items-center gap-2"
          style={{background: 'transparent', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer', fontWeight: '500', transition: 'all 0.2s'}}
        >
          <LogOut size={18} />
          <span>Sign Out</span>
        </motion.button>
      </div>
    </motion.nav>
  );
}