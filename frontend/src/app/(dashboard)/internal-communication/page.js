'use client';

import React, { useEffect, useState, useTransition } from 'react';
import * as commsService from '../../../services/internalCommunicationService';
import styles from '../../../modules/auth/styles/register.module.css';

export default function InternalCommunicationPage() {
  const [activeTab, setActiveTab] = useState('feed'); // feed, polls
  const [posts, setPosts] = useState([]);
  const [polls, setPolls] = useState([]);

  const [newPost, setNewPost] = useState({ title: '', feedType: 'ANNOUNCEMENT', content: '' });
  const [newPoll, setNewPoll] = useState({ question: '', optionsJson: '["Option A", "Option B"]' });

  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const loadData = () => {
    commsService.getFeedPosts()
      .then(res => setPosts(res || []))
      .catch(err => console.error(err));

    commsService.getPolls()
      .then(res => setPolls(res || []))
      .catch(err => console.error(err));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreatePost = (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    if (!newPost.title || !newPost.content) return setError('Title and Content are required.');

    startTransition(async () => {
      try {
        await commsService.createFeedPost(newPost);
        setMessage('Company announcement posted to feed.');
        setNewPost({ title: '', feedType: 'ANNOUNCEMENT', content: '' });
        loadData();
      } catch (err) {
        setError(err.message || 'Failed to post announcement.');
      }
    });
  };

  const handleCreatePoll = (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    if (!newPoll.question) return setError('Question is required.');

    startTransition(async () => {
      try {
        await commsService.createPoll(newPoll);
        setMessage('Company poll published.');
        setNewPoll({ question: '', optionsJson: '["Option A", "Option B"]' });
        loadData();
      } catch (err) {
        setError(err.message || 'Failed to publish poll.');
      }
    });
  };

  return (
    <div>
      <header className="page-header">
        <h1 className="page-title">Internal Communication</h1>
        <p className="page-subtitle">Company announcements, departmental activity feeds, pulse polls, and birthday/anniversary reminders</p>
      </header>

      {error && <div className={`${styles.alert} ${styles.alertDanger}`} style={{ marginBottom: '24px' }}>{error}</div>}
      {message && <div className={styles.alert} style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--accent-success)', marginBottom: '24px' }}>{message}</div>}

      <div style={{ display: 'flex', gap: '12px', borderBottom: '1px solid var(--border-light)', marginBottom: '24px', paddingBottom: '8px' }}>
        <button className={`tab-btn ${activeTab === 'feed' ? 'active' : ''}`} onClick={() => setActiveTab('feed')} style={{ background: activeTab === 'feed' ? 'var(--bg-tertiary)' : 'none', border: 'none', color: '#fff', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer' }}>
          Company Announcement Feed
        </button>
        <button className={`tab-btn ${activeTab === 'polls' ? 'active' : ''}`} onClick={() => setActiveTab('polls')} style={{ background: activeTab === 'polls' ? 'var(--bg-tertiary)' : 'none', border: 'none', color: '#fff', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer' }}>
          Live Company Polls
        </button>
      </div>

      {activeTab === 'feed' && (
        <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
          <div style={{ flex: 2, minWidth: '350px' }} className="form-card">
            <h3>Feed Posts & Broadcasts</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px' }}>
              {posts.map((p, idx) => (
                <div key={idx} style={{ padding: '16px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <strong style={{ color: 'var(--accent-primary)', fontSize: '1.05rem' }}>{p.title}</strong>
                    <span style={{ fontSize: '0.75rem', background: 'rgba(99,102,241,0.1)', color: 'var(--accent-primary)', padding: '4px 10px', borderRadius: '4px', fontWeight: 'bold' }}>{p.feed_type || p.feedType}</span>
                  </div>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '8px' }}>{p.content}</p>
                </div>
              ))}
              {posts.length === 0 && <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No feed announcements posted yet.</p>}
            </div>
          </div>

          <div style={{ flex: 1, minWidth: '300px' }} className="form-card">
            <h3>Post Announcement</h3>
            <form onSubmit={handleCreatePost} style={{ marginTop: '16px' }}>
              <div className={styles.formGroup} style={{ marginBottom: '12px' }}>
                <label className={styles.label}>Post Title</label>
                <input type="text" className={styles.input} placeholder="Q4 All-Hands Townhall Meeting" value={newPost.title} onChange={e => setNewPost({ ...newPost, title: e.target.value })} disabled={isPending} />
              </div>
              <div className={styles.formGroup} style={{ marginBottom: '12px' }}>
                <label className={styles.label}>Feed Category</label>
                <select className={styles.input} value={newPost.feedType} onChange={e => setNewPost({ ...newPost, feedType: e.target.value })} disabled={isPending}>
                  <option value="ANNOUNCEMENT">Executive Announcement</option>
                  <option value="DEPARTMENT">Departmental Update</option>
                  <option value="EVENT">Company Event</option>
                </select>
              </div>
              <div className={styles.formGroup} style={{ marginBottom: '20px' }}>
                <label className={styles.label}>Post Content</label>
                <textarea className={styles.input} rows="4" placeholder="Join us this Thursday at 3:00 PM EST for the executive product strategy roadmap broadcast..." value={newPost.content} onChange={e => setNewPost({ ...newPost, content: e.target.value })} disabled={isPending}></textarea>
              </div>
              <button type="submit" className={`${styles.btn} ${styles.btnPrimary}`} disabled={isPending}>Publish Post</button>
            </form>
          </div>
        </div>
      )}

      {activeTab === 'polls' && (
        <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
          <div style={{ flex: 2, minWidth: '350px' }} className="form-card">
            <h3>Active Polls</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px' }}>
              {polls.map((pl, idx) => (
                <div key={idx} style={{ padding: '16px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <strong style={{ color: 'var(--accent-primary)' }}>{pl.question}</strong>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                      Options: {pl.options_json || pl.optionsJson}
                    </div>
                  </div>
                  <span style={{ fontSize: '0.75rem', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--accent-success)', padding: '4px 10px', borderRadius: '4px', fontWeight: 'bold' }}>{pl.status}</span>
                </div>
              ))}
              {polls.length === 0 && <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No company polls currently active.</p>}
            </div>
          </div>

          <div style={{ flex: 1, minWidth: '300px' }} className="form-card">
            <h3>Create Poll</h3>
            <form onSubmit={handleCreatePoll} style={{ marginTop: '16px' }}>
              <div className={styles.formGroup} style={{ marginBottom: '12px' }}>
                <label className={styles.label}>Poll Question</label>
                <input type="text" className={styles.input} placeholder="Where should we host the Annual Team Retreat?" value={newPoll.question} onChange={e => setNewPoll({ ...newPoll, question: e.target.value })} disabled={isPending} />
              </div>
              <div className={styles.formGroup} style={{ marginBottom: '20px' }}>
                <label className={styles.label}>Options (JSON Format)</label>
                <input type="text" className={styles.input} placeholder='["Beach Resort", "Mountain Lodge", "City Hotel"]' value={newPoll.optionsJson} onChange={e => setNewPoll({ ...newPoll, optionsJson: e.target.value })} disabled={isPending} />
              </div>
              <button type="submit" className={`${styles.btn} ${styles.btnPrimary}`} disabled={isPending}>Create Poll</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
