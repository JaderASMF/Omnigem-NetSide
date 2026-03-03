import React from 'react';

type Props = {
  items: any[];
  onDelete: (id:number)=>void;
  selectedIds: number[];
  onToggle: (id:number)=>void;
  onToggleAll: (checked:boolean)=>void;
};

export default function AssignmentsList({ items, onDelete, selectedIds, onToggle, onToggleAll }: Props) {
  const allSelected = items.length > 0 && selectedIds.length === items.length;

  return (
    <div>
      <h2>Assignments</h2>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={{ width: 40 }}><input type="checkbox" checked={allSelected} onChange={e=>onToggleAll(e.target.checked)} /></th>
            <th>Date</th>
            <th>Worker</th>
            <th>Source</th>
            <th>Note</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {items.map(a => (
            <tr key={a.id}>
              <td style={{ textAlign: 'center' }}><input type="checkbox" checked={selectedIds.includes(a.id)} onChange={()=>onToggle(a.id)} /></td>
              <td>{new Date(a.date).toLocaleDateString()}</td>
              <td>{a.workerId ?? '-'}</td>
              <td>{a.source}</td>
              <td>{a.note ?? ''}</td>
              <td><button onClick={()=>onDelete(a.id)}>Delete</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
