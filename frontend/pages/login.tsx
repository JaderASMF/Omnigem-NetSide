import { useState } from 'react'
import { useRouter } from 'next/router'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()

  function handleLogin(e:any) {
    e.preventDefault()
    setError('')
    // Credenciais locais: usuário "admin" e senha "admin123"
      if (email === 'admin' && password === 'admin123') {
        localStorage.setItem('plantoes_token', 'ADMIN_TOKEN')
        router.push('/dashboard')
        return
    }
    setError('Credenciais inválidas. Usuário: admin / Senha: admin123')
  }

  return (
    <main style={{padding:32,fontFamily:'Arial'}}>
      <h1>Login</h1>
      <form onSubmit={handleLogin} style={{display:'grid',gap:8,maxWidth:360}}>
        <input placeholder="Usuário" value={email} onChange={(e)=>setEmail(e.target.value)} autoFocus />
        <input placeholder="Senha" type="password" value={password} onChange={(e)=>setPassword(e.target.value)} />
        <div style={{display:'flex',gap:8}}>
          <button type="submit">Entrar</button>
          <button type="button" onClick={() => {
              localStorage.setItem('plantoes_token', 'GUEST_TOKEN')
              router.push('/dashboard')
          }}>Acessar como guest</button>
        </div>
      </form>
      {error && <p style={{color:'red'}}>{error}</p>}
    </main>
  )
}
