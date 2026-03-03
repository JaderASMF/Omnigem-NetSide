import React, { useEffect, useState } from 'react';
import AssignmentsList from '../components/AssignmentsList';
import AssignmentForm from '../components/AssignmentForm';

export default function AssignmentsPage() {
  const [items, setItems] = useState<any[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [editing, setEditing] = useState<any | null>(null);
  const API_BASE = (process.env.NEXT_PUBLIC_API_BASE as string) || 'http://localhost:3001';
  const [genStart, setGenStart] = useState('');
  const [genEnd, setGenEnd] = useState('');

  const load = async () => {
    const res = await fetch(`${API_BASE}/assignments`);
    if (!res.ok) return setItems([]);
    try {
      const data = await res.json();
      setItems(data);
    } catch (e) {
      console.error('Invalid JSON for assignments', e);
      setItems([]);
    }
  };

  useEffect(() => { load(); }, []);

  const onCreate = async (payload: any) => {
    const res = await fetch(`${API_BASE}/assignments`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    if (res.ok) { setEditing(null); await load(); }
  };

  const onDelete = async (id: number) => { await fetch(`${API_BASE}/assignments/${id}`, { method: 'DELETE' }); await load(); };

  const toggle = (id:number) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x=>x!==id) : [...prev, id]);
  };

  const toggleAll = (checked:boolean) => {
    if (checked) setSelectedIds(items.map(i=>i.id));
    else setSelectedIds([]);
  };

  const onDeleteSelected = async () => {
    if (selectedIds.length === 0) return;
    if (!confirm(`Apagar ${selectedIds.length} atribuição(ões)?`)) return;
    await Promise.all(selectedIds.map(id => fetch(`${API_BASE}/assignments/${id}`, { method: 'DELETE' })));
    setSelectedIds([]);
    await load();
  };

  const onGenerate = async () => {
    if (!genStart || !genEnd) return alert('Informe início e fim');
    const res = await fetch(`${API_BASE}/assignments/generate`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ startDate: genStart, endDate: genEnd }) });
    if (res.ok) { await load(); const data = await res.json().catch(()=>null); alert(`Generated: ${data?.createdCount ?? 'unknown'}`); }
  };

  return (
    <div style={{ padding: 24 }}>
      <h1>Assignments</h1>
      <div style={{ display: 'flex', gap: 24 }}>
        <div style={{ flex: 1 }}>
          <div style={{ marginBottom: 8, display: 'flex', gap: 8, alignItems: 'center' }}>
            <button onClick={onDeleteSelected} disabled={selectedIds.length===0}>Apagar selecionados</button>
            <div style={{ color: '#666' }}>{selectedIds.length} selecionado(s)</div>
          </div>
          <AssignmentsList items={items} onDelete={onDelete} selectedIds={selectedIds} onToggle={toggle} onToggleAll={toggleAll} />
        </div>
        <div style={{ width: 420 }}>
          <AssignmentForm initial={editing} onSave={onCreate} />

          <div style={{ marginTop: 16 }}>
            <h3>Generate from recurring patterns</h3>
            <label>Start <input type="date" value={genStart} onChange={e=>setGenStart(e.target.value)} /></label>
            <label style={{ marginLeft: 8 }}>End <input type="date" value={genEnd} onChange={e=>setGenEnd(e.target.value)} /></label>
            <div style={{ marginTop: 8 }}><button onClick={onGenerate}>Generate</button></div>
          </div>
        </div>
      </div>
    </div>
  );
}
