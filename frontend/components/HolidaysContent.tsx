import { useEffect, useState } from 'react'
import { PALETTE, btnPrimary, btnSmall, inputStyle, cardStyle } from '../styles/theme'
import { API_BASE, authHeaders, jsonAuthHeaders } from '../config/api'

type Holiday = { id: number; date: string; name?: string; recurring: boolean }

export default function HolidaysContent({ readOnly = false }: { readOnly?: boolean }) {
  const [list, setList] = useState<Holiday[]>([])
  const [date, setDate] = useState('')
  const [name, setName] = useState('')
  const [recurring, setRecurring] = useState(false)

  useEffect(() => { fetchHolidays() }, [])

  async function fetchHolidays() {
    try {
      const res = await fetch(`${API_BASE}/holidays`)
      const data = await res.json()
      setList(data || [])
    } catch (e) { console.error(e) }
  }

  async function createHoliday(e: any) {
    e.preventDefault()
    try {
      await fetch(`${API_BASE}/holidays`, {
        method: 'POST',
        headers: jsonAuthHeaders(),
        body: JSON.stringify({ date, name: name || undefined, recurring }),
      })
      setDate('')
      setName('')
      setRecurring(false)
      fetchHolidays()
    } catch (e) { console.error(e) }
  }

  async function remove(id: number) {
    if (!confirm('Apagar este feriado?')) return
    await fetch(`${API_BASE}/holidays/${id}`, { method: 'DELETE', headers: authHeaders() })
    fetchHolidays()
  }

  return (
    <>
      <h1 style={{ margin: '0 0 20px 0', fontSize: 22, color: PALETTE.textPrimary }}>Feriados</h1>

      {!readOnly && (
      <div style={{ ...cardStyle, maxWidth: 480, marginBottom: 24 }}>
        <h3 style={{ margin: '0 0 16px 0', fontSize: 16, color: PALETTE.textPrimary }}>Novo Feriado</h3>
        <form onSubmit={createHoliday} style={{ display: 'grid', gap: 12 }}>
          <div>
            <label style={{ display: 'block', fontWeight: 600, fontSize: 13, color: PALETTE.textSecondary, marginBottom: 4 }}>Data</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required style={inputStyle} />
          </div>
          <div>
            <label style={{ display: 'block', fontWeight: 600, fontSize: 13, color: PALETTE.textSecondary, marginBottom: 4 }}>Nome (opcional)</label>
            <input placeholder="Ex: Natal" value={name} onChange={(e) => setName(e.target.value)} style={inputStyle} />
          </div>
          <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', padding: '8px 10px', background: PALETTE.hoverBg, borderRadius: 6 }}>
            <input type="checkbox" checked={recurring} onChange={(e) => setRecurring(e.target.checked)} style={{ width: 18, height: 18, accentColor: PALETTE.primary }} />
            <div>
              <span style={{ fontWeight: 600, fontSize: 13, color: PALETTE.textPrimary }}>Recorrente (anual)</span>
              <div style={{ fontSize: 12, color: PALETTE.textSecondary }}>Repete todos os anos na mesma data</div>
            </div>
          </label>
          <button type="submit" style={btnPrimary}>Criar</button>
        </form>
      </div>
      )}

      <h3 style={{ margin: '0 0 12px 0', fontSize: 16, color: PALETTE.textPrimary }}>Lista</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {list.map(h => (
          <div key={h.id} style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: '10px 14px',
            background: PALETTE.cardBg,
            border: `1px solid ${PALETTE.border}`,
            borderRadius: 8,
            borderLeft: `4px solid ${PALETTE.warning}`,
          }}>
            <div style={{ flex: 1 }}>
              <strong style={{ color: PALETTE.textPrimary }}>
                {new Date(h.date).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}
              </strong>
              {h.name && <span style={{ color: PALETTE.textSecondary, marginLeft: 10 }}>{h.name}</span>}
              {h.recurring && (
                <span style={{
                  marginLeft: 10, fontSize: 11, padding: '2px 8px',
                  background: `${PALETTE.primary}22`, color: PALETTE.primary,
                  borderRadius: 4, fontWeight: 500,
                }}>Recorrente</span>
              )}
            </div>
            {!readOnly && <button onClick={() => remove(h.id)} style={{ ...btnSmall, color: PALETTE.error, background: `${PALETTE.error}18`, borderColor: PALETTE.error }}>Apagar</button>}
          </div>
        ))}
        {list.length === 0 && <div style={{ color: PALETTE.textDisabled, padding: 16 }}>Nenhum feriado cadastrado</div>}
      </div>
    </>
  )
}
