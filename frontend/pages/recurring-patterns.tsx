import React, { useEffect, useState } from 'react';
import RecurringPatternsList from '../components/RecurringPatternsList';
import RecurringPatternForm from '../components/RecurringPatternForm';

export default function RecurringPatternsPage() {
  const [patterns, setPatterns] = useState<any[]>([]);
  const [editing, setEditing] = useState<any | null>(null);
  const [rotationGroup, setRotationGroup] = useState<any[] | null>(null);
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
    if(payload && payload.rotation){
      const incoming = payload.rotation;
      const originalIds = payload.originalIds || [];
      const incomingIds = incoming.map((x:any)=>x.id).filter((x:any)=>x!=null);
      const deleted = originalIds.filter((id:number)=>!incomingIds.includes(id));
      // if scheduling requested, create new patterns starting at scheduleStartDate and set endDate for originals to day before
      if(payload.scheduleStartDate){
        const sched = payload.scheduleStartDate; // yyyy-mm-dd
        const dayBefore = (dstr:string)=>{ const d=new Date(dstr+'T00:00:00Z'); d.setUTCDate(d.getUTCDate()-1); return d.toISOString().slice(0,10); };
        // set endDate on all original ids to dayBefore(sched)
        for(const id of originalIds){ try{ await fetch(`${API_BASE_FALLBACK}/recurring-patterns/${id}`, { method: 'PUT', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ endDate: dayBefore(sched) }) }); }catch(e){} }
        // create new incoming patterns starting at sched
        for(const p of incoming){
          const body = { workerId: p.workerId, weekdays: p.weekdays, weekInterval: p.weekInterval, weekOffset: p.weekOffset, startDate: sched, endDate: p.endDate, note: p.note };
          await fetch(`${API_BASE_FALLBACK}/recurring-patterns`, { method: 'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(body) });
        }
      } else {
        // delete removed
        for(const id of deleted){ try{ await fetch(`${API_BASE_FALLBACK}/recurring-patterns/${id}`, { method: 'DELETE' }); }catch(e){} }
        // upsert incoming
        for(const p of incoming){
          const body = { workerId: p.workerId, weekdays: p.weekdays, weekInterval: p.weekInterval, weekOffset: p.weekOffset, startDate: p.startDate, endDate: p.endDate, note: p.note };
          if(p.id){ await fetch(`${API_BASE_FALLBACK}/recurring-patterns/${p.id}`, { method: 'PUT', headers:{'Content-Type':'application/json'}, body: JSON.stringify(body) }); }
          else { await fetch(`${API_BASE_FALLBACK}/recurring-patterns`, { method: 'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(body) }); }
        }
      }
      setRotationGroup(null);
      setEditing(null);
    } else if (Array.isArray(payload)) {
      // legacy: create multiple patterns
      for(const p of payload){ await fetch(`${API_BASE_FALLBACK}/recurring-patterns`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(p) }); }
    } else {
      if (editing) {
        await fetch(`${API_BASE_FALLBACK}/recurring-patterns/${editing.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      } else {
        await fetch(`${API_BASE_FALLBACK}/recurring-patterns`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      }
      setEditing(null);
    }
    await load();
  };

  const onEdit = async (p: any) => {
    // if pattern looks like part of a rotation, load related patterns and open rotation editor
    if(p && p.weekInterval && p.weekInterval > 1){
      try{
        const res = await fetch(`${API_BASE_FALLBACK}/recurring-patterns`);
        if(res.ok){
          const all = await res.json();
          const keyWeekdays = JSON.stringify(p.weekdays || []);
          const group = all.filter((x:any)=> (x.weekInterval === p.weekInterval) && JSON.stringify(x.weekdays||[]) === keyWeekdays && (x.startDate||null) === (p.startDate||null) && (x.endDate||null) === (p.endDate||null));
          if(group.length >= 2){ setRotationGroup(group); setEditing(null); return; }
        }
      }catch(e){ }
    }
    setRotationGroup(null);
    setEditing(p);
  };
  const onDelete = async (id: number) => { await fetch(`${API_BASE_FALLBACK}/recurring-patterns/${id}`, { method: 'DELETE' }); await load(); };

  return (
    <div style={{ padding: 24 }}>
      <h1>Recurring Patterns</h1>
      <div style={{ display: 'flex', gap: 24 }}>
        <div style={{ flex: 1 }}>
          <RecurringPatternsList items={patterns} onEdit={onEdit} onDelete={onDelete} workers={workers} />
        </div>
        <div style={{ width: 420 }}>
          <RecurringPatternForm key={editing ? editing.id : (rotationGroup ? 'rotation' : 'new')} initial={editing} initialRotation={rotationGroup ?? undefined} onSave={onSave} onCancel={() => { setEditing(null); setRotationGroup(null); }} />
        </div>
      </div>
    </div>
  );
}
