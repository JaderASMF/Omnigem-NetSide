import React from 'react';

export default function AssignmentsList({ items, onDelete }: { items: any[]; onDelete: (id:number)=>void }) {
  return (
    <div>
      <h2>Assignments</h2>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
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
