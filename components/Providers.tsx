'use client';

import { useState, useEffect } from 'react';
import { ThemeProvider as BaseThemeProvider } from 'neogestify-ui-components';

export function Providers({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <html lang="es" suppressHydrationWarning>
        <body className="antialiased">{children}</body>
      </html>
    );
  }

  return (
    <BaseThemeProvider>
      {children}
    </BaseThemeProvider>
  );
}