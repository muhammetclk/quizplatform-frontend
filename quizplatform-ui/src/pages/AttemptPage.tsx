import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getQuizDetail } from '../api/quiz';
import { submitAttempt } from '../api/attempt';
import type { QuizDetail, AnswerItem } from '../types';
import TimerRing from '../components/TimerRing';

const LETTERS = ['A', 'B', 'C', 'D', 'E'];

const AttemptPage: React.FC = () => {
  const { quizId } = useParams<{ quizId: string }>();
  const navigate = useNavigate();

  const [quiz, setQuiz] = useState<QuizDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | null>>({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const startTimeRef = useRef(Date.now());
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!quizId) return;
    getQuizDetail(quizId)
      .then((q) => {
        setQuiz(q);
        setTimeLeft(q.timeLimitSec);
        startTimeRef.current = Date.now();
      })
      .catch(() => setError('Quiz yüklenemedi.'))
      .finally(() => setLoading(false));
  }, [quizId]);

  const handleSubmit = useCallback(async (currentAnswers: Record<string, string | null>, quiz: QuizDetail) => {
    if (!quiz || !quizId) return;
    setSubmitting(true);
    if (timerRef.current) clearInterval(timerRef.current);

    const timeSpentSec = Math.floor((Date.now() - startTimeRef.current) / 1000);
    const payload: AnswerItem[] = quiz.questions.map(q => ({
      questionId: q.id,
      selectedOptionId: currentAnswers[q.id] ?? null,
    }));

    try {
      const result = await submitAttempt({ quizId, timeSpentSec, answers: payload });
      navigate(`/attempt/${result.attemptId}/result`, { state: { result } });
    } catch {
      setError('Sonuç gönderilemedi. Lütfen tekrar deneyin.');
      setSubmitting(false);
    }
  }, [quizId, navigate]);

  // Timer countdown
  useEffect(() => {
    if (!quiz) return;
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          handleSubmit(answers, quiz);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [quiz, handleSubmit]); // eslint-disable-line

  const currentQuestion = quiz?.questions[currentIdx];

  const handleOptionSelect = (optionId: string) => {
    setAnswers(prev => ({ ...prev, [currentQuestion!.id]: optionId }));
  };

  const handleNext = () => {
    if (!quiz) return;
    if (currentIdx < quiz.questions.length - 1) {
      setCurrentIdx(i => i + 1);
    } else {
      handleSubmit(answers, quiz);
    }
  };

  const handlePrev = () => { if (currentIdx > 0) setCurrentIdx(i => i - 1); };

  if (loading) return <div className="spinner-page"><div className="spinner" /></div>;
  if (error) return <div className="container page"><div className="alert alert-error" style={{ marginTop: 40 }}>{error}</div></div>;
  if (!quiz || !currentQuestion) return null;

  const progress = ((currentIdx + 1) / quiz.questions.length) * 100;
  const selectedOption = answers[currentQuestion.id];
  const isLast = currentIdx === quiz.questions.length - 1;

  return (
    <div className="page">
      <div className="attempt-layout">
        {/* Header */}
        <div className="attempt-header fade-in-up">
          <div className="attempt-quiz-title">{quiz.title}</div>
          <div className="question-progress">
            {currentIdx + 1} / {quiz.questions.length}
          </div>
          <TimerRing seconds={timeLeft} totalSeconds={quiz.timeLimitSec} />
        </div>

        {/* Progress bar */}
        <div className="progress-bar-wrap fade-in-up delay-1">
          <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
        </div>

        {/* Question */}
        <div className="card question-card fade-in-up delay-2">
          <div className="question-number">Soru {currentIdx + 1}</div>
          <div className="question-text">{currentQuestion.content}</div>

          <div className="options-list">
            {currentQuestion.options.map((opt, oi) => (
              <button
                key={opt.id}
                className={`option-btn ${selectedOption === opt.id ? 'selected' : ''}`}
                onClick={() => handleOptionSelect(opt.id)}
                disabled={submitting}
              >
                <div className="option-letter">{LETTERS[oi]}</div>
                <span>{opt.content}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div className="attempt-nav fade-in-up delay-3">
          <button
            className="btn btn-outline"
            onClick={handlePrev}
            disabled={currentIdx === 0 || submitting}
          >
            ← Önceki
          </button>

          <div style={{ display: 'flex', gap: 6 }}>
            {quiz.questions.map((_, qi) => (
              <button
                key={qi}
                onClick={() => setCurrentIdx(qi)}
                style={{
                  width: 10, height: 10, borderRadius: '50%', border: 'none', cursor: 'pointer',
                  background: qi === currentIdx
                    ? 'var(--primary)'
                    : answers[quiz.questions[qi].id]
                    ? 'var(--primary-light)'
                    : 'var(--border-light)',
                  padding: 0,
                  transition: 'all 0.2s',
                }}
              />
            ))}
          </div>

          <button
            id="quiz-next-btn"
            className="btn btn-primary"
            onClick={handleNext}
            disabled={submitting}
          >
            {submitting ? (
              <><span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> Gönderiliyor...</>
            ) : isLast ? 'Tamamla ✓' : 'Sonraki →'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AttemptPage;
