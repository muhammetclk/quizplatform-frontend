import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { logout as apiLogout } from '../api/auth';

const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try { await apiLogout(); } catch {}
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="container navbar-inner">
        <Link to="/" className="navbar-logo">
          Quiz<span>Platform</span>
        </Link>
        <div className="navbar-actions">
          {isAuthenticated && user ? (
            <>
              <div className="navbar-user">
                <div className="navbar-avatar">
                  {user.username.charAt(0).toUpperCase()}
                </div>
                <span className="navbar-username">{user.username}</span>
              </div>
              <button onClick={handleLogout} className="btn btn-ghost btn-sm">
                Çıkış
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-ghost btn-sm">Giriş Yap</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Kayıt Ol</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
