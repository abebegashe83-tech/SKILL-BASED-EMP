'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

const getSession = () => {
  if (typeof window === 'undefined') return null;
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

export default function DashboardLayout({ children }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const session = getSession();
    if (session) {
      setUser(session);
    }
  }, []);

  if (!user) return null;

  return <>{children}</>;
}
