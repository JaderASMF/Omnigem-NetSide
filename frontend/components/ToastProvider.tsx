import React, { createContext, useCallback, useContext, useState } from 'react'
import { PALETTE } from '../styles/theme'

type Toast = { id: number; message: string; type: 'info' | 'success' | 'error'; position?: 'top-right' | 'bottom-left' | 'bottom-right' }

type ToastContextValue = {
  addToast: (message: string, type?: Toast['type'], timeout?: number, position?: Toast['position']) => number
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

  const addToast = useCallback((message: string, type: Toast['type'] = 'info', timeout = 5000, position: Toast['position'] = 'top-right') => {
    const id = Date.now() + Math.floor(Math.random() * 1000)
    const t: Toast = { id, message, type, position }
    setToasts((s) => [t, ...s])
    if (timeout > 0) setTimeout(() => removeToast(id), timeout)
    return id
  }, [removeToast])

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      {/* Top-right toasts (default) */}
      <div style={{ position: 'fixed', right: 16, top: 16, zIndex: 9999, display: 'flex', flexDirection: 'column', gap: 8 }}>
        {toasts.filter(t => (t.position ?? 'top-right') === 'top-right').map((t) => (
          <div key={t.id} style={{ minWidth: 260, maxWidth: 380, padding: '10px 12px', borderRadius: 8, boxShadow: '0 6px 18px rgba(0,0,0,0.2)', color: '#fff', background: t.type === 'error' ? PALETTE.error : t.type === 'success' ? PALETTE.success : PALETTE.primary }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
              <div style={{ fontSize: 13 }}>{t.message}</div>
              <button onClick={() => removeToast(t.id)} style={{ marginLeft: 8, background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.9)', cursor: 'pointer' }}>✕</button>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom-left toasts (for announcements like anniversaries) */}
      <div style={{ position: 'fixed', left: 16, bottom: 16, zIndex: 9999, display: 'flex', flexDirection: 'column-reverse', gap: 8, alignItems: 'flex-start' }}>
        {toasts.filter(t => t.position === 'bottom-left').map((t) => (
          <div key={t.id} style={{ minWidth: 260, maxWidth: 380, padding: '10px 12px', borderRadius: 8, boxShadow: '0 6px 18px rgba(0,0,0,0.2)', color: '#fff', background: t.type === 'error' ? PALETTE.error : t.type === 'success' ? PALETTE.success : PALETTE.primary }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
              <div style={{ fontSize: 13 }}>{t.message}</div>
              <button onClick={() => removeToast(t.id)} style={{ marginLeft: 8, background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.9)', cursor: 'pointer' }}>✕</button>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom-right toasts (preferred for anniversary notices) */}
      <div style={{ position: 'fixed', right: 16, bottom: 16, zIndex: 9999, display: 'flex', flexDirection: 'column-reverse', gap: 8, alignItems: 'flex-end' }}>
        {toasts.filter(t => t.position === 'bottom-right').map((t) => (
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
