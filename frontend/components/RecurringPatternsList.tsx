import React from 'react';

export default function RecurringPatternsList({ items, onEdit, onDelete, workers }: { items: any[]; onEdit: (p:any)=>void; onDelete:(id:number)=>void; workers?: Array<{id:number;name:string}> }) {
  return (
    <div>
      <h2>Patterns</h2>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={{ textAlign: 'left' }}>ID</th>
            <th style={{ textAlign: 'left' }}>Worker</th>
            <th style={{ textAlign: 'left' }}>Weekdays</th>
            <th style={{ textAlign: 'left' }}>Range</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {items.map((p) => (
            <tr key={p.id}>
              <td>{p.id}</td>
              <td>{(workers || []).find(w => w.id === p.workerId)?.name ?? p.workerId}</td>
              <td>{(p.weekdays || []).join(',')}</td>
              <td>{(!p.startDate && !p.endDate) ? 'Always' : `${p.startDate ? new Date(p.startDate).toLocaleDateString() : '-'} — ${p.endDate ? new Date(p.endDate).toLocaleDateString() : '-'}`}</td>
              <td>
                <button onClick={() => onEdit(p)} style={{ marginRight: 8 }}>Edit</button>
                <button onClick={() => onDelete(p.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
