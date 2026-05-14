'use client';

import "./globals.css";
import { useState, useEffect } from 'react';
import { ThemeProvider } from 'neogestify-ui-components';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                const theme = localStorage.getItem('theme') || 'light';
                if (theme === 'dark') {
                  document.documentElement.classList.add('dark');
                } else {
                  document.documentElement.classList.remove('dark');
                }
              })();
            `,
          }}
        />
      </head>
      <body className="antialiased">
        {mounted ? (
          <ThemeProvider>
            {children}
          </ThemeProvider>
        ) : (
          children
        )}
      </body>
    </html>
  );
}