import React, { useEffect, useState } from 'react';

export default function AssignmentForm({ initial, onSave }: { initial?: any; onSave: (p:any)=>void }) {
  const [date, setDate] = useState('');
  const [workerId, setWorkerId] = useState<number | ''>('');
  const [note, setNote] = useState('');
  const [workers, setWorkers] = useState<Array<{id:number;name:string}>>([]);
  const API_BASE = (process.env.NEXT_PUBLIC_API_BASE as string) || 'http://localhost:3001';

  useEffect(()=>{ if(initial){ setDate(initial.date ? initial.date.slice(0,10) : ''); setWorkerId(initial.workerId ?? ''); setNote(initial.note ?? ''); } }, [initial]);

  useEffect(()=>{
    let mounted = true;
    async function loadWorkers(){
      try{
        const res = await fetch(`${API_BASE}/workers`);
        if(!res.ok) return setWorkers([]);
        const data = await res.json();
        if(mounted) setWorkers(data || []);
      }catch(e){ console.error('Failed loading workers', e); setWorkers([]); }
    }
    loadWorkers();
    return ()=>{ mounted = false };
  }, [API_BASE]);

  const submit = ()=>{
    if(!date) return alert('Date required');
    onSave({ date, workerId: workerId === '' ? null : Number(workerId), note: note||null });
    setDate(''); setWorkerId(''); setNote('');
  };

  return (
    <div>
      <h2>New Assignment</h2>
      <div style={{ display: 'grid', gap: 8 }}>
        <label>Date <input type="date" value={date} onChange={e=>setDate(e.target.value)} /></label>
        <label>Worker
          <select value={workerId as any} onChange={e=>setWorkerId(e.target.value?Number(e.target.value):'')}>
            <option value="">-- none --</option>
            {workers.map(w => (
              <option key={w.id} value={w.id}>{w.name} ({w.id})</option>
            ))}
          </select>
        </label>
        <label>Note <input value={note} onChange={e=>setNote(e.target.value)} /></label>
        <div><button onClick={submit}>Create</button></div>
      </div>
    </div>
  );
}
