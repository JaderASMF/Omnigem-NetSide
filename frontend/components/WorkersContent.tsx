import { useEffect, useState } from 'react'
import { PALETTE, btnPrimary, btnSmall, inputStyle, cardStyle } from '../styles/theme'
import { useToast } from './ToastProvider'

type Worker = { id: number; name: string; color?: string; active: boolean }

const COLOR_PRESETS = [
  '#4CAF50', '#2196F3', '#FF9800', '#9C27B0',
  '#F44336', '#00BCD4', '#FF5722', '#607D8B',
  '#E91E63', '#8BC34A', '#3F51B5', '#FFC107',
];

export default function WorkersContent() {
  const [list, setList] = useState<Worker[]>([])
  const [name, setName] = useState('')
  const [color, setColor] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editColor, setEditColor] = useState('')

  useEffect(() => { fetchWorkers() }, [])

  const { addToast } = useToast()

  async function fetchWorkers() {
    try {
      const res = await fetch('http://localhost:3001/workers')
      const data = await res.json()
      setList(data || [])
    } catch (e) { console.error(e) }
  }

  async function createWorker(e: any) {
    e.preventDefault()
    try {
      await fetch('http://localhost:3001/workers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, color: color || undefined }),
      })
      setName('')
      
      setColor('')
      addToast('Trabalhador criado', 'success')
      fetchWorkers()
    } catch (e) { console.error(e) }
  }

  async function remove(id: number) {
    if (!confirm('Apagar este trabalhador?')) return

    // ask whether also remove assignments and recurring patterns
    const removeDeps = confirm('Remover todas as atribuições e padrões recorrentes deste trabalhador?\n\nOK = Sim, Cancel = Não')

    try {
      const url = `http://localhost:3001/workers/${id}` + (removeDeps ? '?removeAssignments=true' : '')
      const res = await fetch(url, { method: 'DELETE' })
      const text = await res.text()
      if (!res.ok) {
        let msg = text || 'Erro ao apagar trabalhador'
        try { const j = JSON.parse(text); if (j?.message) msg = j.message } catch {}
        addToast(msg, 'error')
        return
      }
      addToast('Trabalhador apagado', 'success')
      fetchWorkers()
    } catch (e) {
      console.error(e)
      addToast('Erro de rede ao apagar trabalhador', 'error')
    }
  }

  async function updateColor(id: number, newColor: string) {
    try {
      const res = await fetch(`http://localhost:3001/workers/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ color: newColor || null }),
      })
      if (!res.ok) {
        const txt = await res.text()
        let msg = 'Erro ao atualizar cor'
        try { const j = JSON.parse(txt); if (j?.message) msg = j.message } catch {}
        addToast(msg, 'error')
      } else {
        addToast('Cor atualizada', 'success')
      }
    } catch (e) {
      console.error(e)
      addToast('Erro de rede ao atualizar cor', 'error')
    }
    setEditingId(null)
    fetchWorkers()
  }

  return (
    <>
      <h1 style={{ margin: '0 0 20px 0', fontSize: 22, color: PALETTE.textPrimary }}>Trabalhadores</h1>

      <div style={{ maxWidth: 480, marginBottom: 24, display: 'flex', justifyContent: 'flex-start', alignItems: 'center' }}>
        <button onClick={() => setIsModalOpen(true)} style={btnPrimary}>Adicionar Trabalhador</button>
      </div>

      <h3 style={{ margin: '0 0 12px 0', fontSize: 16, color: PALETTE.textPrimary }}>Lista</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {list.map(w => (
          <div key={w.id} style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: '10px 14px',
            background: PALETTE.cardBg,
            borderRadius: 8,
            borderLeft: w.color ? `4px solid ${w.color}` : `4px solid ${PALETTE.border}`,
            border: `1px solid ${PALETTE.border}`,
          }}>
            <span style={{
              width: 22, height: 22, borderRadius: '50%',
              background: w.color || PALETTE.border,
              display: 'inline-block', flexShrink: 0,
            }} />
            <div style={{ flex: 1 }}>
              <strong style={{ color: PALETTE.textPrimary }}>{w.name}</strong>
            </div>

            {editingId === w.id ? (
              <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', alignItems: 'center' }}>
                <input
                  type="color"
                  value={editColor || '#000000'}
                  onChange={(e) => setEditColor(e.target.value)}
                  style={{ width: 36, height: 28, padding: 0, borderRadius: 6, border: `1px solid ${PALETTE.border}` }}
                />
                <input
                  placeholder="#rrggbb"
                  value={editColor}
                  onChange={(e) => setEditColor(e.target.value)}
                  style={{ ...inputStyle, width: 110 }}
                />
                <button type="button" onClick={() => setEditColor('')} style={btnSmall}>Limpar</button>
                <button onClick={() => updateColor(w.id, editColor)} style={{ ...btnSmall, color: PALETTE.success, borderColor: PALETTE.success }}>OK</button>
                <button onClick={() => setEditingId(null)} style={btnSmall}>✕</button>
              </div>
            ) : (
              <button onClick={() => { setEditingId(w.id); setEditColor(w.color || ''); }} style={btnSmall}>Cor</button>
            )}
            <button onClick={() => remove(w.id)} style={{ ...btnSmall, color: PALETTE.error, background: `${PALETTE.error}18`, borderColor: PALETTE.error }}>Apagar</button>
          </div>
        ))}
        {list.length === 0 && <div style={{ color: PALETTE.textDisabled, padding: 16 }}>Nenhum trabalhador cadastrado</div>}
      </div>

      {isModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: '#00000066', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ width: 520, maxWidth: '95%', background: PALETTE.cardBg, padding: 20, borderRadius: 8, boxShadow: '0 6px 24px rgba(0,0,0,0.2)' }}>
            <h3 style={{ margin: '0 0 12px 0', fontSize: 16, color: PALETTE.textPrimary }}>Adicionar Trabalhador</h3>
            <form onSubmit={async (e) => { await createWorker(e); setIsModalOpen(false); }} style={{ display: 'grid', gap: 12 }}>
              <div>
                <label style={{ display: 'block', fontWeight: 600, fontSize: 13, color: PALETTE.textSecondary, marginBottom: 4 }}>Nome</label>
                <input placeholder="Nome do trabalhador" value={name} onChange={(e) => setName(e.target.value)} required style={inputStyle} />
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: 600, fontSize: 13, color: PALETTE.textSecondary, marginBottom: 6 }}>Cor</label>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <input
                    type="color"
                    value={color || '#000000'}
                    onChange={(e) => setColor(e.target.value)}
                    style={{ width: 42, height: 32, padding: 0, borderRadius: 6, border: `1px solid ${PALETTE.border}` }}
                  />
                  <input
                    placeholder="#rrggbb"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    style={{ ...inputStyle, width: 110 }}
                  />
                  <button type="button" onClick={() => setColor('')} style={btnSmall}>Limpar</button>
                  <span style={{ width: 22, height: 22, borderRadius: '50%', background: color || PALETTE.border, display: 'inline-block', flexShrink: 0 }} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} style={btnSmall}>Cancelar</button>
                <button type="submit" style={btnPrimary}>Criar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
