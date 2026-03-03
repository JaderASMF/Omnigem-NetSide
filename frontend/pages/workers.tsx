import { useEffect, useState } from 'react'
import DashboardLayout from '../components/DashboardLayout'

type Worker = { id: number; name: string; email?: string; color?: string; active: boolean }

const COLOR_PRESETS = [
  '#4CAF50', '#2196F3', '#FF9800', '#9C27B0',
  '#F44336', '#00BCD4', '#FF5722', '#607D8B',
  '#E91E63', '#8BC34A', '#3F51B5', '#FFC107',
];

export default function WorkersPage() {
  const [list, setList] = useState<Worker[]>([])
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [color, setColor] = useState('')
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editColor, setEditColor] = useState('')

  useEffect(() => {
    fetchWorkers()
  }, [])

  async function fetchWorkers() {
    try {
      const res = await fetch('http://localhost:3001/workers')
      const data = await res.json()
      setList(data || [])
    } catch (e) {
      console.error(e)
    }
  }

  async function createWorker(e: any) {
    e.preventDefault()
    try {
      await fetch('http://localhost:3001/workers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email: email || undefined, color: color || undefined }),
      })
      setName('')
      setEmail('')
      setColor('')
      fetchWorkers()
    } catch (e) {
      console.error(e)
    }
  }

  async function remove(id: number) {
    if (!confirm('Delete worker?')) return
    await fetch(`http://localhost:3001/workers/${id}`, { method: 'DELETE' })
    fetchWorkers()
  }

  async function updateColor(id: number, newColor: string) {
    await fetch(`http://localhost:3001/workers/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ color: newColor || null }),
    })
    setEditingId(null)
    fetchWorkers()
  }

  return (
    <DashboardLayout>
      <h1>Workers</h1>
      <form onSubmit={createWorker} style={{display:'grid',gap:8,maxWidth:420}}>
        <input placeholder="Name" value={name} onChange={(e)=>setName(e.target.value)} required />
        <input placeholder="Email (optional)" value={email} onChange={(e)=>setEmail(e.target.value)} />
        <div>
          <label style={{fontSize:13,fontWeight:600}}>Cor</label>
          <div style={{display:'flex',gap:6,marginTop:4,flexWrap:'wrap'}}>
            {COLOR_PRESETS.map(c => (
              <button key={c} type="button" onClick={()=>setColor(color===c?'':c)} style={{
                width:28,height:28,borderRadius:'50%',border: color===c?'3px solid #333':'2px solid #ccc',
                background:c,cursor:'pointer',padding:0
              }} />
            ))}
          </div>
        </div>
        <div style={{display:'flex',gap:8}}>
          <button type="submit">Create</button>
        </div>
      </form>

      <h3 style={{marginTop:20}}>List</h3>
      <ul style={{listStyle:'none',padding:0}}>
        {list.map(w => (
          <li key={w.id} style={{marginBottom:10,display:'flex',alignItems:'center',gap:10,padding:'8px 12px',background:'#fafafa',borderRadius:8,borderLeft: w.color ? `4px solid ${w.color}` : '4px solid #ccc'}}>
            <span style={{width:20,height:20,borderRadius:'50%',background: w.color || '#ccc',display:'inline-block',flexShrink:0}} />
            <div style={{flex:1}}>
              <strong>{w.name}</strong> {w.email && <span style={{color:'#666'}}>- {w.email}</span>}
            </div>
            {editingId === w.id ? (
              <div style={{display:'flex',gap:4,flexWrap:'wrap',alignItems:'center'}}>
                {COLOR_PRESETS.map(c => (
                  <button key={c} type="button" onClick={()=>setEditColor(c)} style={{
                    width:22,height:22,borderRadius:'50%',border: editColor===c?'3px solid #333':'2px solid #ccc',
                    background:c,cursor:'pointer',padding:0
                  }} />
                ))}
                <button onClick={()=>updateColor(w.id, editColor)} style={{marginLeft:4,fontSize:12}}>OK</button>
                <button onClick={()=>setEditingId(null)} style={{fontSize:12}}>X</button>
              </div>
            ) : (
              <button onClick={()=>{setEditingId(w.id);setEditColor(w.color||'')}} style={{fontSize:12,cursor:'pointer'}}>Cor</button>
            )}
            <button onClick={()=>remove(w.id)} style={{cursor:'pointer',color:'#c00',fontSize:12}}>Delete</button>
          </li>
        ))}
      </ul>
    </DashboardLayout>
  )
}
