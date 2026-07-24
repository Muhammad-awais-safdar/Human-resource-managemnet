'use client';

import React, { useEffect, useState, useTransition } from 'react';
import * as searchService from '../../../services/enterpriseSearchService';
import styles from '../../../modules/auth/styles/register.module.css';

export default function EnterpriseSearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);

  const [newIndex, setNewIndex] = useState({ entityType: 'DOCUMENT', title: '', content: '' });

  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const executeSearch = (qStr) => {
    searchService.searchEntities(qStr)
      .then(res => setResults(res || []))
      .catch(err => console.error(err));
  };

  useEffect(() => {
    executeSearch('');
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    executeSearch(query);
  };

  const handleAddIndex = (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    if (!newIndex.title) return setError('Title is required.');

    startTransition(async () => {
      try {
        await searchService.indexEntity(newIndex);
        setMessage('Resource indexed into Enterprise Search.');
        setNewIndex({ entityType: 'DOCUMENT', title: '', content: '' });
        executeSearch(query);
      } catch (err) {
        setError(err.message || 'Failed to index resource.');
      }
    });
  };

  return (
    <div>
      <header className="page-header">
        <h1 className="page-title">Enterprise Search & AI Discovery</h1>
        <p className="page-subtitle">Global indexed search across employees, policies, documents, and knowledge wiki items</p>
      </header>

      {error && <div className={`${styles.alert} ${styles.alertDanger}`} style={{ marginBottom: '24px' }}>{error}</div>}
      {message && <div className={styles.alert} style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--accent-success)', marginBottom: '24px' }}>{message}</div>}

      <div style={{ marginBottom: '24px' }}>
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '12px' }}>
          <input
            type="text"
            className={styles.input}
            style={{ fontSize: '1rem', padding: '12px 16px' }}
            placeholder="Search employees, policies, SOPs, documents..."
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
          <button type="submit" className={`${styles.btn} ${styles.btnPrimary}`} style={{ minWidth: '120px' }}>
            Search
          </button>
        </form>
      </div>

      <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
        <div style={{ flex: 2, minWidth: '350px' }} className="form-card">
          <h3>Search Results ({results.length})</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px' }}>
            {results.map((res, idx) => (
              <div key={idx} style={{ padding: '16px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <strong style={{ color: 'var(--accent-primary)', fontSize: '1.05rem' }}>{res.title}</strong>
                  <span style={{ fontSize: '0.75rem', background: 'rgba(99,102,241,0.1)', color: 'var(--accent-primary)', padding: '4px 10px', borderRadius: '4px', fontWeight: 'bold' }}>{res.entity_type || res.entityType}</span>
                </div>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '8px' }}>{res.content || 'Indexed system record'}</p>
              </div>
            ))}
            {results.length === 0 && <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No search results matched your query.</p>}
          </div>
        </div>

        <div style={{ flex: 1, minWidth: '300px' }} className="form-card">
          <h3>Index Resource</h3>
          <form onSubmit={handleAddIndex} style={{ marginTop: '16px' }}>
            <div className={styles.formGroup} style={{ marginBottom: '12px' }}>
              <label className={styles.label}>Entity Type</label>
              <select className={styles.input} value={newIndex.entityType} onChange={e => setNewIndex({ ...newIndex, entityType: e.target.value })} disabled={isPending}>
                <option value="EMPLOYEE">Employee Record</option>
                <option value="DOCUMENT">Document</option>
                <option value="POLICY">Company Policy</option>
                <option value="KNOWLEDGE_ARTICLE">Knowledge Article</option>
              </select>
            </div>
            <div className={styles.formGroup} style={{ marginBottom: '12px' }}>
              <label className={styles.label}>Resource Title</label>
              <input type="text" className={styles.input} placeholder="2026 Remote Work Travel Policy" value={newIndex.title} onChange={e => setNewIndex({ ...newIndex, title: e.target.value })} disabled={isPending} />
            </div>
            <div className={styles.formGroup} style={{ marginBottom: '20px' }}>
              <label className={styles.label}>Searchable Summary / Keywords</label>
              <textarea className={styles.input} rows="3" placeholder="Covers international travel expense reimbursement limits and flight bookings" value={newIndex.content} onChange={e => setNewIndex({ ...newIndex, content: e.target.value })} disabled={isPending}></textarea>
            </div>
            <button type="submit" className={`${styles.btn} ${styles.btnPrimary}`} disabled={isPending}>Add to Search Index</button>
          </form>
        </div>
      </div>
    </div>
  );
}
