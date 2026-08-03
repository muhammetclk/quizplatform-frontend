import React, { useState, useEffect, useCallback } from 'react';
import { getCategories, getTopics } from '../api/quiz';
import { adminCreateCategory, adminCreateTopic, adminCreateQuiz } from '../api/admin';
import type {
  Category,
  Topic,
  CreateCategoryRequest,
  CreateTopicRequest,
  CreateQuizRequest,
  CreateQuestionRequest,
  CreateOptionRequest,
} from '../types';

// ── Helpers ────────────────────────────────────────────────────────────────

function emptyOption(): CreateOptionRequest {
  return { content: '', isCorrect: false };
}

function emptyQuestion(index: number): CreateQuestionRequest {
  return {
    content: '',
    difficulty: 'MEDIUM',
    explanation: '',
    orderIndex: index,
    options: [emptyOption(), emptyOption(), emptyOption(), emptyOption()],
  };
}

// ── Toast ─────────────────────────────────────────────────────────────────

interface Toast { id: number; message: string; type: 'success' | 'error' }

let toastCounter = 0;

// ── Main Component ────────────────────────────────────────────────────────

const AdminPage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Modal states
  const [showCatModal, setShowCatModal] = useState(false);
  const [showTopicModal, setShowTopicModal] = useState(false);
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [selectedTopicForQuiz, setSelectedTopicForQuiz] = useState<Topic | null>(null);

  // Loading states
  const [catLoading, setCatLoading] = useState(false);
  const [topicLoading, setTopicLoading] = useState(false);
  const [quizLoading, setQuizLoading] = useState(false);

  // ── Toast helpers ──────────────────────────────────────────────────────
  const addToast = useCallback((message: string, type: 'success' | 'error') => {
    const id = ++toastCounter;
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  }, []);

  // ── Data loading ───────────────────────────────────────────────────────
  const loadCategories = useCallback(async () => {
    try {
      const cats = await getCategories();
      setCategories(cats);
    } catch {
      addToast('Kategoriler yüklenemedi.', 'error');
    }
  }, [addToast]);

  const loadTopics = useCallback(async (categoryId: string) => {
    try {
      const tops = await getTopics(categoryId);
      setTopics(tops);
    } catch {
      addToast('Konular yüklenemedi.', 'error');
    }
  }, [addToast]);

  useEffect(() => { loadCategories(); }, [loadCategories]);

  useEffect(() => {
    if (selectedCategory) loadTopics(selectedCategory.id);
    else setTopics([]);
  }, [selectedCategory, loadTopics]);

  // ── Category form ──────────────────────────────────────────────────────
  const [catForm, setCatForm] = useState<CreateCategoryRequest>({
    name: '', slug: '', iconUrl: '', colorHex: '#6366f1', orderIndex: 0,
  });

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    setCatLoading(true);
    try {
      await adminCreateCategory(catForm);
      addToast(`"${catForm.name}" kategorisi oluşturuldu! ✓`, 'success');
      setShowCatModal(false);
      setCatForm({ name: '', slug: '', iconUrl: '', colorHex: '#6366f1', orderIndex: 0 });
      await loadCategories();
    } catch (err: any) {
      addToast(err.response?.data?.message || 'Kategori oluşturulamadı.', 'error');
    } finally {
      setCatLoading(false);
    }
  };

  // ── Topic form ─────────────────────────────────────────────────────────
  const [topicForm, setTopicForm] = useState<CreateTopicRequest>({
    categoryId: '',
    name: '',
    slug: '',
    description: '',
    difficultyLevel: 'BEGINNER',
    orderIndex: 0,
  });

  const openTopicModal = () => {
    if (!selectedCategory) { addToast('Önce bir kategori seçin.', 'error'); return; }
    setTopicForm(f => ({ ...f, categoryId: selectedCategory.id }));
    setShowTopicModal(true);
  };

  const handleCreateTopic = async (e: React.FormEvent) => {
    e.preventDefault();
    setTopicLoading(true);
    try {
      await adminCreateTopic(topicForm);
      addToast(`"${topicForm.name}" konusu oluşturuldu! ✓`, 'success');
      setShowTopicModal(false);
      setTopicForm({ categoryId: selectedCategory?.id || '', name: '', slug: '', description: '', difficultyLevel: 'BEGINNER', orderIndex: 0 });
      if (selectedCategory) await loadTopics(selectedCategory.id);
    } catch (err: any) {
      addToast(err.response?.data?.message || 'Konu oluşturulamadı.', 'error');
    } finally {
      setTopicLoading(false);
    }
  };

  // ── Quiz form ──────────────────────────────────────────────────────────
  const [quizForm, setQuizForm] = useState<CreateQuizRequest>({
    topicId: '',
    title: '',
    description: '',
    difficulty: 'MEDIUM',
    timeLimitSec: 600,
    isPublished: true,
    questions: [emptyQuestion(0)],
  });

  const openQuizModal = (topic: Topic) => {
    setSelectedTopicForQuiz(topic);
    setQuizForm({
      topicId: topic.id,
      title: '',
      description: '',
      difficulty: 'MEDIUM',
      timeLimitSec: 600,
      isPublished: true,
      questions: [emptyQuestion(0)],
    });
    setShowQuizModal(true);
  };

  const addQuestion = () => {
    setQuizForm(f => ({
      ...f,
      questions: [...f.questions, emptyQuestion(f.questions.length)],
    }));
  };

  const removeQuestion = (qi: number) => {
    setQuizForm(f => ({ ...f, questions: f.questions.filter((_, i) => i !== qi) }));
  };

  const updateQuestion = (qi: number, field: keyof CreateQuestionRequest, value: any) => {
    setQuizForm(f => {
      const qs = [...f.questions];
      qs[qi] = { ...qs[qi], [field]: value };
      return { ...f, questions: qs };
    });
  };

  const updateOption = (qi: number, oi: number, field: keyof CreateOptionRequest, value: any) => {
    setQuizForm(f => {
      const qs = [...f.questions];
      const opts = [...qs[qi].options];
      if (field === 'isCorrect' && value === true) {
        // radio-style: only one correct per question
        opts.forEach((o, i) => { opts[i] = { ...o, isCorrect: i === oi }; });
      } else {
        opts[oi] = { ...opts[oi], [field]: value };
      }
      qs[qi] = { ...qs[qi], options: opts };
      return { ...f, questions: qs };
    });
  };

  const addOption = (qi: number) => {
    setQuizForm(f => {
      const qs = [...f.questions];
      qs[qi] = { ...qs[qi], options: [...qs[qi].options, emptyOption()] };
      return { ...f, questions: qs };
    });
  };

  const removeOption = (qi: number, oi: number) => {
    setQuizForm(f => {
      const qs = [...f.questions];
      qs[qi] = { ...qs[qi], options: qs[qi].options.filter((_, i) => i !== oi) };
      return { ...f, questions: qs };
    });
  };

  const handleCreateQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    // Validation: every question must have exactly one correct option
    for (let i = 0; i < quizForm.questions.length; i++) {
      const correctCount = quizForm.questions[i].options.filter(o => o.isCorrect).length;
      if (correctCount !== 1) {
        addToast(`Soru ${i + 1}: Tam olarak 1 doğru seçenek işaretlenmeli.`, 'error');
        return;
      }
    }
    setQuizLoading(true);
    try {
      const payload: CreateQuizRequest = {
        ...quizForm,
        questions: quizForm.questions.map((q, qi) => ({
          ...q,
          orderIndex: qi,
          options: q.options.map((o, oi) => ({ ...o, orderIndex: oi })),
        })),
      };
      await adminCreateQuiz(payload);
      addToast(`"${quizForm.title}" quiz'i oluşturuldu! ✓`, 'success');
      setShowQuizModal(false);
    } catch (err: any) {
      addToast(err.response?.data?.message || 'Quiz oluşturulamadı.', 'error');
    } finally {
      setQuizLoading(false);
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────
  return (
    <>
      {/* ── Toast stack ─────────────────────────────────── */}
      <div className="admin-toast-stack">
        {toasts.map(t => (
          <div key={t.id} className={`admin-toast admin-toast--${t.type}`}>{t.message}</div>
        ))}
      </div>

      <div className="admin-page">
        {/* Header */}
        <div className="admin-header">
          <div>
            <h1 className="admin-title">
              <span className="admin-title-icon">⚡</span> Admin Paneli
            </h1>
            <p className="admin-subtitle">Kategoriler, konular ve quizleri buradan yönetin.</p>
          </div>
          <button
            id="admin-add-category-btn"
            className="admin-btn admin-btn--primary"
            onClick={() => setShowCatModal(true)}
          >
            + Kategori Ekle
          </button>
        </div>

        {/* Main layout */}
        <div className="admin-layout">
          {/* ── Left panel: Categories ───────────────────── */}
          <aside className="admin-panel admin-panel--left">
            <h2 className="admin-panel-title">Kategoriler <span className="admin-badge">{categories.length}</span></h2>
            {categories.length === 0 ? (
              <div className="admin-empty">
                <p>Henüz kategori yok.</p>
                <button className="admin-btn admin-btn--ghost" onClick={() => setShowCatModal(true)}>
                  + İlk kategoriyi oluştur
                </button>
              </div>
            ) : (
              <ul className="admin-cat-list">
                {categories.map(cat => (
                  <li
                    key={cat.id}
                    className={`admin-cat-item ${selectedCategory?.id === cat.id ? 'admin-cat-item--active' : ''}`}
                    onClick={() => setSelectedCategory(cat)}
                    style={{ '--cat-color': cat.colorHex || '#6366f1' } as React.CSSProperties}
                  >
                    <span className="admin-cat-dot" />
                    <span className="admin-cat-name">{cat.name}</span>
                    {selectedCategory?.id === cat.id && (
                      <span className="admin-cat-arrow">›</span>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </aside>

          {/* ── Right panel: Topics & Quizzes ───────────── */}
          <main className="admin-panel admin-panel--right">
            {!selectedCategory ? (
              <div className="admin-empty admin-empty--center">
                <div className="admin-empty-icon">📂</div>
                <h3>Bir kategori seçin</h3>
                <p>Sol taraftan bir kategori seçerek konuları ve quizleri yönetin.</p>
              </div>
            ) : (
              <>
                <div className="admin-panel-header">
                  <div>
                    <h2 className="admin-panel-title">
                      {selectedCategory.name}
                      <span className="admin-badge">{topics.length} konu</span>
                    </h2>
                  </div>
                  <button
                    id="admin-add-topic-btn"
                    className="admin-btn admin-btn--secondary"
                    onClick={openTopicModal}
                  >
                    + Konu Ekle
                  </button>
                </div>

                {topics.length === 0 ? (
                  <div className="admin-empty">
                    <p>Bu kategoride henüz konu yok.</p>
                    <button className="admin-btn admin-btn--ghost" onClick={openTopicModal}>
                      + İlk konuyu oluştur
                    </button>
                  </div>
                ) : (
                  <div className="admin-topic-grid">
                    {topics.map(topic => (
                      <div key={topic.id} className="admin-topic-card">
                        <div className="admin-topic-card-header">
                          <div>
                            <h3 className="admin-topic-name">{topic.name}</h3>
                            {topic.description && (
                              <p className="admin-topic-desc">{topic.description}</p>
                            )}
                          </div>
                          <span className={`admin-difficulty-badge admin-difficulty-badge--${topic.difficultyLevel?.toLowerCase()}`}>
                            {topic.difficultyLevel}
                          </span>
                        </div>
                        <button
                          className="admin-btn admin-btn--quiz"
                          onClick={() => openQuizModal(topic)}
                        >
                          + Quiz Yükle
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>

      {/* ══ Modal: Create Category ════════════════════════════════════════════ */}
      {showCatModal && (
        <div className="admin-modal-overlay" onClick={() => setShowCatModal(false)}>
          <div className="admin-modal" onClick={e => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h2 className="admin-modal-title">Yeni Kategori</h2>
              <button className="admin-modal-close" onClick={() => setShowCatModal(false)}>✕</button>
            </div>
            <form onSubmit={handleCreateCategory} className="admin-form">
              <div className="admin-form-group">
                <label className="admin-form-label">Kategori Adı *</label>
                <input
                  id="cat-name"
                  className="admin-form-input"
                  placeholder="örn: Matematik"
                  value={catForm.name}
                  onChange={e => setCatForm(f => ({ ...f, name: e.target.value }))}
                  required
                />
              </div>
              <div className="admin-form-group">
                <label className="admin-form-label">Slug (boş bırakılırsa otomatik)</label>
                <input
                  id="cat-slug"
                  className="admin-form-input"
                  placeholder="matematik"
                  value={catForm.slug}
                  onChange={e => setCatForm(f => ({ ...f, slug: e.target.value }))}
                />
              </div>
              <div className="admin-form-row">
                <div className="admin-form-group">
                  <label className="admin-form-label">İkon URL</label>
                  <input
                    id="cat-icon"
                    className="admin-form-input"
                    placeholder="https://..."
                    value={catForm.iconUrl}
                    onChange={e => setCatForm(f => ({ ...f, iconUrl: e.target.value }))}
                  />
                </div>
                <div className="admin-form-group admin-form-group--color">
                  <label className="admin-form-label">Renk</label>
                  <div className="admin-color-picker-wrap">
                    <input
                      id="cat-color"
                      type="color"
                      className="admin-color-input"
                      value={catForm.colorHex}
                      onChange={e => setCatForm(f => ({ ...f, colorHex: e.target.value }))}
                    />
                    <span className="admin-color-label">{catForm.colorHex}</span>
                  </div>
                </div>
                <div className="admin-form-group admin-form-group--sm">
                  <label className="admin-form-label">Sıra</label>
                  <input
                    id="cat-order"
                    type="number"
                    className="admin-form-input"
                    value={catForm.orderIndex}
                    onChange={e => setCatForm(f => ({ ...f, orderIndex: parseInt(e.target.value) || 0 }))}
                    min={0}
                  />
                </div>
              </div>
              <div className="admin-modal-actions">
                <button type="button" className="admin-btn admin-btn--ghost" onClick={() => setShowCatModal(false)}>İptal</button>
                <button id="cat-submit" type="submit" className="admin-btn admin-btn--primary" disabled={catLoading}>
                  {catLoading ? <span className="admin-spinner" /> : 'Oluştur'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ══ Modal: Create Topic ═══════════════════════════════════════════════ */}
      {showTopicModal && (
        <div className="admin-modal-overlay" onClick={() => setShowTopicModal(false)}>
          <div className="admin-modal" onClick={e => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h2 className="admin-modal-title">Yeni Konu — <em>{selectedCategory?.name}</em></h2>
              <button className="admin-modal-close" onClick={() => setShowTopicModal(false)}>✕</button>
            </div>
            <form onSubmit={handleCreateTopic} className="admin-form">
              <div className="admin-form-group">
                <label className="admin-form-label">Konu Adı *</label>
                <input
                  id="topic-name"
                  className="admin-form-input"
                  placeholder="örn: Türevler"
                  value={topicForm.name}
                  onChange={e => setTopicForm(f => ({ ...f, name: e.target.value }))}
                  required
                />
              </div>
              <div className="admin-form-group">
                <label className="admin-form-label">Açıklama</label>
                <textarea
                  id="topic-desc"
                  className="admin-form-input admin-form-textarea"
                  placeholder="Bu konu hakkında kısa bir açıklama..."
                  value={topicForm.description}
                  onChange={e => setTopicForm(f => ({ ...f, description: e.target.value }))}
                />
              </div>
              <div className="admin-form-row">
                <div className="admin-form-group">
                  <label className="admin-form-label">Zorluk Seviyesi</label>
                  <select
                    id="topic-difficulty"
                    className="admin-form-input admin-form-select"
                    value={topicForm.difficultyLevel}
                    onChange={e => setTopicForm(f => ({ ...f, difficultyLevel: e.target.value as any }))}
                  >
                    <option value="BEGINNER">Başlangıç</option>
                    <option value="INTERMEDIATE">Orta</option>
                    <option value="ADVANCED">İleri</option>
                  </select>
                </div>
                <div className="admin-form-group admin-form-group--sm">
                  <label className="admin-form-label">Sıra</label>
                  <input
                    id="topic-order"
                    type="number"
                    className="admin-form-input"
                    value={topicForm.orderIndex}
                    onChange={e => setTopicForm(f => ({ ...f, orderIndex: parseInt(e.target.value) || 0 }))}
                    min={0}
                  />
                </div>
              </div>
              <div className="admin-modal-actions">
                <button type="button" className="admin-btn admin-btn--ghost" onClick={() => setShowTopicModal(false)}>İptal</button>
                <button id="topic-submit" type="submit" className="admin-btn admin-btn--primary" disabled={topicLoading}>
                  {topicLoading ? <span className="admin-spinner" /> : 'Oluştur'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ══ Modal: Create Quiz ════════════════════════════════════════════════ */}
      {showQuizModal && (
        <div className="admin-modal-overlay" onClick={() => setShowQuizModal(false)}>
          <div className="admin-modal admin-modal--wide" onClick={e => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h2 className="admin-modal-title">Quiz Yükle — <em>{selectedTopicForQuiz?.name}</em></h2>
              <button className="admin-modal-close" onClick={() => setShowQuizModal(false)}>✕</button>
            </div>
            <form onSubmit={handleCreateQuiz} className="admin-form admin-form--scroll">

              {/* Quiz meta */}
              <div className="admin-quiz-meta">
                <div className="admin-form-group admin-form-group--grow">
                  <label className="admin-form-label">Quiz Başlığı *</label>
                  <input
                    id="quiz-title"
                    className="admin-form-input"
                    placeholder="örn: Türevler - Temel Sorular"
                    value={quizForm.title}
                    onChange={e => setQuizForm(f => ({ ...f, title: e.target.value }))}
                    required
                  />
                </div>
                <div className="admin-form-group">
                  <label className="admin-form-label">Zorluk</label>
                  <select
                    id="quiz-difficulty"
                    className="admin-form-input admin-form-select"
                    value={quizForm.difficulty}
                    onChange={e => setQuizForm(f => ({ ...f, difficulty: e.target.value as any }))}
                  >
                    <option value="EASY">Kolay</option>
                    <option value="MEDIUM">Orta</option>
                    <option value="HARD">Zor</option>
                  </select>
                </div>
                <div className="admin-form-group admin-form-group--sm">
                  <label className="admin-form-label">Süre (sn)</label>
                  <input
                    id="quiz-time"
                    type="number"
                    className="admin-form-input"
                    value={quizForm.timeLimitSec}
                    onChange={e => setQuizForm(f => ({ ...f, timeLimitSec: parseInt(e.target.value) || 600 }))}
                    min={30}
                  />
                </div>
                <div className="admin-form-group admin-form-group--checkbox">
                  <label className="admin-form-label">Yayınla</label>
                  <label className="admin-toggle">
                    <input
                      id="quiz-published"
                      type="checkbox"
                      checked={quizForm.isPublished}
                      onChange={e => setQuizForm(f => ({ ...f, isPublished: e.target.checked }))}
                    />
                    <span className="admin-toggle-slider" />
                  </label>
                </div>
              </div>

              <div className="admin-form-group">
                <label className="admin-form-label">Açıklama</label>
                <textarea
                  id="quiz-desc"
                  className="admin-form-input admin-form-textarea"
                  placeholder="Quiz hakkında kısa bir açıklama..."
                  value={quizForm.description}
                  onChange={e => setQuizForm(f => ({ ...f, description: e.target.value }))}
                />
              </div>

              {/* Questions */}
              <div className="admin-questions-header">
                <h3 className="admin-section-title">Sorular <span className="admin-badge">{quizForm.questions.length}</span></h3>
                <button type="button" className="admin-btn admin-btn--secondary admin-btn--sm" onClick={addQuestion}>
                  + Soru Ekle
                </button>
              </div>

              <div className="admin-questions-list">
                {quizForm.questions.map((q, qi) => (
                  <div key={qi} className="admin-question-card">
                    <div className="admin-question-header">
                      <span className="admin-question-num">Soru {qi + 1}</span>
                      <div className="admin-question-actions">
                        <select
                          className="admin-form-input admin-form-select admin-form-select--xs"
                          value={q.difficulty}
                          onChange={e => updateQuestion(qi, 'difficulty', e.target.value)}
                        >
                          <option value="EASY">Kolay</option>
                          <option value="MEDIUM">Orta</option>
                          <option value="HARD">Zor</option>
                        </select>
                        {quizForm.questions.length > 1 && (
                          <button
                            type="button"
                            className="admin-btn admin-btn--danger admin-btn--xs"
                            onClick={() => removeQuestion(qi)}
                          >✕</button>
                        )}
                      </div>
                    </div>

                    <textarea
                      className="admin-form-input admin-form-textarea admin-question-text"
                      placeholder={`Soru ${qi + 1} içeriği...`}
                      value={q.content}
                      onChange={e => updateQuestion(qi, 'content', e.target.value)}
                      required
                    />

                    {/* Options */}
                    <div className="admin-options-list">
                      {q.options.map((opt, oi) => (
                        <div key={oi} className={`admin-option-row ${opt.isCorrect ? 'admin-option-row--correct' : ''}`}>
                          <input
                            type="radio"
                            name={`correct-${qi}`}
                            className="admin-option-radio"
                            checked={opt.isCorrect}
                            onChange={() => updateOption(qi, oi, 'isCorrect', true)}
                            title="Doğru cevap olarak işaretle"
                          />
                          <input
                            type="text"
                            className="admin-form-input admin-option-input"
                            placeholder={`Seçenek ${String.fromCharCode(65 + oi)}`}
                            value={opt.content}
                            onChange={e => updateOption(qi, oi, 'content', e.target.value)}
                            required
                          />
                          {q.options.length > 2 && (
                            <button
                              type="button"
                              className="admin-btn admin-btn--ghost admin-btn--xs"
                              onClick={() => removeOption(qi, oi)}
                            >✕</button>
                          )}
                        </div>
                      ))}
                      <button
                        type="button"
                        className="admin-btn admin-btn--ghost admin-btn--sm"
                        onClick={() => addOption(qi)}
                      >
                        + Seçenek ekle
                      </button>
                    </div>

                    <div className="admin-form-group" style={{ marginTop: 12 }}>
                      <label className="admin-form-label">Açıklama (opsiyonel)</label>
                      <input
                        type="text"
                        className="admin-form-input"
                        placeholder="Doğru cevabın açıklaması..."
                        value={q.explanation || ''}
                        onChange={e => updateQuestion(qi, 'explanation', e.target.value)}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="admin-modal-actions admin-modal-actions--sticky">
                <button type="button" className="admin-btn admin-btn--ghost" onClick={() => setShowQuizModal(false)}>İptal</button>
                <button id="quiz-submit" type="submit" className="admin-btn admin-btn--primary" disabled={quizLoading}>
                  {quizLoading ? <><span className="admin-spinner" /> Yükleniyor...</> : `${quizForm.questions.length} Soru ile Quiz Oluştur`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminPage;
