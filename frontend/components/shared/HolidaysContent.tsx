import { useEffect, useState } from 'react'
import { PALETTE, btnPrimary, btnSmall, inputStyle, cardStyle } from '../../styles/theme'
import { API_BASE, authHeaders, jsonAuthHeaders } from '../../config/api'

type Holiday = { id: number; date: string; name?: string; recurring: boolean }

type Props = {
  readOnly?: boolean
  compact?: boolean
}

export default function HolidaysContent({ readOnly = false, compact = false }: Props) {
  const [list, setList] = useState<Holiday[]>([])
  const [date, setDate] = useState('')
  const [name, setName] = useState('')
  const [recurring, setRecurring] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

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
      setIsModalOpen(false)
      fetchHolidays()
    } catch (e) { console.error(e) }
  }

  async function updateHoliday(e: any) {
    e.preventDefault()
    if (editingId === null) return
    try {
      await fetch(`${API_BASE}/holidays/${editingId}`, {
        method: 'PUT',
        headers: jsonAuthHeaders(),
        body: JSON.stringify({ date, name: name || undefined, recurring }),
      })
      setDate('')
      setName('')
      setRecurring(false)
      setEditingId(null)
      setIsModalOpen(false)
      fetchHolidays()
    } catch (e) { console.error(e) }
  }

  async function remove(id: number) {
    if (!confirm('Apagar este feriado?')) return
    await fetch(`${API_BASE}/holidays/${id}`, { method: 'DELETE', headers: authHeaders() })
    fetchHolidays()
  }

  return (
    <div style={compact ? { maxWidth: 560 } : undefined}>
      {!compact && (
        <h1 style={{ margin: '0 0 20px 0', fontSize: 22, color: PALETTE.textPrimary }}>Feriados</h1>
      )}

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <h3 style={{ margin: 0, fontSize: 16, color: PALETTE.textPrimary }}>Lista</h3>
        {!readOnly && (
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            style={btnPrimary}
          >
            Novo feriado
          </button>
        )}
      </div>
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
            {!readOnly && (
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  onClick={() => {
                    setEditingId(h.id)
                    try {
                      const d = new Date(h.date).toISOString().slice(0, 10)
                      setDate(d)
                    } catch (err) { setDate(h.date) }
                    setName(h.name || '')
                    setRecurring(!!h.recurring)
                    setIsModalOpen(true)
                  }}
                  style={{ ...btnSmall, color: PALETTE.primary, background: `${PALETTE.primary}18`, borderColor: PALETTE.primary }}
                >Editar</button>
                <button onClick={() => remove(h.id)} style={{ ...btnSmall, color: PALETTE.error, background: `${PALETTE.error}18`, borderColor: PALETTE.error }}>Apagar</button>
              </div>
            )}
          </div>
        ))}
        {list.length === 0 && <div style={{ color: PALETTE.textDisabled, padding: 16 }}>Nenhum feriado cadastrado</div>}
      </div>

      {!readOnly && isModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: '#00000088',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1100,
          }}
          onClick={(e) => { if (e.target === e.currentTarget) setIsModalOpen(false) }}
        >
          <div
            style={{
              width: 480,
              maxWidth: '95%',
              background: PALETTE.cardBg,
              borderRadius: 8,
              padding: 20,
              boxShadow: '0 8px 32px rgba(0,0,0,0.45)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <h3 style={{ margin: 0, fontSize: 16, color: PALETTE.textPrimary }}>Novo Feriado</h3>
              <button type="button" onClick={() => setIsModalOpen(false)} style={btnSmall}>✕ Fechar</button>
            </div>
            <form onSubmit={editingId ? updateHoliday : createHoliday} style={{ display: 'grid', gap: 12 }}>
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
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 4 }}>
                <button type="button" onClick={() => { setIsModalOpen(false); setEditingId(null) }} style={btnSmall}>Cancelar</button>
                <button type="submit" style={btnPrimary}>{editingId ? 'Salvar' : 'Criar'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
