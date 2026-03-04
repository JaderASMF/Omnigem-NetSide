import React, { createContext, useCallback, useContext, useState } from 'react'
import { PALETTE } from '../styles/theme'

type Toast = { id: number; message: string; type: 'info' | 'success' | 'error' }

type ToastContextValue = {
  addToast: (message: string, type?: Toast['type'], timeout?: number) => number
  removeToast: (id: number) => void
}

const ToastContext = createContext<ToastContextValue>({
  addToast: () => 0,
  removeToast: () => {},
})

export const useToast = () => useContext(ToastContext)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const removeToast = useCallback((id: number) => {
    setToasts((s) => s.filter((t) => t.id !== id))
  }, [])

  const addToast = useCallback((message: string, type: Toast['type'] = 'info', timeout = 5000) => {
    const id = Date.now() + Math.floor(Math.random() * 1000)
    const t: Toast = { id, message, type }
    setToasts((s) => [t, ...s])
    if (timeout > 0) setTimeout(() => removeToast(id), timeout)
    return id
  }, [removeToast])

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      <div style={{ position: 'fixed', right: 16, top: 16, zIndex: 9999, display: 'flex', flexDirection: 'column', gap: 8 }}>
        {toasts.map((t) => (
          <div key={t.id} style={{ minWidth: 260, maxWidth: 380, padding: '10px 12px', borderRadius: 8, boxShadow: '0 6px 18px rgba(0,0,0,0.2)', color: '#fff', background: t.type === 'error' ? PALETTE.error : t.type === 'success' ? PALETTE.success : PALETTE.primary }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
              <div style={{ fontSize: 13 }}>{t.message}</div>
              <button onClick={() => removeToast(t.id)} style={{ marginLeft: 8, background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.9)', cursor: 'pointer' }}>✕</button>
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export default ToastProvider
