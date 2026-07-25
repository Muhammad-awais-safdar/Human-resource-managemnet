import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Awais HR - Unified Enterprise SaaS Platform",
  description: "Next-generation dynamic multi-tenant Human Resource Management Platform",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                var origError = console.error;
                console.error = function() {
                  var msg = arguments[0] || '';
                  if (typeof msg === 'string' && (
                    msg.indexOf('bis_skin_checked') !== -1 || 
                    msg.indexOf('data-temp-mail-org') !== -1 ||
                    msg.indexOf('hydration-mismatch') !== -1 || 
                    msg.indexOf("didn't match") !== -1 ||
                    msg.indexOf('Hydration failed') !== -1 ||
                    msg.indexOf('A tree hydrated') !== -1
                  )) {
                    return;
                  }
                  origError.apply(console, arguments);
                };
              })();
            `,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
