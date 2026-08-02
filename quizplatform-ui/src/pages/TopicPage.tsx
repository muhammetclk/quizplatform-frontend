import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getQuizzes } from '../api/quiz';
import type { QuizSummary } from '../types';

const diffBadge: Record<string, string> = {
  EASY: 'badge-easy', MEDIUM: 'badge-medium', HARD: 'badge-hard',
};
const diffLabel: Record<string, string> = {
  EASY: 'Kolay', MEDIUM: 'Orta', HARD: 'Zor',
};

const formatTime = (sec: number) => {
  const m = Math.floor(sec / 60);
  return m > 0 ? `${m} dk` : `${sec} sn`;
};

const TopicPage: React.FC = () => {
  const { topicId } = useParams<{ topicId: string }>();
  const [quizzes, setQuizzes] = useState<QuizSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!topicId) return;
    getQuizzes(topicId)
      .then(setQuizzes)
      .catch(() => setError('Quiz listesi yüklenemedi.'))
      .finally(() => setLoading(false));
  }, [topicId]);

  return (
    <div className="page">
      <div className="container">
        <div className="section">
          <div className="breadcrumb fade-in-up">
            <Link to="/">Ana Sayfa</Link>
            <span>›</span>
            <span>Quiz Listesi</span>
          </div>

          <div className="section-header fade-in-up delay-1">
            <h2 className="section-title">Quiz'ler</h2>
            <p className="section-sub">Başlamak istediğin quiz'i seç</p>
          </div>

          {loading && <div className="spinner-page"><div className="spinner" /></div>}
          {error && <div className="alert alert-error">{error}</div>}

          {!loading && !error && quizzes.length === 0 && (
            <div className="empty-state">
              <div className="empty-state-icon">🎯</div>
              <p className="empty-state-text">Bu konuda henüz quiz bulunmuyor.</p>
            </div>
          )}

          {!loading && !error && (
            <div className="grid-3">
              {quizzes.map((quiz, i) => (
                <Link
                  key={quiz.id}
                  to={`/quiz/${quiz.id}/attempt`}
                  className={`card quiz-card fade-in-up delay-${Math.min(i + 1, 4)}`}
                >
                  <div className="quiz-card-meta">
                    <span className={`badge ${diffBadge[quiz.difficulty] ?? 'badge-easy'}`}>
                      {diffLabel[quiz.difficulty] ?? quiz.difficulty}
                    </span>
                  </div>

                  <div className="quiz-title">{quiz.title}</div>

                  {quiz.description && (
                    <p style={{ fontSize: '0.85rem', lineHeight: 1.5, margin: 0 }}>
                      {quiz.description.length > 100
                        ? quiz.description.slice(0, 100) + '…'
                        : quiz.description}
                    </p>
                  )}

                  <div className="quiz-card-footer">
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      <span className="meta-chip">❓ {quiz.questionCount} soru</span>
                      <span className="meta-chip">⏱ {formatTime(quiz.timeLimitSec)}</span>
                    </div>
                    <span style={{ fontSize: '0.85rem', color: 'var(--primary-light)', fontWeight: 600 }}>
                      Başla →
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TopicPage;
