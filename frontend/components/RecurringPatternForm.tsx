import React, { useEffect, useState } from 'react';

export default function RecurringPatternForm({ initial, onSave, onCancel }: { initial?: any; onSave: (p:any)=>void; onCancel: ()=>void }) {
  const [workerId, setWorkerId] = useState<number | ''>(initial?.workerId ?? '');
  const [weekdays, setWeekdays] = useState<number[]>(initial?.weekdays ?? []);
  const [startDate, setStartDate] = useState<string>(initial?.startDate ? initial.startDate.slice(0,10) : '');
  const [endDate, setEndDate] = useState<string>(initial?.endDate ? initial.endDate.slice(0,10) : '');
  const [limitRange, setLimitRange] = useState<boolean>(!!(initial?.startDate || initial?.endDate));
  const [note, setNote] = useState<string>(initial?.note ?? '');
  const [workers, setWorkers] = useState<Array<{id:number;name:string}>>([]);
  const API_BASE = (process.env.NEXT_PUBLIC_API_BASE as string) || 'http://localhost:3001';

  useEffect(()=>{
    let mounted = true;
    async function load(){
      try{
        const res = await fetch(`${API_BASE}/workers`);
        if(!res.ok) return setWorkers([]);
        const data = await res.json();
        if(mounted) setWorkers(data || []);
      }catch(e){ console.error('Failed loading workers', e); setWorkers([]); }
    }
    load();
    return ()=>{ mounted = false };
  }, [API_BASE]);

  useEffect(()=>{ if(initial){ setWorkerId(initial.workerId); setWeekdays(initial.weekdays || []); setStartDate(initial.startDate ? initial.startDate.slice(0,10): ''); setEndDate(initial.endDate ? initial.endDate.slice(0,10): ''); setNote(initial.note ?? ''); } }, [initial]);

  useEffect(()=>{ if(initial){ setLimitRange(!!(initial.startDate || initial.endDate)); } }, [initial]);

  const toggleWeekday = (d:number)=>{
    setWeekdays(w => w.includes(d) ? w.filter(x => x!==d) : [...w, d].sort());
  };

  const submit = ()=>{
    if(!workerId) return alert('Worker ID required');
    onSave({ workerId: Number(workerId), weekdays, startDate: limitRange ? (startDate||null) : null, endDate: limitRange ? (endDate||null) : null, note });
  };

  return (
    <div>
      <h2>{initial ? 'Edit' : 'New'} Pattern</h2>
      <div style={{ display: 'grid', gap: 8 }}>
        <label>Worker
          <select value={workerId as any} onChange={e=>setWorkerId(e.target.value?Number(e.target.value):'')}>
            <option value="">-- select --</option>
            {workers.map(w => <option key={w.id} value={w.id}>{w.name} ({w.id})</option>)}
          </select>
        </label>
        <label>Weekdays</label>
        <div style={{ display: 'flex', gap: 6 }}>
          {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map((label, i)=> (
            <button key={i} onClick={()=>toggleWeekday(i)} style={{ background: weekdays.includes(i)?'#aee':undefined }}>{label}</button>
          ))}
        </div>
        <label style={{display:'flex',alignItems:'center',gap:8}}>
          <input type="checkbox" checked={limitRange} onChange={e=>setLimitRange(e.target.checked)} />
          <span>Limit to date range</span>
        </label>
        {limitRange && (
          <>
            <label>Start Date
              <input type="date" value={startDate} onChange={e=>setStartDate(e.target.value)} />
            </label>
            <label>End Date
              <input type="date" value={endDate} onChange={e=>setEndDate(e.target.value)} />
            </label>
          </>
        )}
        <label>Note
          <input value={note} onChange={e=>setNote(e.target.value)} />
        </label>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={submit}>{initial ? 'Save' : 'Create'}</button>
          <button onClick={onCancel}>Cancel</button>
        </div>
      </div>
    </div>
  );
}
