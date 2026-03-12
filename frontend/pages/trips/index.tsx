import { useEffect, useState, useCallback, useRef } from 'react'
import { useRouter } from 'next/router'
import { API_BASE, authHeaders, jsonAuthHeaders } from '../../config/api'
import {
  PALETTE, btnPrimary, btnCancel, btnDanger, btnSmallBlue, btnSmallRed,
  cardStyle, inputStyle, selectStyle, labelStyle, btnNav,
} from '../../styles/theme'
import { useToast } from '../../components/shared/ToastProvider'
import WorkersContent from '../../components/shared/WorkersContent'

type City = { id: number; name: string; state?: string; country?: string }
type Vehicle = { id: number; plate?: string; model?: string; notes?: string }
type Worker = { id: number; name: string; doesTravel?: boolean; active?: boolean }
type Trip = {
  id: number; date: string; cityId: number; city?: City; vehicleId?: number; vehicle?: Vehicle
  client?: string; serviceTypeId: number
  serviceType?: { id: number; name: string; code?: string }
  price?: number
  mealExpense?: number; fuelExpense?: number; extraExpense?: number; notesExtraExpense?: string
  kmDriven?: number; costPerKm?: number; profitPerKm?: number
  avgConsumption?: number; remainingAutonomy?: number
  travelers?: Worker[]; drivers?: Worker[]; note?: string
  completed?: boolean; endDate?: string
  createdAt: string; updatedAt?: string
}

const EMPTY_FORM = {
  date: '', cityId: '', vehicleId: '', client: '', serviceTypeId: '',
  mealExpense: '', fuelExpense: '', extraExpense: '', notesExtraExpense: '', price: '',
  kmDriven: '', costPerKm: '', profitPerKm: '', avgConsumption: '', remainingAutonomy: '',
  total: '',
  travelerIds: [] as number[], driverIds: [] as number[], note: '', endDate: '',
}

const overlay: React.CSSProperties = {
  position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 1000,
  display: 'flex', alignItems: 'center', justifyContent: 'center',
}

const modal: React.CSSProperties = {
  background: PALETTE.cardBg, border: `1px solid ${PALETTE.border}`,
  borderRadius: 8, padding: 12, width: 860, maxHeight: '88vh', overflowY: 'auto',
}
const smallModal: React.CSSProperties = { ...modal, width: 420 }
const moneyWrapper: React.CSSProperties = { position: 'relative' }
const moneyPrefix: React.CSSProperties = {
  position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)',
  color: PALETTE.textSecondary, fontSize: 12, pointerEvents: 'none'
}

function num(v: any): number | undefined { const n = Number(v); return isNaN(n) ? undefined : n }
function toDateInput(iso: string) {
  if (!iso) return ''
  if (iso.includes('T')) return iso.split('T')[0]
  return iso.slice(0, 10)
}
function money(v: any) { const n = Number(v); return isNaN(n) || n === 0 ? '' : `R$ ${n.toFixed(2)}` }
function decimal(v: any) { const n = Number(v); return isNaN(n) || n === 0 ? '' : n.toFixed(2) }
function truncate(s: string | undefined, n = 80) { if (!s) return ''; return s.length > n ? s.slice(0, n) + '…' : s }

const cellSingleLine: React.CSSProperties = { whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }

export default function Trips() {
  const router = useRouter()
  const { addToast } = useToast()

  const [trips, setTrips] = useState<Trip[]>([])
  const [cities, setCities] = useState<City[]>([])
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [workers, setWorkers] = useState<Worker[]>([])
  const [loading, setLoading] = useState(false)

  const [filterStart, setFilterStart] = useState('')
  const [filterEnd, setFilterEnd] = useState('')
  const [filterCity, setFilterCity] = useState('')
  const [filterVehicle, setFilterVehicle] = useState('')
  const [filterType, setFilterType] = useState('')
  const [serviceTypes, setServiceTypes] = useState<{ id: number; name: string; code?: string }[]>([])

  const [showTripModal, setShowTripModal] = useState(false)
  const [editingTrip, setEditingTrip] = useState<Trip | null>(null)
  const [form, setForm] = useState({ ...EMPTY_FORM })
  const [mealEdited, setMealEdited] = useState(false)
  const [costEdited, setCostEdited] = useState(false)
  const [calcDirty, setCalcDirty] = useState(false)

  const [showCityModal, setShowCityModal] = useState(false)
  const [cityForm, setCityForm] = useState({ name: '', state: '', country: 'BR' })
  const [editingCity, setEditingCity] = useState<City | null>(null)

  const [showVehicleModal, setShowVehicleModal] = useState(false)
  const [vehicleForm, setVehicleForm] = useState({ plate: '', model: '', notes: '' })
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null)

  const [showExtraNoteModal, setShowExtraNoteModal] = useState(false)
  const extraNoteInputRef = useRef<HTMLInputElement | null>(null)

  const [showManageCities, setShowManageCities] = useState(false)
  const [showManageVehicles, setShowManageVehicles] = useState(false)
  const [showManageWorkers, setShowManageWorkers] = useState(false)

  const [hoveredRow, setHoveredRow] = useState<number | null>(null)

  const [showServiceTypeModal, setShowServiceTypeModal] = useState(false)
  const [serviceTypeForm, setServiceTypeForm] = useState({ name: '', code: '' })
  const [editingServiceType, setEditingServiceType] = useState<{ id: number; name: string; code?: string } | null>(null)

  const [confirmDelete, setConfirmDelete] = useState<Trip | null>(null)

  const [defaultMealExpense, setDefaultMealExpense] = useState<number | null>(null)
  const [showSettingsModal, setShowSettingsModal] = useState(false)
  const [settingsMealValue, setSettingsMealValue] = useState('')

  const [tab, setTab] = useState<'trips' | 'cities' | 'vehicles' | 'serviceTypes'>('trips')
  const [showFilters, setShowFilters] = useState(false)

  const fetchTrips = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filterStart) params.set('startDate', filterStart)
      if (filterEnd) params.set('endDate', filterEnd)
      const res = await fetch(`${API_BASE}/trips?${params}`, { headers: authHeaders() })
      setTrips(await res.json())
    } catch { setTrips([]) } finally { setLoading(false) }
  }, [filterStart, filterEnd])

  const fetchCities = useCallback(async () => {
    try { const r = await fetch(`${API_BASE}/cities`, { headers: authHeaders() }); setCities(await r.json()) } catch { setCities([]) }
  }, [])

  const fetchServiceTypes = useCallback(async () => {
    try {
      const r = await fetch(`${API_BASE}/service-types`, { headers: authHeaders() })
      const list = await r.json()
      list.sort((a: any, b: any) => (a.code ?? '').toString().localeCompare((b.code ?? '').toString(), undefined, { numeric: true }))
      setServiceTypes(list)
    } catch {
      setServiceTypes([])
    }
  }, [])

  const fetchVehicles = useCallback(async () => {
    try { const r = await fetch(`${API_BASE}/vehicles`, { headers: authHeaders() }); setVehicles(await r.json()) } catch { setVehicles([]) }
  }, [])

  const fetchWorkers = useCallback(async () => {
    try {
      const r = await fetch(`${API_BASE}/workers`, { headers: authHeaders() })
      const all: Worker[] = await r.json()
      setWorkers(all.filter(w => w.active !== false && w.doesTravel === true))
    } catch { setWorkers([]) }
  }, [])

  useEffect(() => { fetchTrips() }, [fetchTrips])

  const fetchSettings = useCallback(async () => {
    try {
      const r = await fetch(`${API_BASE}/settings/mealExpense`, { headers: authHeaders() })
      if (!r.ok) return
      const j = await r.json()
      setDefaultMealExpense(j.value)
      setSettingsMealValue(String(j.value ?? ''))
    } catch {
    }
  }, [])

  useEffect(() => { fetchCities(); fetchVehicles(); fetchWorkers(); fetchSettings(); fetchServiceTypes() }, [fetchCities, fetchVehicles, fetchWorkers, fetchSettings, fetchServiceTypes])

  useEffect(() => {
    if (showExtraNoteModal) extraNoteInputRef.current?.focus()
  }, [showExtraNoteModal])

  function openNewTrip() {
    setEditingTrip(null)
    setForm({ ...EMPTY_FORM, mealExpense: defaultMealExpense != null ? String(defaultMealExpense) : '' })
    setMealEdited(false)
    setCostEdited(false)
    setCalcDirty(false)
    setShowTripModal(true)
  }
  
  function openEditTrip(t: Trip) {
    setEditingTrip(t)
    const kmDriven = t.kmDriven ?? 0
    const totalExp = (Number(t.mealExpense) || 0) + (Number(t.fuelExpense) || 0) + (Number(t.extraExpense) || 0)
    const priceVal = Number(t.price) || 0
    const computedCost = kmDriven > 0 ? (totalExp / kmDriven) : undefined
    const computedProfit = kmDriven > 0 ? ((priceVal - totalExp) / kmDriven) : undefined
    const computedTotalValue = priceVal - totalExp
    setForm({
      date: toDateInput(t.date),
      cityId: String(t.cityId),
      vehicleId: t.vehicleId ? String(t.vehicleId) : '',
      client: t.client ?? '',
      serviceTypeId: t.serviceTypeId ? String(t.serviceTypeId) : '',
      price: t.price != null ? String(t.price) : '',
      mealExpense: t.mealExpense != null ? String(t.mealExpense) : '',
      fuelExpense: t.fuelExpense != null ? String(t.fuelExpense) : '',
      extraExpense: t.extraExpense != null ? String(t.extraExpense) : '',
      notesExtraExpense: t.notesExtraExpense ?? '',
      kmDriven: t.kmDriven != null ? String(t.kmDriven) : '',
      costPerKm: t.costPerKm != null ? String(t.costPerKm) : (computedCost != null ? String(Number(computedCost).toFixed(2)) : ''),
      profitPerKm: t.profitPerKm != null ? String(t.profitPerKm) : (computedProfit != null ? String(Number(computedProfit).toFixed(2)) : ''),
      avgConsumption: t.avgConsumption != null ? String(t.avgConsumption) : '',
      remainingAutonomy: t.remainingAutonomy != null ? String(t.remainingAutonomy) : '',
      total: String(Number(computedTotalValue).toFixed(2)),
      travelerIds: t.travelers?.map(w => w.id) ?? [],
      driverIds: t.drivers?.map(w => w.id) ?? [],
      note: t.note ?? '',
      endDate: t.endDate ? toDateInput(t.endDate) : '',
    })
    setMealEdited(true)
    setCostEdited(t.costPerKm != null)
    setCalcDirty(false)
    setShowTripModal(true)
  }

  function handleRecalculate() {
    const meal = Number(form.mealExpense) || 0
    const fuel = Number(form.fuelExpense) || 0
    const extra = Number(form.extraExpense) || 0
    const km = Number(form.kmDriven) || 0
    const price = Number(form.price) || 0
    const computedTotal = price - (meal + fuel + extra)
    const totalDisplay = String(Number(computedTotal).toFixed(2))
    let costDisplay = ''
    let profitDisplay = ''
    if (km > 0) {
      const computedCost = (meal + fuel + extra) / km
      const computedProfit = computedTotal / km
      costDisplay = String(Number(computedCost).toFixed(2))
      profitDisplay = String(Number(computedProfit).toFixed(2))
    }
    setForm(f => ({ ...f, total: totalDisplay, costPerKm: costDisplay, profitPerKm: profitDisplay }))
    setCalcDirty(false)
  }

  useEffect(() => {
    if (!showTripModal) return
    if (costEdited) return
    const meal = Number(form.mealExpense) || 0
    const fuel = Number(form.fuelExpense) || 0
    const extra = Number(form.extraExpense) || 0
    const km = Number(form.kmDriven) || 0
    const price = Number(form.price) || 0
    const computedTotal = price - (meal + fuel + extra)
    const displayTotal = String(Number(computedTotal).toFixed(2))
    if ((form.total || '') !== displayTotal) setForm(f => ({ ...f, total: displayTotal }))
    if (km <= 0) return
    const computedCost = (meal + fuel + extra) / km
    const displayCost = String(Number(computedCost).toFixed(2))
    if (form.costPerKm !== displayCost) setForm(f => ({ ...f, costPerKm: displayCost }))
    if (!form.profitPerKm || form.profitPerKm === '') {
      const computedProfit = computedTotal / km
      const displayProfit = String(Number(computedProfit).toFixed(2))
      if (form.profitPerKm !== displayProfit) setForm(f => ({ ...f, profitPerKm: displayProfit }))
    }
  }, [form.mealExpense, form.fuelExpense, form.extraExpense, form.kmDriven, form.price, costEdited, showTripModal])

  async function handleSaveTrip(e: React.FormEvent) {
    e.preventDefault()
    const meal = num(form.mealExpense) || 0
    const fuel = num(form.fuelExpense) || 0
    const extra = num(form.extraExpense) || 0
    const km = num(form.kmDriven) || 0
    const computedCostPerKm = km > 0 ? (meal + fuel + extra) / km : undefined
    const computedProfitPerKm = km > 0 ? ((num(form.price) || 0 - (meal + fuel + extra)) / km) : undefined

    const payload: any = {
      date: form.date, cityId: Number(form.cityId),
      price: num(form.price) ?? null,
      vehicleId: form.vehicleId ? Number(form.vehicleId) : null,
      client: form.client || null,
      serviceTypeId: Number(form.serviceTypeId),
      mealExpense: num(form.mealExpense), fuelExpense: num(form.fuelExpense),
      extraExpense: num(form.extraExpense), notesExtraExpense: form.notesExtraExpense || null,
      kmDriven: num(form.kmDriven),
      costPerKm: (num(form.costPerKm) ?? computedCostPerKm) ?? null,
      profitPerKm: (num(form.profitPerKm) ?? computedProfitPerKm) ?? null,
      avgConsumption: num(form.avgConsumption), remainingAutonomy: num(form.remainingAutonomy),
      travelerIds: form.travelerIds, driverIds: form.driverIds,
      note: form.note || null,
      endDate: form.endDate ? new Date(form.endDate + 'T00:00:00').toISOString() : null,
    }
    try {
      const url = editingTrip ? `${API_BASE}/trips/${editingTrip.id}` : `${API_BASE}/trips`
      const method = editingTrip ? 'PUT' : 'POST'
      const res = await fetch(url, { method, headers: jsonAuthHeaders(), body: JSON.stringify(payload) })
      if (!res.ok) { const e = await res.json().catch(() => null); throw new Error(e?.message || 'Erro') }
      addToast(editingTrip ? 'Viagem atualizada' : 'Viagem criada', 'success')
      setShowTripModal(false)
      await fetchTrips()
    } catch (err: any) { addToast(err?.message || 'Erro ao salvar', 'error') }
  }

  async function handleDeleteTrip() {
    if (!confirmDelete) return
    try {
      const res = await fetch(`${API_BASE}/trips/${confirmDelete.id}`, { method: 'DELETE', headers: jsonAuthHeaders() })
      if (!res.ok) throw new Error('Erro')
      addToast('Viagem excluída', 'success')
      setConfirmDelete(null)
      await fetchTrips()
    } catch { addToast('Erro ao excluir', 'error') }
  }

  async function handleMarkComplete(t: Trip) {
    try {
      const res = await fetch(`${API_BASE}/trips/${t.id}/complete`, { method: 'PUT', headers: jsonAuthHeaders() })
      if (!res.ok) throw new Error('Erro')
      addToast('Viagem marcada como completa', 'success')
      await fetchTrips()
    } catch { addToast('Erro ao marcar completa', 'error') }
  }

  function openNewCity() { setEditingCity(null); setCityForm({ name: '', state: '', country: 'BR' }); setShowCityModal(true) }
  function openEditCity(c: City) { setEditingCity(c); setCityForm({ name: c.name, state: c.state ?? '', country: c.country ?? 'BR' }); setShowCityModal(true) }
  async function handleSaveCity(e: React.FormEvent) {
    e.preventDefault()
    try {
      const url = editingCity ? `${API_BASE}/cities/${editingCity.id}` : `${API_BASE}/cities`
      const method = editingCity ? 'PUT' : 'POST'
      const res = await fetch(url, { method, headers: jsonAuthHeaders(), body: JSON.stringify(cityForm) })
      if (!res.ok) throw new Error('Erro')
      addToast(editingCity ? 'Cidade atualizada' : 'Cidade criada', 'success')
      setShowCityModal(false); await fetchCities()
    } catch { addToast('Erro ao salvar cidade', 'error') }
  }
  async function handleDeleteCity(id: number) {
    if (!confirm('Excluir cidade?')) return
    try {
      const res = await fetch(`${API_BASE}/cities/${id}`, { method: 'DELETE', headers: jsonAuthHeaders() })
      if (!res.ok) throw new Error('Erro')
      addToast('Cidade excluída', 'success'); await fetchCities()
    } catch { addToast('Erro ao excluir (pode ter viagens vinculadas)', 'error') }
  }

  function openNewVehicle() { setEditingVehicle(null); setVehicleForm({ plate: '', model: '', notes: '' }); setShowVehicleModal(true) }
  function openEditVehicle(v: Vehicle) { setEditingVehicle(v); setVehicleForm({ plate: v.plate ?? '', model: v.model ?? '', notes: v.notes ?? '' }); setShowVehicleModal(true) }
  async function handleSaveVehicle(e: React.FormEvent) {
    e.preventDefault()
    try {
      const url = editingVehicle ? `${API_BASE}/vehicles/${editingVehicle.id}` : `${API_BASE}/vehicles`
      const method = editingVehicle ? 'PUT' : 'POST'
      const res = await fetch(url, { method, headers: jsonAuthHeaders(), body: JSON.stringify(vehicleForm) })
      if (!res.ok) throw new Error('Erro')
      addToast(editingVehicle ? 'Veículo atualizado' : 'Veículo criado', 'success')
      setShowVehicleModal(false); await fetchVehicles()
    } catch { addToast('Erro ao salvar veículo', 'error') }
  }
  async function handleDeleteVehicle(id: number) {
    if (!confirm('Excluir veículo?')) return
    try {
      const res = await fetch(`${API_BASE}/vehicles/${id}`, { method: 'DELETE', headers: jsonAuthHeaders() })
      if (!res.ok) throw new Error('Erro')
      addToast('Veículo excluído', 'success'); await fetchVehicles()
    } catch { addToast('Erro ao excluir (pode ter viagens vinculadas)', 'error') }
  }

  function openNewServiceType() { setEditingServiceType(null); setServiceTypeForm({ name: '', code: '' }); setShowServiceTypeModal(true) }
  function openEditServiceType(s: { id: number; name: string; code?: string }) { setEditingServiceType(s); setServiceTypeForm({ name: s.name, code: s.code ?? '' }); setShowServiceTypeModal(true) }

  async function handleSaveServiceType(e: React.FormEvent) {
    e.preventDefault()
    try {
      const url = editingServiceType ? `${API_BASE}/service-types/${editingServiceType.id}` : `${API_BASE}/service-types`
      const method = editingServiceType ? 'PUT' : 'POST'
      const res = await fetch(url, { method, headers: jsonAuthHeaders(), body: JSON.stringify(serviceTypeForm) })
      if (!res.ok) { const j = await res.json().catch(() => null); throw new Error(j?.message || 'Erro') }
      addToast(editingServiceType ? 'Tipo atualizado' : 'Tipo criado', 'success')
      setShowServiceTypeModal(false)
      await fetchServiceTypes()
    } catch (err: any) { addToast(err?.message || 'Erro ao salvar', 'error') }
  }

  async function handleDeleteServiceType(id: number) {
    if (!confirm('Excluir tipo de serviço?')) return
    try {
      const res = await fetch(`${API_BASE}/service-types/${id}`, { method: 'DELETE', headers: jsonAuthHeaders() })
      if (!res.ok) throw new Error('Erro')
      addToast('Tipo excluído', 'success')
      await fetchServiceTypes()
    } catch { addToast('Erro ao excluir (pode ter viagens vinculadas)', 'error') }
  }

  const filtered = trips.filter(t => {
    if (filterCity && t.cityId !== Number(filterCity)) return false
    if (filterVehicle && t.vehicleId !== Number(filterVehicle)) return false
    if (filterType !== '' && t.serviceTypeId !== Number(filterType)) return false
    return true
  })

  function toggleTraveler(wid: number) {
    setForm(f => {
      const removed = f.travelerIds.includes(wid)
      const travelerIds = removed ? f.travelerIds.filter(x => x !== wid) : [...f.travelerIds, wid]
      const driverIds = removed ? (f.driverIds || []).filter(x => x !== wid) : f.driverIds
      let mealExpense = f.mealExpense
      if (!mealEdited && defaultMealExpense != null) {
        const total = defaultMealExpense * travelerIds.length
        mealExpense = total ? String(total) : ''
      }
      return { ...f, travelerIds, driverIds, mealExpense }
    })
  }

  function toggleDriver(wid: number) {
    setForm(f => {
      const ids: number[] = f.driverIds || []
      const removed = ids.includes(wid)
      const driverIds = removed ? ids.filter(x => x !== wid) : [...ids, wid]
      return { ...f, driverIds }
    })
  }

  return (
    <main style={{ background: PALETTE.background, color: PALETTE.textPrimary, fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ margin: '0 auto' }}>

        <div style={{ padding: '16px 24px', display: 'flex', alignItems: 'center', gap: 16, borderBottom: `1px solid ${PALETTE.border}`, marginBottom: 12 }}>
          <button onClick={() => router.push('/selection')} style={btnNav}>← Voltar</button>
          <h2 style={{ margin: 0, fontSize: 22 }}>Viagens</h2>
          <button type="button" onClick={() => setShowManageWorkers(true)} style={btnNav}>Trabalhadores</button>
          <button type="button" onClick={() => setShowSettingsModal(true)} style={btnNav}>Padrões</button>
          <button onClick={openNewTrip} style={{ ...btnNav, background: PALETTE.success, color: '#fff', border: 'none' }}>+ Nova Viagem</button>
          <div style={{ flex: 1 }} />
          {(['trips', 'cities', 'vehicles', 'serviceTypes'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              ...btnNav,
              background: tab === t ? PALETTE.primary : PALETTE.hoverBg,
              color: tab === t ? '#fff' : PALETTE.textPrimary,
              border: tab === t ? 'none' : `1px solid ${PALETTE.border}`,
              fontWeight: tab === t ? 700 : 400,
            }}>
              {t === 'trips' ? 'Viagens' : t === 'cities' ? 'Cidades' : t === 'vehicles' ? 'Veículos' : 'Tipos'}
            </button>
          ))}
        </div>

        <div style={{ marginBottom: 12, padding: '0 24px' }}>
          <button type="button" onClick={() => setShowFilters(s => !s)} style={{ ...btnNav }}>
            {showFilters ? 'Ocultar Filtros' : 'Mostrar Filtros'}
          </button>
        </div>

        {tab === 'trips' && <>
          <div
            aria-hidden={!showFilters}
            style={{
              ...cardStyle,
              marginBottom: 12,
              overflow: 'hidden',
              marginLeft: 24, marginRight: 24,
              maxHeight: showFilters ? 520 : 0,
              transition: 'max-height 320ms cubic-bezier(.2,.9,.2,1), opacity 200ms ease',
              opacity: showFilters ? 1 : 0,
              pointerEvents: showFilters ? 'auto' : 'none',
            }}
          >
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'flex-end', padding: 8 }}>
              <div>
                <label style={labelStyle}>Data Início</label>
                <input type="date" value={filterStart} onChange={e => setFilterStart(e.target.value)} style={{ ...inputStyle, width: 150 }} />
              </div>
              <div>
                <label style={labelStyle}>Data Fim</label>
                <input type="date" value={filterEnd} onChange={e => setFilterEnd(e.target.value)} style={{ ...inputStyle, width: 150 }} />
              </div>
              <div>
                <label style={labelStyle}>Cidade</label>
                <select value={filterCity} onChange={e => setFilterCity(e.target.value)} style={{ ...selectStyle, width: 160 }}>
                  <option value="">Todas</option>
                  {cities.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Veículo</label>
                <select value={filterVehicle} onChange={e => setFilterVehicle(e.target.value)} style={{ ...selectStyle, width: 180 }}>
                  <option value="">Todos</option>
                  {vehicles.map(v => <option key={v.id} value={v.id}>{v.model ?? '—'}{v.plate ? ` (${v.plate})` : ''}</option>)}
                </select>
              </div>
              <div>
                      <label style={labelStyle}>Tipo</label>
                      <select value={filterType} onChange={e => setFilterType(e.target.value)} style={{ ...selectStyle, width: 140 }}>
                        <option value="">Todos</option>
                        {serviceTypes.map(s => (
                          <option key={s.id} value={s.id}>{s.name}</option>
                        ))}
                      </select>
              </div>
            </div>
          </div>

          {loading && <div style={{ color: PALETTE.textSecondary, padding: 12 }}>Carregando...</div>}
          {!loading && filtered.length === 0 && <div style={{ color: PALETTE.textSecondary, padding: 12 }}>Nenhuma viagem encontrada.</div>}

          <div style={{ ...cardStyle, padding: 12, marginLeft: 24, marginRight: 24, overflowX: 'auto', maxHeight: '60vh', overflowY: 'auto', borderRadius: 8 }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 800 }}>
                <thead>
                  <tr style={{ textAlign: 'left', borderBottom: `2px solid ${PALETTE.border}` }}>
                    <th style={{ padding: '10px 8px', width: 160, position: 'sticky', top: 0, background: PALETTE.cardBg, zIndex: 3 }}>Data</th>
                    <th style={{ padding: '10px 8px', width: 160, position: 'sticky', top: 0, background: PALETTE.cardBg, zIndex: 3 }}>Tipo</th>
                    <th style={{ padding: '10px 8px', position: 'sticky', top: 0, background: PALETTE.cardBg, zIndex: 3 }}>Cidade</th>
                    <th style={{ padding: '10px 8px', position: 'sticky', top: 0, background: PALETTE.cardBg, zIndex: 3 }}>Veículo</th>
                    <th style={{ padding: '10px 8px', position: 'sticky', top: 0, background: PALETTE.cardBg, zIndex: 3 }}>Passageiros</th>
                    <th style={{ padding: '10px 8px', position: 'sticky', top: 0, background: PALETTE.cardBg, zIndex: 3 }}>Motoristas</th>
                    <th style={{ padding: '10px 8px', textAlign: 'right', width: 140, position: 'sticky', top: 0, background: PALETTE.cardBg, zIndex: 3 }}>Custo/km (R$)</th>
                    <th style={{ padding: '10px 8px', textAlign: 'right', width: 140, position: 'sticky', top: 0, background: PALETTE.cardBg, zIndex: 3 }}>Lucro/km (R$)</th>
                    <th style={{ padding: '10px 8px', textAlign: 'right', width: 200, position: 'sticky', top: 0, background: PALETTE.cardBg, zIndex: 3 }}>Custo Total</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((t, i) => {
                    const totalExpense = (Number(t.mealExpense) || 0) + (Number(t.fuelExpense) || 0) + (Number(t.extraExpense) || 0)
                    const expenseStr = money(totalExpense)
                    const km = Number(t.kmDriven) || 0
                    const computedCostPerKm = t.costPerKm != null ? Number(t.costPerKm) : (km > 0 ? totalExpense / km : 0)
                    const costPerKmStr = money(computedCostPerKm)
                    const computedProfitPerKm = t.profitPerKm != null ? Number(t.profitPerKm) : (km > 0 ? ((Number(t.price) || 0 - totalExpense) / km) : 0)
                    const profitPerKmStr = money(computedProfitPerKm)
                    const priceVal = Number(t.price) || 0
                    const computedTotalValue = priceVal - totalExpense
                    const totalCostStr = money(computedTotalValue)
                    const rowBg = hoveredRow === t.id ? PALETTE.hoverBg : (i % 2 === 0 ? PALETTE.cardBg : PALETTE.hoverBg)
                    return (
                      <tr key={t.id} onClick={() => openEditTrip(t)} onMouseEnter={() => setHoveredRow(t.id)} onMouseLeave={() => setHoveredRow(null)} style={{ cursor: 'pointer', borderBottom: `1px solid ${PALETTE.border}`, background: rowBg, transition: 'background 120ms ease' }}>
                        <td style={{ padding: 10, verticalAlign: 'top', color: PALETTE.textSecondary, width: 160, ...cellSingleLine }}>
                          <div style={{ ...cellSingleLine }}>📅 {new Date(t.date).toLocaleDateString('pt-BR')}</div>
                        </td>
                        <td style={{ padding: 10, verticalAlign: 'top', maxWidth: 180, ...cellSingleLine }}>
                          <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 6, color: '#fff', background: PALETTE.primary, fontWeight: 600 }}>{t.serviceType?.name ?? '?'}</span>
                        </td>
                        <td style={{ padding: 10, verticalAlign: 'top', maxWidth: 300, ...cellSingleLine }}>
                          <div style={{ fontWeight: 700, minWidth: 140, ...cellSingleLine }}>{t.city?.name ?? '—'}</div>
                        </td>
                        <td style={{ padding: 10, verticalAlign: 'top', color: PALETTE.textSecondary, maxWidth: 220, ...cellSingleLine }}>{t.vehicle ? `${t.vehicle.model ?? '—'} ${t.vehicle.plate ? `(${t.vehicle.plate})` : ''}` : '—'}</td>
                        <td style={{ padding: 10, verticalAlign: 'top', color: PALETTE.textSecondary, maxWidth: 220, ...cellSingleLine }}>{t.travelers?.map((w: Worker) => w.name).join(', ') || '—'}</td>
                        <td style={{ padding: 10, verticalAlign: 'top', color: PALETTE.textSecondary, maxWidth: 220, ...cellSingleLine }}>{t.drivers?.map((w: Worker) => w.name).join(', ') || '—'}</td>
                        <td style={{ padding: 10, verticalAlign: 'top', textAlign: 'right', color: PALETTE.textSecondary, width: 140, ...cellSingleLine }}>
                          <div style={{ fontWeight: 600, color: costPerKmStr ? PALETTE.textPrimary : PALETTE.textSecondary }}>{costPerKmStr || '-'}</div>
                        </td>
                        <td style={{ padding: 10, verticalAlign: 'top', textAlign: 'right', color: PALETTE.textSecondary, width: 140, ...cellSingleLine }}>
                          <div style={{ fontWeight: 600, color: profitPerKmStr ? PALETTE.textPrimary : PALETTE.textSecondary }}>{profitPerKmStr || '-'}</div>
                        </td>
                        <td style={{ padding: 10, verticalAlign: 'top', textAlign: 'right', minWidth: 180, ...cellSingleLine }}>
                          <div style={{ fontWeight: 600, color: totalCostStr ? PALETTE.warning : PALETTE.textSecondary }}>{totalCostStr || expenseStr || '-'}</div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>}

        {tab === 'cities' && <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <h3 style={{ margin: 0 }}>Cidades</h3>
            <button onClick={openNewCity} style={btnPrimary as any}>+ Nova Cidade</button>
          </div>
          <div style={{ display: 'grid', gap: 6 }}>
            {cities.map(c => (
              <div key={c.id} style={{ ...cardStyle, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span style={{ fontWeight: 600 }}>{c.name}</span>
                  {c.state && <span style={{ color: PALETTE.textSecondary, marginLeft: 6, fontSize: 13 }}>— {c.state}</span>}
                  {c.country && c.country !== 'BR' && <span style={{ color: PALETTE.textSecondary, marginLeft: 4, fontSize: 12 }}>({c.country})</span>}
                </div>
                <div style={{ display: 'flex', gap: 4 }}>
                  <button onClick={() => openEditCity(c)} style={btnSmallBlue as any}>Editar</button>
                  <button onClick={() => handleDeleteCity(c.id)} style={btnSmallRed as any}>Excluir</button>
                </div>
              </div>
            ))}
            {cities.length === 0 && <div style={{ color: PALETTE.textSecondary }}>Nenhuma cidade cadastrada.</div>}
          </div>
        </>}

        {tab === 'vehicles' && <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <h3 style={{ margin: 0 }}>Veículos</h3>
            <button onClick={openNewVehicle} style={btnPrimary as any}>+ Novo Veículo</button>
          </div>
          <div style={{ display: 'grid', gap: 6 }}>
            {vehicles.map(v => (
              <div key={v.id} style={{ ...cardStyle, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span style={{ fontWeight: 600 }}>{v.model ?? '—'}</span>
                  {v.plate && <span style={{ color: PALETTE.textSecondary, marginLeft: 8, fontSize: 13 }}>Placa: {v.plate}</span>}
                  {v.notes && <div style={{ fontSize: 12, color: PALETTE.textSecondary, marginTop: 2 }}>{v.notes}</div>}
                </div>
                <div style={{ display: 'flex', gap: 4 }}>
                  <button onClick={() => openEditVehicle(v)} style={btnSmallBlue as any}>Editar</button>
                  <button onClick={() => handleDeleteVehicle(v.id)} style={btnSmallRed as any}>Excluir</button>
                </div>
              </div>
            ))}
            {vehicles.length === 0 && <div style={{ color: PALETTE.textSecondary }}>Nenhum veículo cadastrado.</div>}
          </div>
        </>}

        {tab === 'serviceTypes' && <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <h3 style={{ margin: 0 }}>Tipos</h3>
            <button onClick={openNewServiceType} style={btnPrimary as any}>+ Novo Tipo</button>
          </div>
          <div style={{ display: 'grid', gap: 6 }}>
            {serviceTypes.map(s => (
              <div key={s.id} style={{ ...cardStyle, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span style={{ fontWeight: 600 }}>{s.name}</span>
                  {s.code && <span style={{ color: PALETTE.textSecondary, marginLeft: 6, fontSize: 13 }}>— {s.code}</span>}
                </div>
                <div style={{ display: 'flex', gap: 4 }}>
                  <button onClick={() => openEditServiceType(s)} style={btnSmallBlue as any}>Editar</button>
                  <button onClick={() => handleDeleteServiceType(s.id)} style={btnSmallRed as any}>Excluir</button>
                </div>
              </div>
            ))}
            {serviceTypes.length === 0 && <div style={{ color: PALETTE.textSecondary }}>Nenhum tipo cadastrado.</div>}
          </div>
        </>}

      </div>

      {showTripModal && (
        <div style={overlay} onClick={() => setShowTripModal(false)}>
          <div style={modal} onClick={e => e.stopPropagation()}>
            <h3 style={{ marginTop: 0 }}>{editingTrip ? 'Editar Viagem' : 'Nova Viagem'}</h3>
            <form onSubmit={handleSaveTrip}>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 12 }}>
                <div>
                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 8 }}>
                    <div>
                      <label style={labelStyle}>Data *</label>
                      <input required type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} style={inputStyle} />
                    </div>
                    <div>
                      <label style={labelStyle}>Tipo *</label>
                      <select value={form.serviceTypeId} onChange={e => setForm({ ...form, serviceTypeId: e.target.value })} style={selectStyle}>
                        <option value="">Selecione...</option>
                        {serviceTypes.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                      </select>
                    </div>
                    <div>
                      <label style={labelStyle}>Cidade *</label>
                      <select required value={form.cityId} onChange={e => setForm({ ...form, cityId: e.target.value })} style={selectStyle}>
                        <option value="">Selecione...</option>
                        {cities.map(c => <option key={c.id} value={c.id}>{c.name}{c.state ? ` - ${c.state}` : ''}</option>)}
                      </select>
                    </div>
                    <div>
                      <label style={labelStyle}>Veículo</label>
                      <select value={form.vehicleId} onChange={e => setForm({ ...form, vehicleId: e.target.value })} style={selectStyle}>
                        <option value="">Nenhum</option>
                        {vehicles.map(v => <option key={v.id} value={v.id}>{v.model ?? '?'} {v.plate ? `(${v.plate})` : ''}</option>)}
                      </select>
                    </div>
                    <div style={{ gridColumn: '1 / -1' }}>
                      <label style={labelStyle}>Cliente</label>
                      <input type="text" value={form.client} onChange={e => setForm({ ...form, client: e.target.value })} style={inputStyle} />
                    </div>
                  </div>
                </div>
                <div>
                  <div>
                    <label style={labelStyle}>Passageiros</label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                      {workers.map(w => (
                        <button key={w.id} type="button" onClick={() => toggleTraveler(w.id)} style={{
                          fontSize: 12, padding: '3px 8px', borderRadius: 4, cursor: 'pointer', border: 'none',
                          background: form.travelerIds.includes(w.id) ? PALETTE.primary : PALETTE.hoverBg,
                          color: form.travelerIds.includes(w.id) ? '#fff' : PALETTE.textPrimary,
                          fontWeight: form.travelerIds.includes(w.id) ? 600 : 400,
                        }}>
                          {w.name}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div style={{ marginTop: 8 }}>
                    <label style={labelStyle}>Motorista</label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                      {workers.filter(w => form.travelerIds.includes(w.id)).map(w => (
                        <button key={w.id} type="button" onClick={() => toggleDriver(w.id)} style={{
                          fontSize: 12, padding: '3px 8px', borderRadius: 4, cursor: 'pointer', border: 'none',
                          background: (form.driverIds || []).includes(w.id) ? PALETTE.primary : PALETTE.hoverBg,
                          color: (form.driverIds || []).includes(w.id) ? '#fff' : PALETTE.textPrimary,
                          fontWeight: (form.driverIds || []).includes(w.id) ? 600 : 400,
                        }}>
                          {w.name}
                        </button>
                      ))}
                      {form.travelerIds.length === 0 && <div style={{ color: PALETTE.textSecondary }}>Selecione passageiros primeiro.</div>}
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ marginTop: 12, borderTop: `1px solid ${PALETTE.border}`, paddingTop: 10 }}>
                <label style={{ ...labelStyle, marginBottom: 8 }}>Despesas & Quilometragem</label>

                <div style={{ display: 'grid', gap: 12 }}>
                  {/* Grupo: Despesas */}
                  <div>
                    <div style={{ display: 'grid', gap: 6 }}>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8 }}>
                        <div>
                          <label style={{ ...labelStyle, fontSize: 11 }}>Preço (R$)</label>
                          <div style={moneyWrapper}>
                            <span style={moneyPrefix}>R$</span>
                            <input type="number" step="0.01" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} style={{ ...inputStyle, paddingLeft: 34 }} />
                          </div>
                        </div>
                        <div>
                          <label style={{ ...labelStyle, fontSize: 11 }}>Alimentação (R$)</label>
                          <div style={moneyWrapper}>
                            <span style={moneyPrefix}>R$</span>
                            <input type="number" step="0.01" value={form.mealExpense} onChange={e => { setForm({ ...form, mealExpense: e.target.value }); setMealEdited(true); }} style={{ ...inputStyle, paddingLeft: 34 }} />
                          </div>
                        </div>
                        <div>
                          <label style={{ ...labelStyle, fontSize: 11 }}>Combustível (R$)</label>
                          <div style={moneyWrapper}>
                            <span style={moneyPrefix}>R$</span>
                            <input type="number" step="0.01" value={form.fuelExpense} onChange={e => setForm({ ...form, fuelExpense: e.target.value })} style={{ ...inputStyle, paddingLeft: 34 }} />
                          </div>
                        </div>
                        <div>
                          <label style={{ ...labelStyle, fontSize: 11 }}>Extra (R$)</label>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <div style={{ flex: 1, position: 'relative' }}>
                              <span style={moneyPrefix}>R$</span>
                              <input type="number" step="0.01" value={form.extraExpense} onChange={e => setForm({ ...form, extraExpense: e.target.value })} style={{ ...inputStyle, paddingLeft: 34 }} />
                            </div>
                            {Number(form.extraExpense) > 0 && (
                              <button type="button" onClick={(e) => { e.stopPropagation(); setShowExtraNoteModal(true) }} style={{ ...(btnSmallBlue as any), padding: '6px 8px', fontSize: 12 }}>📝</button>
                            )}
                          </div>
                        </div>
                        <div>
                          <label style={{ ...labelStyle, fontSize: 11 }}>Km Rodados</label>
                          <input type="number" step="0.01" value={form.kmDriven} onChange={e => setForm({ ...form, kmDriven: e.target.value })} style={inputStyle} />
                        </div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                        <div>
                          <label style={{ ...labelStyle, fontSize: 11 }}>Consumo Médio (km/l)</label>
                          <input type="number" step="0.01" value={form.avgConsumption} onChange={e => setForm({ ...form, avgConsumption: e.target.value })} style={inputStyle} />
                        </div>
                        <div>
                          <label style={{ ...labelStyle, fontSize: 11 }}>Autonomia Restante</label>
                          <div style={moneyWrapper}>
                            <span style={moneyPrefix}>R$</span>
                            <input type="number" step="0.01" value={form.remainingAutonomy} onChange={e => setForm({ ...form, remainingAutonomy: e.target.value })} style={{ ...inputStyle, paddingLeft: 34 }} />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div style={{ marginTop: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                    <label style={{ ...labelStyle, marginBottom: 0 }}>Cálculos</label>
                    <div style={{ color: PALETTE.textSecondary, fontSize: 12 }}>calculado automaticamente (desbloqueie para editar)</div>
                  </div>
                  <div>
                    <button type="button" onClick={() => { setCostEdited(c => !c); if (costEdited) setCalcDirty(false); }} style={btnSmallBlue as any}>{costEdited ? 'Bloquear edição' : 'Editar cálculos'}</button>
                    {calcDirty && (
                      <button type="button" onClick={handleRecalculate} style={{ ...(btnSmallBlue as any), marginLeft: 8 }}>Recalcular</button>
                    )}
                  </div>
                </div>

                <div style={{ marginTop: 8, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
                  <div>
                    <label style={{ ...labelStyle, fontSize: 11 }}>Custo/km (R$)</label>
                    <div style={moneyWrapper}>
                      <span style={moneyPrefix}>R$</span>
                      <input disabled={!costEdited} type="number" step="0.01" value={form.costPerKm} onChange={e => { setForm({ ...form, costPerKm: e.target.value }); setCostEdited(true); setCalcDirty(true); }} style={{ ...inputStyle, paddingLeft: 34 }} />
                    </div>
                  </div>
                  <div>
                    <label style={{ ...labelStyle, fontSize: 11 }}>Lucro/km (R$)</label>
                    <div style={moneyWrapper}>
                      <span style={moneyPrefix}>R$</span>
                      <input disabled={!costEdited} type="number" step="0.01" value={form.profitPerKm} onChange={e => { setForm({ ...form, profitPerKm: e.target.value }); setCostEdited(true); setCalcDirty(true); }} style={{ ...inputStyle, paddingLeft: 34 }} />
                    </div>
                  </div>
                  <div>
                    <label style={{ ...labelStyle, fontSize: 11 }}>Total (R$)</label>
                    <div style={moneyWrapper}>
                      <span style={moneyPrefix}>R$</span>
                      <input disabled={!costEdited} type="number" step="0.01" value={form.total} onChange={e => { setForm({ ...form, total: e.target.value }); setCostEdited(true); setCalcDirty(true); }} style={{ ...inputStyle, paddingLeft: 34 }} />
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ marginTop: 12 }}>
                <label style={labelStyle}>Observações</label>
                <textarea value={form.note} onChange={e => setForm({ ...form, note: e.target.value })} rows={1} style={{ ...inputStyle, resize: 'vertical', minHeight: 40 }} />
              </div>

              {editingTrip && (
                <div style={{ marginTop: 12 }}>
                  <label style={labelStyle}>Data de Conclusão</label>
                  <input type="date" value={form.endDate} onChange={e => setForm({ ...form, endDate: e.target.value })} style={inputStyle} />
                </div>
              )}

              {editingTrip && (
                <div style={{ marginTop: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {!editingTrip.completed ? (
                      <button type="button" onClick={async () => {
                        await handleMarkComplete(editingTrip)
                        const nowIso = new Date().toISOString()
                        setEditingTrip(et => et ? { ...et, completed: true, endDate: nowIso } : et)
                        setForm(f => ({ ...f, endDate: toDateInput(nowIso) }))
                      }} style={{ ...(btnSmallBlue as any), padding: '8px 12px', fontSize: 14 }}>Marcar como completa</button>
                    ) : (
                      <button type="button" style={{ ...(btnSmallBlue as any), padding: '8px 12px', fontSize: 14, background: '#2ecc71', color: '#fff', cursor: 'default' }} disabled>
                        {editingTrip.endDate ? `Concluída ${new Date(editingTrip.endDate).toLocaleDateString('pt-BR')}` : 'Concluída'}
                      </button>
                    )}
                    <button type="button" onClick={() => { setConfirmDelete(editingTrip); setShowTripModal(false) }} style={{ ...(btnSmallRed as any), padding: '8px 12px', fontSize: 14 }}>Excluir viagem</button>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button type="button" onClick={() => setShowTripModal(false)} style={btnCancel as any}>Cancelar</button>
                    <button type="submit" style={btnPrimary as any}>{editingTrip ? 'Salvar' : 'Criar'}</button>
                  </div>
                </div>
              )}
              {!editingTrip && (
                <div style={{ marginTop: 12, display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                  <button type="button" onClick={() => setShowTripModal(false)} style={btnCancel as any}>Cancelar</button>
                  <button type="submit" style={btnPrimary as any}>{editingTrip ? 'Salvar' : 'Criar'}</button>
                </div>
              )}
            </form>
          </div>
        </div>
      )}

      {showServiceTypeModal && (
        <div style={overlay} onClick={() => setShowServiceTypeModal(false)}>
          <div style={smallModal} onClick={e => e.stopPropagation()}>
            <h3 style={{ marginTop: 0 }}>{editingServiceType ? 'Editar Tipo' : 'Novo Tipo'}</h3>
            <form onSubmit={handleSaveServiceType}>
              <div style={{ display: 'grid', gap: 8 }}>
                <div>
                  <label style={labelStyle}>Nome *</label>
                  <input required value={serviceTypeForm.name} onChange={e => setServiceTypeForm({ ...serviceTypeForm, name: e.target.value })} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Código</label>
                  <input value={serviceTypeForm.code} onChange={e => setServiceTypeForm({ ...serviceTypeForm, code: e.target.value })} style={inputStyle} />
                </div>
              </div>
              <div style={{ marginTop: 14, display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setShowServiceTypeModal(false)} style={btnCancel as any}>Cancelar</button>
                <button type="submit" style={btnPrimary as any}>{editingServiceType ? 'Salvar' : 'Criar'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showManageWorkers && (
        <div style={overlay} onClick={() => setShowManageWorkers(false)}>
          <div style={{ ...modal, width: 720 }} onClick={e => e.stopPropagation()}>
            <WorkersContent showTitle={false} onChange={fetchWorkers} />
            <div style={{ marginTop: 10, display: 'flex', justifyContent: 'flex-end' }}>
              <button onClick={() => setShowManageWorkers(false)} style={btnCancel as any}>Fechar</button>
            </div>
          </div>
        </div>
      )}

      {showCityModal && (
        <div style={overlay} onClick={() => setShowCityModal(false)}>
          <div style={smallModal} onClick={e => e.stopPropagation()}>
            <h3 style={{ marginTop: 0 }}>{editingCity ? 'Editar Cidade' : 'Nova Cidade'}</h3>
            <form onSubmit={handleSaveCity}>
              <div style={{ display: 'grid', gap: 8 }}>
                <div>
                  <label style={labelStyle}>Nome *</label>
                  <input required value={cityForm.name} onChange={e => setCityForm({ ...cityForm, name: e.target.value })} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Estado</label>
                  <input value={cityForm.state} onChange={e => setCityForm({ ...cityForm, state: e.target.value })} style={inputStyle} placeholder="Ex: SP" />
                </div>
                <div>
                  <label style={labelStyle}>País</label>
                  <input value={cityForm.country} onChange={e => setCityForm({ ...cityForm, country: e.target.value })} style={inputStyle} />
                </div>
              </div>
              <div style={{ marginTop: 14, display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setShowCityModal(false)} style={btnCancel as any}>Cancelar</button>
                <button type="submit" style={btnPrimary as any}>{editingCity ? 'Salvar' : 'Criar'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showVehicleModal && (
        <div style={overlay} onClick={() => setShowVehicleModal(false)}>
          <div style={smallModal} onClick={e => e.stopPropagation()}>
            <h3 style={{ marginTop: 0 }}>{editingVehicle ? 'Editar Veículo' : 'Novo Veículo'}</h3>
            <form onSubmit={handleSaveVehicle}>
              <div style={{ display: 'grid', gap: 8 }}>
                <div>
                  <label style={labelStyle}>Modelo</label>
                  <input value={vehicleForm.model} onChange={e => setVehicleForm({ ...vehicleForm, model: e.target.value })} style={inputStyle} placeholder="Ex: Fiat Strada" />
                </div>
                <div>
                  <label style={labelStyle}>Placa</label>
                  <input value={vehicleForm.plate} onChange={e => setVehicleForm({ ...vehicleForm, plate: e.target.value })} style={inputStyle} placeholder="Ex: ABC-1234" />
                </div>
                <div>
                  <label style={labelStyle}>Notas</label>
                  <textarea value={vehicleForm.notes} onChange={e => setVehicleForm({ ...vehicleForm, notes: e.target.value })} rows={2} style={{ ...inputStyle, resize: 'vertical' }} />
                </div>
              </div>
              <div style={{ marginTop: 14, display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setShowVehicleModal(false)} style={btnCancel as any}>Cancelar</button>
                <button type="submit" style={btnPrimary as any}>{editingVehicle ? 'Salvar' : 'Criar'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showSettingsModal && (
        <div style={overlay} onClick={() => setShowSettingsModal(false)}>
          <div style={smallModal} onClick={e => e.stopPropagation()}>
            <h3 style={{ marginTop: 0 }}>Padrões - Valores</h3>
            <form onSubmit={async (e) => {
              e.preventDefault()
              try {
                const v = Number(settingsMealValue)
                const res = await fetch(`${API_BASE}/settings/mealExpense`, { method: 'PUT', headers: jsonAuthHeaders(), body: JSON.stringify({ value: v }) })
                if (!res.ok) throw new Error('Erro')
                setDefaultMealExpense(v)
                setShowSettingsModal(false)
                addToast('Padrão salvo', 'success')
              } catch (err: any) { addToast(err?.message || 'Erro ao salvar', 'error') }
            }}>
              <div style={{ display: 'grid', gap: 8 }}>
                <div>
                  <label style={labelStyle}>Alimentação (R$)</label>
                  <input value={settingsMealValue} onChange={e => setSettingsMealValue(e.target.value)} style={inputStyle} />
                </div>
              </div>
              <div style={{ marginTop: 14, display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setShowSettingsModal(false)} style={btnCancel as any}>Fechar</button>
                <button type="submit" style={btnPrimary as any}>Salvar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showExtraNoteModal && (
        <div style={overlay} onClick={() => setShowExtraNoteModal(false)}>
          <div style={smallModal} onClick={e => e.stopPropagation()}>
            <h3 style={{ marginTop: 0 }}>Nota - Despesa Extra</h3>
            <form onSubmit={(e) => { e.preventDefault(); setShowExtraNoteModal(false) }}>
              <div style={{ display: 'grid', gap: 8 }}>
                <div>
                  <input ref={extraNoteInputRef} type="text" placeholder="Digite a nota" value={form.notesExtraExpense} onChange={e => setForm({ ...form, notesExtraExpense: e.target.value })} style={inputStyle} />
                </div>
              </div>
              <div style={{ marginTop: 12, display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setShowExtraNoteModal(false)} style={btnCancel as any}>Cancelar</button>
                <button type="submit" style={btnPrimary as any}>Salvar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {confirmDelete && (
        <div style={overlay} onClick={() => setConfirmDelete(null)}>
          <div style={smallModal} onClick={e => e.stopPropagation()}>
            <h3 style={{ marginTop: 0, color: PALETTE.error }}>Confirmar Exclusão</h3>
            <p>Excluir viagem para <strong>{confirmDelete.city?.name ?? '—'}</strong> em {new Date(confirmDelete.date).toLocaleDateString('pt-BR')}?</p>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button onClick={() => setConfirmDelete(null)} style={btnCancel as any}>Cancelar</button>
              <button onClick={handleDeleteTrip} style={btnDanger as any}>Excluir</button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}