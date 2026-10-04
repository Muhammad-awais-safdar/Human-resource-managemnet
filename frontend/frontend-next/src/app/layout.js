import React from 'react';
import './globals.css';

export const metadata = {
  title: 'Awais HR Platform (Next.js Legacy)',
  description: 'Enterprise multi-tenant HR SaaS platform',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <div id="next-app-root">
          {children}
        </div>
      </body>
    </html>
  );
}
