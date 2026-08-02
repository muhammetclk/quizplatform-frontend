import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { register as apiRegister } from '../api/auth';
import { useAuth } from '../context/AuthContext';

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (form.password.length < 6) { setError('Şifre en az 6 karakter olmalıdır.'); return; }
    setLoading(true);
    try {
      const res = await apiRegister(form);
      login(res);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Kayıt başarısız. Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="card auth-box fade-in-up">
        <div className="auth-logo">
          <div className="auth-logo-text">QuizPlatform</div>
        </div>

        <h2 className="auth-title">Hesap Oluştur 🚀</h2>
        <p className="auth-sub">Binlerce quiz ile öğrenmeye başla</p>

        {error && (
          <div className="alert alert-error" style={{ marginBottom: 20 }}>
            <span>⚠</span> {error}
          </div>
        )}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Kullanıcı Adı</label>
            <input
              id="register-username"
              type="text"
              name="username"
              className="form-input"
              placeholder="johndoe"
              value={form.username}
              onChange={handleChange}
              required
              minLength={3}
              autoFocus
            />
          </div>

          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              id="register-email"
              type="email"
              name="email"
              className="form-input"
              placeholder="ornek@email.com"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Şifre</label>
            <input
              id="register-password"
              type="password"
              name="password"
              className="form-input"
              placeholder="En az 6 karakter"
              value={form.password}
              onChange={handleChange}
              required
              minLength={6}
            />
          </div>

          <button
            id="register-submit"
            type="submit"
            className="btn btn-primary btn-lg"
            style={{ width: '100%', marginTop: 8 }}
            disabled={loading}
          >
            {loading ? (
              <><span className="spinner" style={{ width: 20, height: 20, borderWidth: 2 }} /> Kayıt olunuyor...</>
            ) : 'Kayıt Ol →'}
          </button>
        </form>

        <p className="auth-divider">
          Zaten hesabın var mı? <Link to="/login">Giriş yap</Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
