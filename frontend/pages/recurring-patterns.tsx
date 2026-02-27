import React, { useEffect, useState } from 'react';
import RecurringPatternsList from '../components/RecurringPatternsList';
import RecurringPatternForm from '../components/RecurringPatternForm';

export default function RecurringPatternsPage() {
  const [patterns, setPatterns] = useState<any[]>([]);
  const [editing, setEditing] = useState<any | null>(null);
  const API_BASE = (process.env.NEXT_PUBLIC_API_BASE as string) || '';
  const API_BASE_FALLBACK = (process.env.NEXT_PUBLIC_API_BASE as string) || 'http://localhost:3001';
  const [workers, setWorkers] = useState<any[]>([]);

  const load = async () => {
    const res = await fetch(`${API_BASE_FALLBACK}/recurring-patterns`);
    if (!res.ok) {
      console.error('Failed to load recurring patterns', res.status);
      setPatterns([]);
      return;
    }
    try {
      const data = await res.json();
      setPatterns(data);
    } catch (e) {
      console.error('Invalid JSON response for recurring patterns', e);
      setPatterns([]);
    }
  };

  const loadWorkers = async () => {
    try{
      const res = await fetch(`${API_BASE_FALLBACK}/workers`);
      if(!res.ok) return setWorkers([]);
      const data = await res.json();
      setWorkers(data || []);
    }catch(e){ console.error('Failed loading workers', e); setWorkers([]); }
  };

  useEffect(() => {
    load();
    loadWorkers();
  }, []);

  const onSave = async (payload: any) => {
    if (editing) {
      await fetch(`${API_BASE_FALLBACK}/recurring-patterns/${editing.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    } else {
      await fetch(`${API_BASE_FALLBACK}/recurring-patterns`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    }
    setEditing(null);
    await load();
  };

  const onEdit = (p: any) => setEditing(p);
  const onDelete = async (id: number) => { await fetch(`${API_BASE_FALLBACK}/recurring-patterns/${id}`, { method: 'DELETE' }); await load(); };

  return (
    <div style={{ padding: 24 }}>
      <h1>Recurring Patterns</h1>
      <div style={{ display: 'flex', gap: 24 }}>
        <div style={{ flex: 1 }}>
          <RecurringPatternsList items={patterns} onEdit={onEdit} onDelete={onDelete} workers={workers} />
        </div>
        <div style={{ width: 420 }}>
          <RecurringPatternForm key={editing ? editing.id : 'new'} initial={editing} onSave={onSave} onCancel={() => setEditing(null)} />
        </div>
      </div>
    </div>
  );
}
