import { ReactNode, useEffect, useState } from 'react'
import { useRouter } from 'next/router'

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const router = useRouter()
  const [role, setRole] = useState<string | null>(null)

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('plantoes_token') : null
    if (!token) {
      router.push('/login')
      return
    }
    setRole(token === 'ADMIN_TOKEN' ? 'admin' : 'guest')
  }, [router])

  function logout() {
    localStorage.removeItem('plantoes_token')
    router.push('/login')
  }

  return (
    <div style={{display:'flex',minHeight:'100%'}}>
      <aside style={{width:220,padding:16,background:'#f5f5f5'}}>
        <h2>Plantoes</h2>
        <p style={{marginTop:4,marginBottom:12}}>Role: <strong>{role}</strong></p>
        <nav style={{display:'flex',flexDirection:'column',gap:8}}>
          <a href="/dashboard">Dashboard</a>
          <a href="/calendar">Calendário / Rodízios</a>
          <a href="/workers">Trabalhadores</a>
          <a href="/holidays">Feriados</a>
          <a href="/assignments">Atribuições (manual)</a>
        </nav>
        <div style={{marginTop:20}}>
          <button onClick={logout}>Logout</button>
        </div>
      </aside>
      <main style={{flex:1,padding:20}}>{children}</main>
    </div>
  )
}
