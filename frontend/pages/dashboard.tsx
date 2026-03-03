import DashboardLayout from '../components/DashboardLayout'

export default function DashboardPage() {
  return (
    <DashboardLayout>
      <h1>Dashboard</h1>
      <p>Bem-vindo ao painel. Use o menu à esquerda para navegar entre as telas de administração.</p>
      <div style={{ marginTop: 16 }}>
        <a href="/calendar"><button>Open Calendar</button></a>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))',gap:12,marginTop:16}}>
        <a href="/calendar" style={{padding:12,background:'#fff',border:'1px solid #ddd',textAlign:'center'}}>Calendário / Rodízios</a>
        <a href="/workers" style={{padding:12,background:'#fff',border:'1px solid #ddd',textAlign:'center'}}>Trabalhadores</a>
        <a href="/holidays" style={{padding:12,background:'#fff',border:'1px solid #ddd',textAlign:'center'}}>Feriados</a>
        <a href="/assignments" style={{padding:12,background:'#fff',border:'1px solid #ddd',textAlign:'center'}}>Atribuições (manual)</a>
      </div>
    </DashboardLayout>
  )
}
