'use client';

import React, { useEffect, useState, useTransition } from 'react';
import * as knowledgeService from '../../../services/knowledgeManagementService';
import styles from '../../../modules/auth/styles/register.module.css';

export default function KnowledgeManagementPage() {
  const [activeTab, setActiveTab] = useState('articles'); // articles, sops
  const [articles, setArticles] = useState([]);
  const [sops, setSops] = useState([]);

  const [newArticle, setNewArticle] = useState({ title: '', category: 'POLICY', content: '' });
  const [newSop, setNewSop] = useState({ sopTitle: '', department: 'HR', version: '1.0', description: '' });

  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const loadData = () => {
    knowledgeService.getArticles()
      .then(res => setArticles(res || []))
      .catch(err => console.error(err));

    knowledgeService.getSops()
      .then(res => setSops(res || []))
      .catch(err => console.error(err));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateArticle = (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    if (!newArticle.title || !newArticle.content) return setError('Title and Content are required.');

    startTransition(async () => {
      try {
        await knowledgeService.createArticle(newArticle);
        setMessage('Article published to Knowledge Base.');
        setNewArticle({ title: '', category: 'POLICY', content: '' });
        loadData();
      } catch (err) {
        setError(err.message || 'Failed to publish article.');
      }
    });
  };

  const handleCreateSop = (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    if (!newSop.sopTitle) return setError('SOP Title is required.');

    startTransition(async () => {
      try {
        await knowledgeService.createSop(newSop);
        setMessage('Standard Operating Procedure (SOP) recorded.');
        setNewSop({ sopTitle: '', department: 'HR', version: '1.0', description: '' });
        loadData();
      } catch (err) {
        setError(err.message || 'Failed to record SOP.');
      }
    });
  };

  return (
    <div>
      <header className="page-header">
        <h1 className="page-title">Knowledge Management</h1>
        <p className="page-subtitle">Central wiki repository, company policies, FAQs, and Standard Operating Procedures (SOPs)</p>
      </header>

      {error && <div className={`${styles.alert} ${styles.alertDanger}`} style={{ marginBottom: '24px' }}>{error}</div>}
      {message && <div className={styles.alert} style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--accent-success)', marginBottom: '24px' }}>{message}</div>}

      <div style={{ display: 'flex', gap: '12px', borderBottom: '1px solid var(--border-light)', marginBottom: '24px', paddingBottom: '8px' }}>
        <button className={`tab-btn ${activeTab === 'articles' ? 'active' : ''}`} onClick={() => setActiveTab('articles')} style={{ background: activeTab === 'articles' ? 'var(--bg-tertiary)' : 'none', border: 'none', color: '#fff', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer' }}>
          Knowledge Articles & Wiki
        </button>
        <button className={`tab-btn ${activeTab === 'sops' ? 'active' : ''}`} onClick={() => setActiveTab('sops')} style={{ background: activeTab === 'sops' ? 'var(--bg-tertiary)' : 'none', border: 'none', color: '#fff', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer' }}>
          SOP Library
        </button>
      </div>

      {activeTab === 'articles' && (
        <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
          <div style={{ flex: 2, minWidth: '350px' }} className="form-card">
            <h3>Published Wiki Articles</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px' }}>
              {articles.map((art, idx) => (
                <div key={idx} style={{ padding: '16px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <strong style={{ color: 'var(--accent-primary)', fontSize: '1.05rem' }}>{art.title}</strong>
                    <span style={{ fontSize: '0.75rem', background: 'rgba(99,102,241,0.1)', color: 'var(--accent-primary)', padding: '4px 10px', borderRadius: '4px', fontWeight: 'bold' }}>{art.category}</span>
                  </div>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '8px' }}>{art.content}</p>
                </div>
              ))}
              {articles.length === 0 && <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No knowledge articles published.</p>}
            </div>
          </div>

          <div style={{ flex: 1, minWidth: '300px' }} className="form-card">
            <h3>Publish Article</h3>
            <form onSubmit={handleCreateArticle} style={{ marginTop: '16px' }}>
              <div className={styles.formGroup} style={{ marginBottom: '12px' }}>
                <label className={styles.label}>Title</label>
                <input type="text" className={styles.input} placeholder="Remote Work Security Best Practices" value={newArticle.title} onChange={e => setNewArticle({ ...newArticle, title: e.target.value })} disabled={isPending} />
              </div>
              <div className={styles.formGroup} style={{ marginBottom: '12px' }}>
                <label className={styles.label}>Category</label>
                <input type="text" className={styles.input} placeholder="POLICY, SECURITY, ONBOARDING" value={newArticle.category} onChange={e => setNewArticle({ ...newArticle, category: e.target.value })} disabled={isPending} />
              </div>
              <div className={styles.formGroup} style={{ marginBottom: '20px' }}>
                <label className={styles.label}>Article Content</label>
                <textarea className={styles.input} rows="4" placeholder="Always connect to company VPN when working from public Wi-Fi networks..." value={newArticle.content} onChange={e => setNewArticle({ ...newArticle, content: e.target.value })} disabled={isPending}></textarea>
              </div>
              <button type="submit" className={`${styles.btn} ${styles.btnPrimary}`} disabled={isPending}>Publish Article</button>
            </form>
          </div>
        </div>
      )}

      {activeTab === 'sops' && (
        <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
          <div style={{ flex: 2, minWidth: '350px' }} className="form-card">
            <h3>Departmental SOP Library</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px' }}>
              {sops.map((s, idx) => (
                <div key={idx} style={{ padding: '16px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <strong style={{ color: 'var(--accent-primary)' }}>{s.sop_title || s.sopTitle} (v{s.version})</strong>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                      Department: {s.department} | Description: {s.description || 'Standard process guide'}
                    </div>
                  </div>
                  <span style={{ fontSize: '0.75rem', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--accent-success)', padding: '4px 10px', borderRadius: '4px', fontWeight: 'bold' }}>Active SOP</span>
                </div>
              ))}
              {sops.length === 0 && <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No SOP documents registered.</p>}
            </div>
          </div>

          <div style={{ flex: 1, minWidth: '300px' }} className="form-card">
            <h3>Add SOP Document</h3>
            <form onSubmit={handleCreateSop} style={{ marginTop: '16px' }}>
              <div className={styles.formGroup} style={{ marginBottom: '12px' }}>
                <label className={styles.label}>SOP Title</label>
                <input type="text" className={styles.input} placeholder="Monthly Expense Approval Workflow" value={newSop.sopTitle} onChange={e => setNewSop({ ...newSop, sopTitle: e.target.value })} disabled={isPending} />
              </div>
              <div className={styles.formGroup} style={{ marginBottom: '12px' }}>
                <label className={styles.label}>Department</label>
                <input type="text" className={styles.input} placeholder="HR, FINANCE, ENGINEERING" value={newSop.department} onChange={e => setNewSop({ ...newSop, department: e.target.value })} disabled={isPending} />
              </div>
              <div className={styles.formGroup} style={{ marginBottom: '20px' }}>
                <label className={styles.label}>Description</label>
                <textarea className={styles.input} rows="3" placeholder="Step-by-step instructions for submitting corporate expense claims" value={newSop.description} onChange={e => setNewSop({ ...newSop, description: e.target.value })} disabled={isPending}></textarea>
              </div>
              <button type="submit" className={`${styles.btn} ${styles.btnPrimary}`} disabled={isPending}>Save SOP</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
