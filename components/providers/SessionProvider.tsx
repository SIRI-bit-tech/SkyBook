'use client';

import { ReactNode } from 'react';

export function SessionProvider({ children }: { children: ReactNode }) {
  // Better Auth handles session automatically via cookies
  // No provider needed for basic setup
  return <>{children}</>;
}
