import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getTopics } from '../api/quiz';
import type { Topic } from '../types';

const diffBadge: Record<string, string> = {
  BEGINNER: 'badge-beginner',
  INTERMEDIATE: 'badge-intermediate',
  ADVANCED: 'badge-advanced',
};

const diffLabel: Record<string, string> = {
  BEGINNER: 'Başlangıç',
  INTERMEDIATE: 'Orta',
  ADVANCED: 'İleri',
};

const CategoryPage: React.FC = () => {
  const { categoryId } = useParams<{ categoryId: string }>();
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!categoryId) return;
    getTopics(categoryId)
      .then(setTopics)
      .catch(() => setError('Konular yüklenemedi.'))
      .finally(() => setLoading(false));
  }, [categoryId]);

  return (
    <div className="page">
      <div className="container">
        <div className="section">
          <div className="breadcrumb fade-in-up">
            <Link to="/">Ana Sayfa</Link>
            <span>›</span>
            <span>Konular</span>
          </div>

          <div className="section-header fade-in-up delay-1">
            <h2 className="section-title">Konular</h2>
            <p className="section-sub">Bir konu seçerek quiz'lere ulaş</p>
          </div>

          {loading && <div className="spinner-page"><div className="spinner" /></div>}
          {error && <div className="alert alert-error">{error}</div>}

          {!loading && !error && topics.length === 0 && (
            <div className="empty-state">
              <div className="empty-state-icon">📂</div>
              <p className="empty-state-text">Bu kategoride henüz konu bulunmuyor.</p>
            </div>
          )}

          {!loading && !error && (
            <div className="grid-2">
              {topics.map((topic, i) => (
                <Link
                  key={topic.id}
                  to={`/topic/${topic.id}`}
                  className={`card topic-card fade-in-up delay-${Math.min(i + 1, 4)}`}
                >
                  <div style={{ fontSize: '1.8rem' }}>📖</div>
                  <div className="topic-card-content">
                    <div className="topic-name">{topic.name}</div>
                    {topic.description && (
                      <div className="topic-desc">{topic.description}</div>
                    )}
                    <div style={{ marginTop: 10 }}>
                      <span className={`badge ${diffBadge[topic.difficultyLevel] ?? 'badge-beginner'}`}>
                        {diffLabel[topic.difficultyLevel] ?? topic.difficultyLevel}
                      </span>
                    </div>
                  </div>
                  <div style={{ fontSize: '1.2rem', color: 'var(--text-muted)', flexShrink: 0 }}>›</div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CategoryPage;
