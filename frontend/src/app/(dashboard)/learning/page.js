'use client';

import React, { useEffect, useState } from 'react';
import * as suiteService from '../../../services/suiteService';

export default function LmsPage() {
  const [myCourses, setMyCourses] = useState([]);
  const [allCourses, setAllCourses] = useState([]);
  const [activeTab, setActiveTab] = useState('enrolled');
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [quizzes, setQuizzes] = useState([]);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizResults, setQuizResults] = useState({});
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  const loadData = () => {
    Promise.all([
      suiteService.getCourses().catch(() => []),
      suiteService.getAllCourses().catch(() => []),
    ]).then(([mine, all]) => { setMyCourses(mine); setAllCourses(all); }).finally(() => setLoading(false));
  };

  useEffect(() => { loadData(); }, []);

  const handleEnroll = async (courseId) => {
    try {
      await suiteService.enrollCourse(courseId);
      setMessage('✅ Enrolled successfully!');
      loadData();
    } catch { setMessage('❌ Failed to enroll.'); }
  };

  const handleOpenQuiz = async (courseId, courseTitle) => {
    setSelectedCourse(courseTitle);
    setQuizzes([]);
    setQuizAnswers({});
    setQuizResults({});
    try {
      const data = await suiteService.getCourseQuizzes(courseId);
      setQuizzes(data);
      setActiveTab('quiz');
    } catch { setMessage('❌ Failed to load quizzes.'); }
  };

  const handleSubmitAnswer = async (quizId) => {
    const answer = quizAnswers[quizId];
    if (!answer) return;
    try {
      const result = await suiteService.submitQuizAnswer(quizId, answer);
      setQuizResults(prev => ({ ...prev, [quizId]: result }));
    } catch { setMessage('❌ Failed to submit answer.'); }
  };

  const categoryColor = { TECHNICAL: '#06b6d4', SOFT_SKILLS: '#818cf8', COMPLIANCE: '#f59e0b', LEADERSHIP: '#10b981' };

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <span style={styles.icon}>🎓</span>
        <h1 style={styles.title}>Learning Management System</h1>
        <p style={styles.subtitle}>Enroll in courses, complete quizzes, and grow your skills</p>
      </div>

      {message && (
        <div style={{ ...styles.alert, background: message.startsWith('✅') ? '#064e3b' : '#7f1d1d' }}>
          {message}
        </div>
      )}

      {/* Tabs */}
      <div style={styles.tabs}>
        {[
          { id: 'enrolled', label: '📚 My Courses' },
          { id: 'catalog', label: '🔍 Course Catalog' },
          { id: 'quiz', label: '📝 Quizzes', disabled: quizzes.length === 0 },
        ].map(t => (
          <button key={t.id} onClick={() => !t.disabled && setActiveTab(t.id)}
            style={{ ...styles.tab, ...(activeTab === t.id ? styles.tabActive : {}), opacity: t.disabled ? 0.4 : 1, cursor: t.disabled ? 'default' : 'pointer' }}>
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={styles.loadingBar}><div style={styles.loadingProgress} /></div>
      ) : (
        <>
          {/* My Enrolled Courses */}
          {activeTab === 'enrolled' && (
            <div style={styles.courseGrid}>
              {myCourses.length === 0 ? (
                <div style={{ ...styles.card, gridColumn: '1 / -1' }}>
                  <p style={styles.empty}>No courses enrolled. Visit the catalog to enroll!</p>
                </div>
              ) : (
                myCourses.map((c, i) => (
                  <div key={i} style={styles.courseCard}>
                    <div style={{ ...styles.courseBadge, background: `${categoryColor[c.category] || '#64748b'}20`, color: categoryColor[c.category] || '#64748b' }}>
                      {c.category}
                    </div>
                    <h3 style={styles.courseTitle}>{c.title}</h3>
                    <p style={styles.courseDesc}>{c.description}</p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                      <span style={{ color: c.status === 'COMPLETED' ? '#10b981' : '#f59e0b', fontSize: '0.8rem', fontWeight: 600 }}>{c.status}</span>
                      <button style={styles.quizBtn} onClick={() => handleOpenQuiz(c.id, c.title)}>📝 Take Quiz</button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Course Catalog */}
          {activeTab === 'catalog' && (
            <div style={styles.courseGrid}>
              {allCourses.length === 0 ? (
                <div style={{ ...styles.card, gridColumn: '1 / -1' }}>
                  <p style={styles.empty}>No courses available in the catalog yet.</p>
                </div>
              ) : (
                allCourses.map((c, i) => {
                  const isEnrolled = myCourses.some(mc => mc.id === c.id);
                  return (
                    <div key={i} style={styles.courseCard}>
                      <div style={{ ...styles.courseBadge, background: `${categoryColor[c.category] || '#64748b'}20`, color: categoryColor[c.category] || '#64748b' }}>
                        {c.category}
                      </div>
                      <h3 style={styles.courseTitle}>{c.title}</h3>
                      <p style={styles.courseDesc}>{c.description}</p>
                      <button
                        style={{ ...styles.enrollBtn, ...(isEnrolled ? styles.enrolledBtn : {}) }}
                        onClick={() => !isEnrolled && handleEnroll(c.id)}
                        disabled={isEnrolled}
                      >
                        {isEnrolled ? '✓ Enrolled' : '+ Enroll'}
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* Quiz Panel */}
          {activeTab === 'quiz' && (
            <div style={styles.card}>
              <h2 style={styles.quizHeading}>📝 {selectedCourse} — Quiz</h2>
              {quizzes.length === 0 ? (
                <p style={styles.empty}>No quizzes available for this course.</p>
              ) : (
                quizzes.map((q, i) => (
                  <div key={i} style={styles.quizCard}>
                    <p style={styles.question}><strong>Q{i + 1}.</strong> {q.question}</p>
                    <div style={styles.optionGrid}>
                      {['A', 'B', 'C', 'D'].map(opt => {
                        const val = q[`option_${opt.toLowerCase()}`];
                        if (!val) return null;
                        const selected = quizAnswers[q.id] === opt;
                        const result = quizResults[q.id];
                        const isCorrect = result && opt === result.correctAnswer;
                        const isWrong = result && selected && !result.correct;
                        return (
                          <button key={opt}
                            onClick={() => !result && setQuizAnswers(prev => ({ ...prev, [q.id]: opt }))}
                            style={{
                              ...styles.optionBtn,
                              background: isCorrect ? 'rgba(16,185,129,0.2)' : isWrong ? 'rgba(239,68,68,0.2)' : selected ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.04)',
                              border: `1px solid ${isCorrect ? '#10b981' : isWrong ? '#ef4444' : selected ? '#6366f1' : 'rgba(255,255,255,0.08)'}`,
                              color: isCorrect ? '#10b981' : isWrong ? '#ef4444' : '#f1f5f9',
                            }}>
                            <strong>{opt}.</strong> {val}
                          </button>
                        );
                      })}
                    </div>
                    {quizResults[q.id] ? (
                      <p style={{ color: quizResults[q.id].correct ? '#10b981' : '#ef4444', fontWeight: 600, marginTop: '8px', fontSize: '0.9rem' }}>
                        {quizResults[q.id].message}
                      </p>
                    ) : (
                      <button style={styles.submitBtn} onClick={() => handleSubmitAnswer(q.id)}>Submit Answer</button>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

const styles = {
  page: { minHeight: '100vh', background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', padding: '32px', color: '#f1f5f9', fontFamily: "'Inter', sans-serif" },
  header: { textAlign: 'center', marginBottom: '32px' },
  icon: { fontSize: '48px' },
  title: { fontSize: '2rem', fontWeight: 700, margin: '8px 0 4px', background: 'linear-gradient(90deg, #f59e0b, #ef4444)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' },
  subtitle: { color: '#94a3b8', fontSize: '0.95rem', margin: 0 },
  alert: { borderRadius: '10px', padding: '12px 20px', marginBottom: '20px', color: '#fff', fontWeight: 500 },
  tabs: { display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' },
  tab: { padding: '9px 16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.12)', background: 'transparent', color: '#94a3b8', fontWeight: 500, fontSize: '0.85rem', transition: 'all 0.2s' },
  tabActive: { background: 'rgba(245,158,11,0.2)', border: '1px solid #f59e0b', color: '#f59e0b' },
  card: { background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', padding: '24px' },
  courseGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' },
  courseCard: { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '10px', transition: 'transform 0.2s', cursor: 'default' },
  courseBadge: { borderRadius: '6px', padding: '2px 10px', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', width: 'fit-content', letterSpacing: '0.06em' },
  courseTitle: { fontSize: '1rem', fontWeight: 700, margin: 0, color: '#e2e8f0' },
  courseDesc: { fontSize: '0.85rem', color: '#94a3b8', margin: 0, lineHeight: 1.5 },
  enrollBtn: { padding: '8px 18px', border: 'none', borderRadius: '8px', background: 'linear-gradient(90deg, #f59e0b, #ef4444)', color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: '0.85rem', marginTop: 'auto' },
  enrolledBtn: { background: 'rgba(16,185,129,0.2)', color: '#10b981', cursor: 'default' },
  quizBtn: { padding: '6px 14px', border: '1px solid #818cf8', borderRadius: '6px', background: 'transparent', color: '#818cf8', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 },
  quizHeading: { fontSize: '1.15rem', fontWeight: 700, marginBottom: '20px', color: '#e2e8f0' },
  quizCard: { background: 'rgba(255,255,255,0.03)', borderRadius: '12px', padding: '18px', marginBottom: '16px', border: '1px solid rgba(255,255,255,0.07)' },
  question: { fontSize: '0.95rem', margin: '0 0 14px' },
  optionGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' },
  optionBtn: { padding: '10px 14px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem', textAlign: 'left', transition: 'all 0.15s' },
  submitBtn: { marginTop: '12px', padding: '8px 18px', background: 'linear-gradient(90deg, #818cf8, #06b6d4)', border: 'none', borderRadius: '8px', color: '#fff', fontWeight: 600, cursor: 'pointer', fontSize: '0.85rem' },
  empty: { color: '#475569', textAlign: 'center', padding: '32px 0' },
  loadingBar: { height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', overflow: 'hidden', marginBottom: '20px' },
  loadingProgress: { height: '100%', width: '60%', background: 'linear-gradient(90deg, #f59e0b, #ef4444)', borderRadius: '2px' },
};
