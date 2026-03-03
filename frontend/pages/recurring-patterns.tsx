import React from 'react';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

/**
 * Página legada — redireciona para o calendário que agora gerencia os rodízios.
 */
export default function RecurringPatternsRedirect() {
  const router = useRouter();
  useEffect(() => { router.replace('/calendar'); }, [router]);
  return <div style={{ padding: 24 }}>Redirecionando para o calendário…</div>;
}
