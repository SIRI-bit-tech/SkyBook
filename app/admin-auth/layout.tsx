import { ReactNode } from 'react';

export default function AdminAuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800">
      {children}
    </div>
  );
}
