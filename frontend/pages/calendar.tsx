import React, { useEffect, useState } from 'react';

const API_BASE = (process.env.NEXT_PUBLIC_API_BASE as string) || 'http://localhost:3001';

function startOfMonth(d: Date) { return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1)); }
function endOfMonth(d: Date) { return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth()+1, 0)); }
function addDays(d: Date, n: number){ const c = new Date(d); c.setUTCDate(c.getUTCDate()+n); return c; }
function addWeeks(d: Date, w: number){ return addDays(d, w*7); }
function toISODate(d: Date){ return d.toISOString().slice(0,10); }

export default function CalendarPage(){
  const [viewDate, setViewDate] = useState(new Date());
  const [assignments, setAssignments] = useState<any[]>([]);
  const [workers, setWorkers] = useState<any[]>([]);
  const [patterns, setPatterns] = useState<any[]>([]);
  const [holidays, setHolidays] = useState<any[]>([]);
  const [displayed, setDisplayed] = useState<Record<string, any>>({});

  const [editingDate, setEditingDate] = useState<string | null>(null);
  const [selectedWorker, setSelectedWorker] = useState<number | ''>('');
  const [applyFuture, setApplyFuture] = useState(false);
  const [horizonWeeks, setHorizonWeeks] = useState(12);

  useEffect(()=>{ loadDataForMonth(viewDate); loadWorkers(); loadPatterns(); loadHolidays(); }, [viewDate]);

  async function loadWorkers(){
    try{ const res = await fetch(`${API_BASE}/workers`); const data = await res.json(); setWorkers(data||[]); }catch(e){ setWorkers([]); }
  }
  async function loadPatterns(){ try{ const res = await fetch(`${API_BASE}/recurring-patterns`); const data = await res.json(); setPatterns(data||[]); }catch(e){ setPatterns([]); } }

  async function loadHolidays(){ try{ const res = await fetch(`${API_BASE}/holidays`); const data = await res.json(); setHolidays(data||[]); }catch(e){ setHolidays([]); } }

  async function loadDataForMonth(d: Date){
    const start = startOfMonth(d);
    const end = endOfMonth(d);
    try{
      const res = await fetch(`${API_BASE}/assignments?startDate=${toISODate(start)}&endDate=${toISODate(end)}`);
      const data = await res.json(); setAssignments(data||[]);
    }catch(e){ setAssignments([]); }
  }

  // compute displayed map merging real assignments and generated occurrences from patterns
  useEffect(()=>{
    const start = startOfMonth(viewDate);
    const end = endOfMonth(viewDate);
    const map: Record<string, any> = {};

    (assignments || []).forEach((a:any) => { if(a && a.date) map[a.date.slice(0,10)] = a; });

    const isHolidayDate = (d: Date) => {
      return (holidays || []).some((h:any) => {
        const hd = new Date(h.date);
        if (h.recurring) return hd.getUTCDate() === d.getUTCDate() && hd.getUTCMonth() === d.getUTCMonth();
        return hd.toISOString().slice(0,10) === d.toISOString().slice(0,10);
      });
    };

    (patterns || []).forEach((p:any) => {
      const pStart = p.startDate ? new Date(p.startDate) : start;
      const pEnd = p.endDate ? new Date(p.endDate) : end;
      const genStart = pStart > start ? pStart : start;
      const genEnd = pEnd < end ? pEnd : end;
      if (genStart > genEnd) return;
      for (let d = new Date(genStart); d <= genEnd; d.setUTCDate(d.getUTCDate()+1)){
        const weekday = d.getUTCDay();
        if (!(p.weekdays || []).includes(weekday)) continue;
        if (isHolidayDate(new Date(d))) continue;
        const key = toISODate(new Date(d));
        if (map[key]) continue;
        map[key] = { id: null, date: key, workerId: p.workerId, source: 'RECURRENT', note: p.note };
      }
    });

    setDisplayed(map);
  }, [assignments, patterns, holidays, viewDate]);

  function prevMonth(){ const c = new Date(viewDate); c.setUTCMonth(c.getUTCMonth()-1); setViewDate(c); }
  function nextMonth(){ const c = new Date(viewDate); c.setUTCMonth(c.getUTCMonth()+1); setViewDate(c); }

  function matrixForMonth(d: Date){
    const start = startOfMonth(d);
    const firstWeekday = start.getUTCDay();
    const daysInMonth = endOfMonth(d).getUTCDate();
    const rows: (Date|null)[][] = [];
    let cur = addDays(start, -firstWeekday);
    for(let r=0;r<6;r++){
      const row: (Date|null)[] = [];
      for(let c=0;c<7;c++){ row.push(new Date(cur)); cur = addDays(cur,1); }
      rows.push(row);
    }
    return rows;
  }

  function assignmentForDate(d: Date){
    const iso = toISODate(d);
    if(displayed[iso]) return displayed[iso];
    return assignments.find(a => a.date && a.date.slice(0,10) === iso);
  }

  function openEdit(d: Date){
    const a = assignmentForDate(d);
    setEditingDate(toISODate(d));
    setSelectedWorker(a?.workerId ?? '');
    setApplyFuture(false);
  }

  async function saveEdit(){
    if(!editingDate) return;
    const dateStr = editingDate;
    const old = assignments.find(a => a.date && a.date.slice(0,10) === dateStr);
    const oldWorker = old?.workerId ?? null;
    const newWorker = selectedWorker === '' ? null : Number(selectedWorker);

    // 1) delete existing assignment for that date if present
    if(old){ try{ await fetch(`${API_BASE}/assignments/${old.id}`, { method: 'DELETE' }); }catch(e){} }

    // 2) create manual assignment if newWorker not null
    if(newWorker !== null){ await fetch(`${API_BASE}/assignments`, { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ date: dateStr, workerId: newWorker }) }); }

    // 3) if applyFuture, propagate change across future weeks
    if(applyFuture){
      const start = new Date(dateStr + 'T00:00:00Z');
      const end = addWeeks(start, horizonWeeks);
      const weekday = start.getUTCDay();

      // a) remove recurring assignments in future for that weekday
      try{
        const res = await fetch(`${API_BASE}/assignments?startDate=${toISODate(start)}&endDate=${toISODate(end)}`);
        const future = await res.json();
        for(const f of future){
          const fd = new Date(f.date);
          if(fd.getUTCDay() === weekday && f.source === 'RECURRENT'){
            try{ await fetch(`${API_BASE}/assignments/${f.id}`, { method: 'DELETE' }); }catch(e){}
          }
        }
      }catch(e){}

      // b) adjust recurring patterns: remove weekday from old worker patterns, add to new worker pattern
      try{
        const res = await fetch(`${API_BASE}/recurring-patterns`);
        const pats = await res.json();
        // remove weekday from patterns of oldWorker
        for(const p of pats){
          const pStart = p.startDate ? new Date(p.startDate) : null;
          const pEnd = p.endDate ? new Date(p.endDate) : null;
          const applies = (!pStart || pStart <= start) && (!pEnd || pEnd >= start);
          if(p.workerId === oldWorker && applies && (p.weekdays || []).includes(weekday)){
            const newWeek = (p.weekdays||[]).filter((x:number)=>x!==weekday);
            if(newWeek.length) await fetch(`${API_BASE}/recurring-patterns/${p.id}`, { method: 'PUT', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ weekdays: newWeek }) });
            else await fetch(`${API_BASE}/recurring-patterns/${p.id}`, { method: 'DELETE' });
          }
        }

        // add weekday to a pattern for newWorker or create one
        if(newWorker !== null){
          let target = pats.find((p:any)=>p.workerId===newWorker && ((!p.startDate)|| new Date(p.startDate) <= start) && ((!p.endDate)|| new Date(p.endDate) >= start));
          if(target){
            if(!(target.weekdays||[]).includes(weekday)){
              const merged = Array.from(new Set([...(target.weekdays||[]), weekday])).sort();
              await fetch(`${API_BASE}/recurring-patterns/${target.id}`, { method: 'PUT', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ weekdays: merged }) });
            }
          } else {
            await fetch(`${API_BASE}/recurring-patterns`, { method: 'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ workerId: newWorker, weekdays: [weekday] }) });
          }
        }

        // c) regenerate assignments for the range
        await fetch(`${API_BASE}/assignments/generate`, { method: 'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ startDate: toISODate(start), endDate: toISODate(end) }) });
      }catch(e){ console.error('propagate failed', e); }
    }

    // refresh
    await loadDataForMonth(new Date(dateStr+'T00:00:00Z'));
    await loadPatterns();
    await loadHolidays();
    setEditingDate(null);
  }

  const rows = matrixForMonth(viewDate);

  return (
    <div style={{ padding:24 }}>
      <h1>Calendar</h1>
      <div style={{ display:'flex', alignItems:'center', gap:8 }}>
        <button onClick={prevMonth}>Prev</button>
        <strong>{viewDate.toLocaleString(undefined,{month:'long',year:'numeric'})}</strong>
        <button onClick={nextMonth}>Next</button>
      </div>

      <table style={{ width:'100%', borderCollapse:'collapse', marginTop:12 }}>
        <thead>
          <tr>{['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d=> <th key={d} style={{textAlign:'left'}}>{d}</th>)}</tr>
        </thead>
        <tbody>
          {rows.map((row,ri)=> (
            <tr key={ri}>
              {row.map((cell,ci)=> (
                <td key={ci} style={{ verticalAlign:'top', border:'1px solid #eee', height:100, padding:6 }}>
                  {cell && (
                    <div>
                      <div style={{ fontSize:12, color: cell.getUTCMonth()===viewDate.getUTCMonth() ? undefined:'#999' }}>{cell.getUTCDate()}</div>
                      <div style={{ marginTop:6 }}>
                        {(() => { const a = assignmentForDate(cell); if(a) return <div style={{ background:'#eef', padding:4, borderRadius:4 }}>{workers.find(w=>w.id===a.workerId)?.name ?? a.workerId}</div>; return null })()}
                      </div>
                      <div style={{ marginTop:6 }}><button onClick={()=>openEdit(cell)}>Edit</button></div>
                    </div>
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      {editingDate && (
        <div style={{ position:'fixed', left:0,top:0,right:0,bottom:0, background:'rgba(0,0,0,0.3)', display:'flex',alignItems:'center',justifyContent:'center' }}>
          <div style={{ background:'#fff', padding:16, width:360, borderRadius:6 }}>
            <h3>Edit {editingDate}</h3>
            <label>Worker
              <select value={selectedWorker as any} onChange={e=>setSelectedWorker(e.target.value?Number(e.target.value):'')}>
                <option value="">-- none --</option>
                {workers.map(w=> <option key={w.id} value={w.id}>{w.name}</option>)}
              </select>
            </label>
            <div style={{ marginTop:8 }}>
              <label style={{display:'flex',gap:8,alignItems:'center'}}>
                <input type="checkbox" checked={applyFuture} onChange={e=>setApplyFuture(e.target.checked)} />
                <span>Apply to future weeks</span>
              </label>
              {applyFuture && (
                <div style={{ marginTop:8 }}>
                  <label>Weeks horizon <input type="number" value={horizonWeeks} onChange={e=>setHorizonWeeks(Number(e.target.value)||0)} style={{ width:80, marginLeft:8 }} /></label>
                </div>
              )}
            </div>
            <div style={{ marginTop:12, display:'flex', gap:8 }}>
              <button onClick={saveEdit}>Save</button>
              <button onClick={()=>setEditingDate(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
