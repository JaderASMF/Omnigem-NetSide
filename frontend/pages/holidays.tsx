import { useEffect, useState } from 'react'
import DashboardLayout from '../components/DashboardLayout'

type Holiday = { id: number; date: string; name?: string; recurring: boolean }

export default function HolidaysPage() {
  const [list, setList] = useState<Holiday[]>([])
  const [date, setDate] = useState('')
  const [name, setName] = useState('')
  const [recurring, setRecurring] = useState(false)

  useEffect(() => { fetchHolidays() }, [])

  async function fetchHolidays() {
    try {
      const res = await fetch('http://localhost:3001/holidays')
      const data = await res.json()
      setList(data || [])
    } catch (e) { console.error(e) }
  }

  async function createHoliday(e: any) {
    e.preventDefault()
    try {
      await fetch('http://localhost:3001/holidays', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date, name: name || undefined, recurring }),
      })
      setDate('')
      setName('')
      setRecurring(false)
      fetchHolidays()
    } catch (e) { console.error(e) }
  }

  async function remove(id: number) {
    if (!confirm('Delete holiday?')) return
    await fetch(`http://localhost:3001/holidays/${id}`, { method: 'DELETE' })
    fetchHolidays()
  }

  return (
    <DashboardLayout>
      <h1>Holidays</h1>

      <form onSubmit={createHoliday} style={{display:'grid',gap:8,maxWidth:420}}>
        <label>
          Date
          <input type="date" value={date} onChange={(e)=>setDate(e.target.value)} required />
        </label>
        <input placeholder="Name (optional)" value={name} onChange={(e)=>setName(e.target.value)} />
        <label style={{display:'flex',alignItems:'center',gap:8}}>
          <input type="checkbox" checked={recurring} onChange={(e)=>setRecurring(e.target.checked)} /> Recurring yearly
        </label>
        <div style={{display:'flex',gap:8}}>
          <button type="submit">Create</button>
        </div>
      </form>

      <h3 style={{marginTop:20}}>List</h3>
      <ul>
        {list.map(h => (
          <li key={h.id} style={{marginBottom:8}}>
            <strong>{new Date(h.date).toLocaleDateString()}</strong>
            {h.name && <span> - {h.name}</span>} {h.recurring && <em> (recurring)</em>}
            <button onClick={()=>remove(h.id)} style={{marginLeft:8}}>Delete</button>
          </li>
        ))}
      </ul>
    </DashboardLayout>
  )
}
