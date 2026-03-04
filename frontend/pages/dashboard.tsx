import { useEffect, useState } from 'react'
import DashboardLayout from '../components/DashboardLayout'
import { PALETTE } from '../styles/theme'
import { API_BASE } from '../config/api'

type CalendarEntry = {
  workerId: number | null
  workerName: string | null
  workerColor?: string | null
  source: string
  rotationId?: number
  rotationName?: string
  note?: string
  notifyUpcoming?: boolean
}

type DayData = {
  entries: CalendarEntry[]
  holiday?: { id: number; name: string | null; recurring: boolean }
}

type CalendarMap = Record<string, DayData>

type UpcomingRotationInfo = {
  date: string
  workers: string[]
  rotationName?: string
}

function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10)
}

export default function DashboardPage() {
  const [upcoming, setUpcoming] = useState<UpcomingRotationInfo | null>(null)
  const [hideUpcoming, setHideUpcoming] = useState(false)

  useEffect(() => {
    async function loadUpcoming() {
      try {
        const today = new Date()
        const end = new Date(today)
        end.setUTCDate(end.getUTCDate() + 7)

        const startIso = isoDate(today)
        const endIso = isoDate(end)

        const res = await fetch(`${API_BASE}/rotations/calendar?startDate=${startIso}&endDate=${endIso}`)
        if (!res.ok) return

        const data: CalendarMap = await res.json()

        // percorre os dias em ordem cronológica, procurando a primeira data
        // com pelo menos uma entrada marcada com notifyUpcoming
        let current = new Date(today)
        while (current <= end) {
          const key = isoDate(current)
          const day = data[key]
          if (day && day.entries?.length) {
            const flagged = day.entries.filter((e) => e.notifyUpcoming)
            if (flagged.length) {
              const workers = Array.from(
                new Set(
                  flagged.map((e) => e.workerName || 'Trabalhador sem nome'),
                ),
              )
              const rotationName = flagged[0].rotationName
              setUpcoming({ date: key, workers, rotationName: rotationName || undefined })
              return
            }
          }
          current.setUTCDate(current.getUTCDate() + 1)
        }
      } catch (e) {
        console.error(e)
      }
    }

    if (!hideUpcoming) {
      loadUpcoming()
    }
  }, [hideUpcoming])

  const dashboardContent = (
    <>
      <h1 style={{ margin: '0 0 8px 0', fontSize: 22, color: PALETTE.textPrimary }}>Dashboard</h1>
      <p style={{ margin: '0 0 24px 0', color: PALETTE.textSecondary, fontSize: 14 }}>Bem-vindo ao painel. Use o menu à esquerda para navegar entre as seções.</p>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: 16,
      }}>
        {[
          { label: 'Calendário / Rodízios', desc: 'Visualizar e gerenciar escalas', icon: '📅', href: '/calendar' },
          { label: 'Trabalhadores', desc: 'Cadastro de profissionais', icon: '👷', href: '/dashboard?tab=workers' },
          { label: 'Feriados', desc: 'Gerenciar feriados', icon: '🎉', href: '/dashboard?tab=holidays' },
          { label: 'Atribuições', desc: 'Atribuições manuais', icon: '📋', href: '/dashboard?tab=assignments' },
          { label: 'Relatórios', desc: 'Relatórios de plantões', icon: '📊', href: '/dashboard?tab=reports' },
        ].map(item => (
          <a
            key={item.label}
            href={item.href ?? '#'}
            style={{
              padding: 20,
              background: PALETTE.cardBg,
              border: `1px solid ${PALETTE.border}`,
              borderRadius: 10,
              textDecoration: 'none',
              color: PALETTE.textPrimary,
              display: 'flex',
              flexDirection: 'column',
              gap: 6,
              transition: 'border-color 0.2s, background 0.2s',
            }}
          >
            <span style={{ fontSize: 28 }}>{item.icon}</span>
            <strong style={{ fontSize: 15 }}>{item.label}</strong>
            <span style={{ fontSize: 12, color: PALETTE.textSecondary }}>{item.desc}</span>
          </a>
        ))}
      </div>

      {upcoming && !hideUpcoming && (
        <div
          style={{
            position: 'fixed',
            left: '264px',
            bottom: 20,
            zIndex: 900,
          }}
        >
          <div
            style={{
              background: `${PALETTE.error}18`,
              border: `1px solid ${PALETTE.error}55`,
              borderRadius: 10,
              padding: '12px 14px',
              maxWidth: 360,
              boxShadow: '0 6px 20px rgba(0,0,0,0.5)',
              color: PALETTE.textPrimary,
              display: 'flex',
              flexDirection: 'column',
              gap: 6,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
              <div style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.5, color: PALETTE.error, fontWeight: 700 }}>
                Aviso de rodízio
              </div>
              <button
                onClick={() => setHideUpcoming(true)}
                style={{
                  border: 'none',
                  background: 'transparent',
                  color: PALETTE.textSecondary,
                  cursor: 'pointer',
                  fontSize: 14,
                  padding: 0,
                }}
              >
                ✕
              </button>
            </div>
            <div style={{ fontSize: 14 }}>
              {(() => {
                const d = new Date(`${upcoming.date}T00:00:00Z`)
                const formatted = d.toLocaleDateString('pt-BR', {
                  day: '2-digit',
                  month: 'short',
                })
                const workersLabel = upcoming.workers.join(', ')
                const rotationLabel = upcoming.rotationName || 'Rodízio'
                return `${rotationLabel} possui plantão marcado em ${formatted} para: ${workersLabel}.`
              })()}
            </div>
          </div>
        </div>
      )}
    </>
  );

  return <DashboardLayout dashboardContent={dashboardContent} />;
}
