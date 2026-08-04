'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

export default function Home() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setTimeout(() => setMounted(true), 0);
  }, []);

  return (
    <div suppressHydrationWarning={true} className="landing-container">
      <div suppressHydrationWarning={true} className="glow-effect" />
      <div suppressHydrationWarning={true} className="landing-card">
        <div suppressHydrationWarning={true} className="badge">Phase 1 Complete</div>
        <h1 className="landing-title">
          Awais <span>HR</span>
        </h1>
        <p className="landing-subtitle">
          The next-generation unified enterprise SaaS platform. Dynamic physical database-per-tenant architecture with isolated connection pool routing.
        </p>

        <div suppressHydrationWarning={true} className="features-grid">
          <div suppressHydrationWarning={true} className="feature-item">
            <h3>Registry Engine</h3>
            <p>Automatic database provisioning on master schemas.</p>
          </div>
          <div suppressHydrationWarning={true} className="feature-item">
            <h3>Isolated Storage</h3>
            <p>Dedicated physical PostgreSQL database schemas.</p>
          </div>
          <div suppressHydrationWarning={true} className="feature-item">
            <h3>Dynamic Routing</h3>
            <p>Context-aware ThreadLocal routing datasource mappings.</p>
          </div>
        </div>

        <div suppressHydrationWarning={true} className="actions-wrapper">
          <Link href="/register" className="btn btn-primary">
            Launch Onboarding Wizard
          </Link>
          <a href="/api/v1/tenants/register" className="btn btn-outline" target="_blank" rel="noreferrer">
            REST API Endpoint
          </a>
        </div>
      </div>

      <style jsx global>{`
        :root {
          --bg-landing: #09090b;
          --text-main: #f4f4f5;
          --text-sub: #a1a1aa;
          --primary-glow: rgba(99, 102, 241, 0.15);
          --border-color: rgba(255, 255, 255, 0.08);
        }
        
        .landing-container {
          background-color: var(--bg-landing);
          color: var(--text-main);
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          overflow: hidden;
          font-family: var(--font-geist-sans), sans-serif;
          padding: 20px;
        }

        .glow-effect {
          position: absolute;
          width: 600px;
          height: 600px;
          background: radial-gradient(circle, var(--primary-glow) 0%, transparent 70%);
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          pointer-events: none;
          z-index: 1;
        }

        .landing-card {
          position: relative;
          z-index: 2;
          max-width: 680px;
          width: 100%;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid var(--border-color);
          backdrop-filter: blur(16px);
          border-radius: 24px;
          padding: 48px;
          text-align: center;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
        }

        .badge {
          display: inline-block;
          font-size: 0.75rem;
          font-weight: 600;
          color: #818cf8;
          background: rgba(129, 140, 248, 0.1);
          border: 1px solid rgba(129, 140, 248, 0.2);
          padding: 6px 12px;
          border-radius: 9999px;
          margin-bottom: 24px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .landing-title {
          font-size: 3.5rem;
          font-weight: 800;
          margin: 0 0 16px 0;
          letter-spacing: -0.02em;
          color: #ffffff;
        }

        .landing-title span {
          background: linear-gradient(135deg, #6366f1, #a855f7);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .landing-subtitle {
          font-size: 1.1rem;
          color: var(--text-sub);
          line-height: 1.6;
          margin-bottom: 36px;
        }

        .features-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
          margin-bottom: 40px;
        }

        .feature-item {
          background: rgba(255, 255, 255, 0.01);
          border: 1px solid var(--border-color);
          border-radius: 12px;
          padding: 16px;
          text-align: left;
          transition: all 0.3s ease;
        }

        .feature-item:hover {
          background: rgba(255, 255, 255, 0.03);
          border-color: rgba(99, 102, 241, 0.3);
          transform: translateY(-2px);
        }

        .feature-item h3 {
          font-size: 0.9rem;
          font-weight: 600;
          color: #ffffff;
          margin: 0 0 8px 0;
        }

        .feature-item p {
          font-size: 0.775rem;
          color: var(--text-sub);
          margin: 0;
          line-height: 1.4;
        }

        .actions-wrapper {
          display: flex;
          justify-content: center;
          gap: 16px;
        }

        .btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          height: 48px;
          padding: 0 24px;
          font-size: 0.95rem;
          font-weight: 600;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.3s ease;
          text-decoration: none;
        }

        .btn-primary {
          background: linear-gradient(135deg, #6366f1, #a855f7);
          color: #ffffff;
          box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
        }

        .btn-primary:hover {
          transform: translateY(-1px);
          opacity: 0.95;
          box-shadow: 0 6px 18px rgba(99, 102, 241, 0.45);
        }

        .btn-outline {
          border: 1px solid var(--border-color);
          color: #ffffff;
        }

        .btn-outline:hover {
          background: rgba(255, 255, 255, 0.04);
          border-color: rgba(255, 255, 255, 0.2);
        }

        @media (max-width: 640px) {
          .features-grid {
            grid-template-columns: 1fr;
          }
          .actions-wrapper {
            flex-direction: column;
          }
          .landing-card {
            padding: 32px 20px;
          }
        }
      `}</style>
    </div>
  );
}
