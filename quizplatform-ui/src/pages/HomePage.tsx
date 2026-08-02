import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getCategories } from '../api/quiz';
import { useAuth } from '../context/AuthContext';
import type { Category } from '../types';

const CATEGORY_ICONS: Record<string, string> = {
  default: '📚',
  matematik: '🔢',
  science: '🔬',
  bilim: '🔬',
  history: '🏛️',
  tarih: '🏛️',
  programming: '💻',
  yazılım: '💻',
  geography: '🌍',
  coğrafya: '🌍',
  language: '🗣️',
  dil: '🗣️',
  sport: '⚽',
  spor: '⚽',
  art: '🎨',
  sanat: '🎨',
  music: '🎵',
  müzik: '🎵',
};

const getIcon = (name: string, iconUrl?: string) => {
  if (iconUrl) return iconUrl;
  const key = name.toLowerCase();
  for (const [k, v] of Object.entries(CATEGORY_ICONS)) {
    if (key.includes(k)) return v;
  }
  return CATEGORY_ICONS.default;
};

const COLORS = [
  '#6C63FF', '#00D2FF', '#FF6B6B', '#FFC107',
  '#10B981', '#F59E0B', '#EC4899', '#8B5CF6',
];

const HomePage: React.FC = () => {
  const { user } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getCategories()
      .then(setCategories)
      .catch(() => setError('Kategoriler yüklenemedi.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="page">
      {/* Hero */}
      <div className="container">
        <div className="hero fade-in-up">
          <div className="hero-badge">✨ AI Destekli Quiz Platformu</div>
          <h1 className="hero-title">
            Öğren, Test Et,<br />Uzmanlaş
          </h1>
          <p className="hero-subtitle">
            {user
              ? `Hoşgeldin, ${user.username}! Bugün hangi konuyu keşfetmek istersin?`
              : 'Yüzlerce quiz ile bilgini test et. Yapay zeka destekli analizlerle eksiklerini bul.'}
          </p>
        </div>

        {/* Categories */}
        <div className="section">
          <div className="section-header fade-in-up delay-1">
            <h2 className="section-title">Kategoriler</h2>
            <p className="section-sub">İlgini çeken bir kategori seç ve öğrenmeye başla</p>
          </div>

          {loading && (
            <div className="spinner-page">
              <div className="spinner" />
            </div>
          )}

          {error && (
            <div className="alert alert-error">{error}</div>
          )}

          {!loading && !error && categories.length === 0 && (
            <div className="empty-state">
              <div className="empty-state-icon">📭</div>
              <p className="empty-state-text">Henüz kategori bulunmuyor.</p>
            </div>
          )}

          {!loading && !error && (
            <div className="grid-2">
              {categories.map((cat, i) => {
                const color = cat.colorHex || COLORS[i % COLORS.length];
                const icon = getIcon(cat.name, cat.iconUrl);
                return (
                  <Link
                    key={cat.id}
                    to={`/category/${cat.id}`}
                    className={`card category-card fade-in-up delay-${Math.min(i + 1, 4)}`}
                    style={{ '--card-color': color } as React.CSSProperties}
                  >
                    <div className="category-icon" style={{ background: color }}>
                      {icon.startsWith('http') || icon.includes('.svg') ? (
                        <img src={icon} alt={cat.name} style={{ width: 28, height: 28, filter: 'brightness(0) invert(1)' }} />
                      ) : (
                        icon
                      )}
                    </div>
                    <div>
                      <div className="category-name">{cat.name}</div>
                    </div>
                    <div style={{ marginTop: 'auto', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      Konuları keşfet →
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HomePage;
