import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useWebSocket } from '../hooks/useWebSocket';
import type { AttemptResult, QuizAiResult } from '../types';

const ResultPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const result: AttemptResult | undefined = location.state?.result;
  const [aiResult, setAiResult] = useState<QuizAiResult | null>(null);
  const [wsTimeout, setWsTimeout] = useState(false);

  // Extract userId from JWT token (decode payload)
  const getUserId = (): string | null => {
    const token = localStorage.getItem('accessToken');
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.userId ?? null;
    } catch {
      return null;
    }
  };

  const userId = getUserId();
  const { aiResult: wsAiResult } = useWebSocket(
    result?.wrongCount && result.wrongCount > 0 ? userId : null
  );

  useEffect(() => {
    if (wsAiResult) setAiResult(wsAiResult);
  }, [wsAiResult]);

  // Show "no AI" after 30s if no wrong answers or no result
  useEffect(() => {
    if (!result || result.wrongCount === 0) return;
    const t = setTimeout(() => setWsTimeout(true), 30000);
    return () => clearTimeout(t);
  }, [result]);

  if (!result) {
    return (
      <div className="page">
        <div className="container">
          <div className="alert alert-error" style={{ marginTop: 40 }}>
            Sonuç bulunamadı. <button className="btn btn-ghost" onClick={() => navigate('/')}>Ana sayfaya dön</button>
          </div>
        </div>
      </div>
    );
  }

  const scorePct = Math.round((result.correctCount / result.totalQuestions) * 100);
  const timeMin = Math.floor(result.timeSpentSec / 60);
  const timeSec = result.timeSpentSec % 60;

  const getMessage = () => {
    if (scorePct >= 90) return { icon: '🏆', text: 'Mükemmel! Harika bir performans!' };
    if (scorePct >= 70) return { icon: '🎯', text: 'Çok iyi! Neredeyse mükemmelsin!' };
    if (scorePct >= 50) return { icon: '📈', text: 'İyi iş! Biraz daha pratik yapmalısın.' };
    return { icon: '💪', text: 'Devam et! Her deneme seni geliştirir.' };
  };

  const msg = getMessage();

  return (
    <div className="page">
      <div className="result-page">
        {/* Score Hero */}
        <div className="card score-hero fade-in-up" style={{ '--score-pct': scorePct } as React.CSSProperties}>
          <div className="score-circle">
            <div className="score-value">%{scorePct}</div>
          </div>

          <h2 style={{ fontFamily: 'Outfit', marginBottom: 8 }}>
            {msg.icon} {msg.text}
          </h2>
          <p style={{ color: 'var(--text-secondary)' }}>{result.quizTitle}</p>

          <div className="stats-row">
            <div className="stat-item">
              <div className="stat-val stat-correct">{result.correctCount}</div>
              <div className="stat-label">Doğru</div>
            </div>
            <div className="stat-item">
              <div className="stat-val stat-wrong">{result.wrongCount}</div>
              <div className="stat-label">Yanlış</div>
            </div>
            <div className="stat-item">
              <div className="stat-val stat-empty">{result.emptyCount}</div>
              <div className="stat-label">Boş</div>
            </div>
            <div className="stat-item">
              <div className="stat-val" style={{ color: 'var(--accent)' }}>
                {timeMin > 0 ? `${timeMin}:${timeSec.toString().padStart(2, '0')}` : `${timeSec}s`}
              </div>
              <div className="stat-label">Süre</div>
            </div>
          </div>
        </div>

        {/* AI Explanations Section */}
        {result.wrongCount > 0 && (
          <div className="fade-in-up delay-2">
            <div className="section-header" style={{ marginTop: 40 }}>
              <h3 style={{ fontFamily: 'Outfit', fontSize: '1.3rem', marginBottom: 8 }}>
                🤖 AI Analizi
              </h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                Yanlış cevaplarının yapay zeka açıklamaları
              </p>
            </div>

            {!aiResult && !wsTimeout && (
              <div className="card ai-loading">
                <div className="ai-orb" />
                <div className="ai-loading-title">Gemini AI Analiz Yapıyor...</div>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: 8 }}>
                  Yanlış cevaplarının detaylı açıklamaları hazırlanıyor
                </p>
                <div className="ai-dots">
                  <div className="ai-dot" />
                  <div className="ai-dot" />
                  <div className="ai-dot" />
                </div>
              </div>
            )}

            {!aiResult && wsTimeout && (
              <div className="card" style={{ padding: 32, textAlign: 'center' }}>
                <p style={{ color: 'var(--text-secondary)' }}>
                  AI analizi şu anda kullanılamıyor. Lütfen daha sonra tekrar deneyin.
                </p>
              </div>
            )}

            {aiResult && aiResult.explanations.map((exp, i) => (
              <div key={exp.questionId} className={`card ai-result-card fade-in-up delay-${Math.min(i + 1, 4)}`}>
                <div className="ai-result-question">❓ {exp.questionContent}</div>
                <div className="ai-result-your-answer">
                  <span>✗</span>
                  <span>Senin cevabın: <strong>{exp.selectedOptionContent}</strong></span>
                </div>
                <div className="ai-explanation-box">
                  <div className="ai-explanation-label">
                    ✨ AI Açıklaması
                  </div>
                  <div className="ai-explanation-text">{exp.aiExplanation}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {result.wrongCount === 0 && (
          <div className="card fade-in-up delay-2" style={{ padding: 32, textAlign: 'center', marginTop: 24 }}>
            <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>🎉</div>
            <p style={{ color: 'var(--text-secondary)' }}>
              Tüm soruları doğru cevapladın! AI analizi gerekmiyor.
            </p>
          </div>
        )}

        {/* Actions */}
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 40 }} className="fade-in-up delay-3">
          <button className="btn btn-outline" onClick={() => navigate('/')}>
            🏠 Ana Sayfa
          </button>
          <button className="btn btn-primary" onClick={() => navigate(-2)}>
            🔄 Tekrar Dene
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResultPage;
