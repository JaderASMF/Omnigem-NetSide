import { useEffect, useState } from 'react'
import DashboardLayout from '../components/DashboardLayout'

type Worker = { id: number; name: string; email?: string; active: boolean }

export default function WorkersPage() {
  const [list, setList] = useState<Worker[]>([])
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')

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
        body: JSON.stringify({ name, email: email || undefined }),
      })
      setName('')
      setEmail('')
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

  return (
    <DashboardLayout>
      <h1>Workers</h1>
      <form onSubmit={createWorker} style={{display:'grid',gap:8,maxWidth:420}}>
        <input placeholder="Name" value={name} onChange={(e)=>setName(e.target.value)} required />
        <input placeholder="Email (optional)" value={email} onChange={(e)=>setEmail(e.target.value)} />
        <div style={{display:'flex',gap:8}}>
          <button type="submit">Create</button>
        </div>
      </form>

      <h3 style={{marginTop:20}}>List</h3>
      <ul>
        {list.map(w => (
          <li key={w.id} style={{marginBottom:8}}>
            <strong>{w.name}</strong> {w.email && <span>- {w.email}</span>} {' '}
            <button onClick={()=>remove(w.id)} style={{marginLeft:8}}>Delete</button>
          </li>
        ))}
      </ul>
    </DashboardLayout>
  )
}
