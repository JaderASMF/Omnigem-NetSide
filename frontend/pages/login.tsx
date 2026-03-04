import { useState } from 'react'
import { useRouter } from 'next/router'
import { PALETTE, btnPrimary, btnCancel, inputStyle } from '../styles/theme'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()

  function handleLogin(e:any) {
    e.preventDefault()
    setError('')
    if (email === 'admin' && password === 'admin123') {
      localStorage.setItem('plantoes_token', 'ADMIN_TOKEN')
      router.push('/dashboard')
      return
    }
    setError('Credenciais inválidas. Usuário: admin / Senha: admin123')
  }

  return (
    <main style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: PALETTE.background,
      fontFamily: 'system-ui, sans-serif',
    }}>
      <div style={{
        background: PALETTE.cardBg,
        border: `1px solid ${PALETTE.border}`,
        borderRadius: 12,
        padding: '40px 36px',
        width: 400,
        boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
      }}>
        <h1 style={{ margin: '0 0 8px 0', color: PALETTE.textPrimary, fontSize: 24 }}>Login</h1>
        <p style={{ margin: '0 0 24px 0', color: PALETTE.textSecondary, fontSize: 14 }}>Acesse o sistema de plantões</p>
        <form onSubmit={handleLogin} style={{ display: 'grid', gap: 12 }}>
          <div>
            <label style={{ display: 'block', fontWeight: 600, fontSize: 13, color: PALETTE.textSecondary, marginBottom: 4 }}>Usuário</label>
            <input
              placeholder="admin"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoFocus
              style={inputStyle}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontWeight: 600, fontSize: 13, color: PALETTE.textSecondary, marginBottom: 4 }}>Senha</label>
            <input
              placeholder="••••••••"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={inputStyle}
            />
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
            <button type="submit" style={{ ...btnPrimary, flex: 1 }}>Entrar</button>
            <button type="button" onClick={() => {
              localStorage.setItem('plantoes_token', 'GUEST_TOKEN')
              router.push('/dashboard')
            }} style={{ ...btnCancel, flex: 1, fontSize: 13 }}>Acessar como guest</button>
          </div>
        </form>
        {error && <p style={{ color: PALETTE.error, fontSize: 13, marginTop: 12, padding: '8px 10px', background: `${PALETTE.error}18`, borderRadius: 6, border: `1px solid ${PALETTE.error}44` }}>{error}</p>}
      </div>
    </main>
  )
}
