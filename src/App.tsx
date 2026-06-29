import { useEffect, useMemo, useState } from 'react'
import './App.css'
import TechnicalCalculations from './TechnicalCalculations'

type SupplyType = 'three-phase' | 'single-phase'
type CircuitType = 'lighting' | 'sockets' | 'intercom' | 'gate' | 'fridge' | 'custom'
type BreakerCurve = 'B' | 'C'
type InstallationMethod = 'A2' | 'B2' | 'C' | 'E'
type CableType = 'N2XH' | 'PVC'
type LpsClass = 'I' | 'II' | 'III' | 'IV'
type CalculatorSection = 'quick' | 'circuits' | 'cable' | 'lightning' | 'wlz'

type Circuit = {
  id: number
  type: CircuitType
  power: string
  quantity: string
  supply: SupplyType
}

const POWER_FACTOR = 0.93
const DEMAND_FACTOR = 0.7
const lpsSpacing: Record<LpsClass, number> = {
  I: 10,
  II: 10,
  III: 15,
  IV: 20,
}
const sectionMeta: Record<CalculatorSection, { eyebrow: string; title: string; description: string }> = {
  quick: {
    eyebrow: 'Moce rozdzielnicy',
    title: 'Bilans Pi, kj, Ps i In',
    description: 'Wpisz moc zainstalowaną i przyjmij współczynnik jednoczesności do wyznaczenia Ps oraz In.',
  },
  circuits: {
    eyebrow: 'Odbiorniki i obwody',
    title: 'Lista obwodów',
    description: 'Dodaj odbiorniki, policz moc zainstalowaną i podsumuj prądy obliczeniowe.',
  },
  cable: {
    eyebrow: 'Dobór przewodu',
    title: 'Przewód i zabezpieczenie',
    description: 'Dobierz zabezpieczenie oraz minimalny przekrój przewodu dla urządzenia.',
  },
  lightning: {
    eyebrow: 'Instalacja odgromowa',
    title: 'Przewody odprowadzające',
    description: 'Oszacuj liczbę połączeń instalacji odgromowej z układem uziemiającym.',
  },
  wlz: {
    eyebrow: 'Bilans WLZ',
    title: 'Bilans mocy i dobór WLZ',
    description: 'Policz moc szczytową, prąd In oraz warunki doboru przewodu zasilającego.',
  },
}
const calculatorSections = Object.keys(sectionMeta) as CalculatorSection[]
const breakerRatings = [6, 10, 13, 16, 20, 25, 32, 40, 50, 63, 80, 100, 125, 160, 200, 250, 315, 400, 500, 630]
const n2xhCableRows = [
  { section: '1,5', A2: [18.5, 16.5], B2: [22, 19.5], C: [24, 22], E: [26, 23] },
  { section: '2,5', A2: [25, 22], B2: [30, 26], C: [33, 30], E: [36, 32] },
  { section: '4', A2: [33, 30], B2: [40, 35], C: [45, 40], E: [49, 42] },
  { section: '6', A2: [42, 38], B2: [51, 44], C: [58, 52], E: [63, 54] },
  { section: '10', A2: [57, 51], B2: [69, 60], C: [80, 71], E: [86, 75] },
  { section: '16', A2: [76, 68], B2: [91, 80], C: [107, 96], E: [115, 100] },
  { section: '25', A2: [99, 89], B2: [119, 105], C: [138, 119], E: [149, 127] },
  { section: '35', A2: [121, 109], B2: [146, 128], C: [171, 147], E: [185, 158] },
  { section: '50', A2: [145, 130], B2: [175, 154], C: [209, 179], E: [225, 192] },
  { section: '70', A2: [183, 164], B2: [221, 194], C: [269, 229], E: [289, 246] },
  { section: '95', A2: [220, 197], B2: [265, 233], C: [328, 278], E: [352, 298] },
  { section: '120', A2: [253, 227], B2: [305, 268], C: [382, 322], E: [410, 346] },
  { section: '150', A2: [290, 259], B2: [null, null], C: [441, 371], E: [473, 399] },
  { section: '185', A2: [329, 295], B2: [null, null], C: [506, 424], E: [542, 456] },
  { section: '240', A2: [386, 346], B2: [null, null], C: [599, 500], E: [641, 538] },
] satisfies Array<Record<InstallationMethod, [number | null, number | null]> & { section: string }>
const pvcCableRows = [
  { section: '1,5', A2: [14, 13], B2: [16.5, 15], C: [19.5, 17.5], E: [22, 18.5] },
  { section: '2,5', A2: [18.5, 17.5], B2: [23, 20], C: [27, 24], E: [30, 25] },
  { section: '4', A2: [25, 23], B2: [30, 27], C: [36, 32], E: [40, 34] },
  { section: '6', A2: [32, 29], B2: [38, 34], C: [46, 41], E: [51, 43] },
  { section: '10', A2: [43, 39], B2: [52, 46], C: [63, 57], E: [70, 60] },
  { section: '16', A2: [57, 52], B2: [69, 62], C: [85, 76], E: [94, 80] },
  { section: '25', A2: [75, 68], B2: [90, 80], C: [112, 96], E: [119, 101] },
  { section: '35', A2: [92, 83], B2: [111, 99], C: [138, 119], E: [148, 128] },
  { section: '50', A2: [110, 99], B2: [133, 118], C: [168, 144], E: [180, 153] },
  { section: '70', A2: [139, 125], B2: [168, 149], C: [213, 184], E: [232, 196] },
  { section: '95', A2: [167, 150], B2: [201, 179], C: [258, 223], E: [282, 238] },
  { section: '120', A2: [192, 172], B2: [232, 206], C: [299, 259], E: [328, 276] },
  { section: '150', A2: [219, 196], B2: [null, null], C: [344, 299], E: [379, 319] },
] satisfies Array<Record<InstallationMethod, [number | null, number | null]> & { section: string }>

const installationMethodLabels: Record<InstallationMethod, string> = {
  A2: 'A2 · izolowana cieplnie ściana',
  B2: 'B2 · rura instalacyjna na ścianie',
  C: 'C · na ścianie / przewód wielożyłowy',
  E: 'E · w powietrzu',
}
const circuitPresets: Record<CircuitType, { name: string; power: number | null }> = {
  lighting: { name: 'Oświetlenie', power: 0.4 },
  sockets: { name: 'Gniazda', power: 0.2 },
  intercom: { name: 'Domofon', power: 0.1 },
  gate: { name: 'Brama', power: 0.8 },
  fridge: { name: 'Lodówka', power: 0.4 },
  custom: { name: 'Własny odbiornik', power: null },
}

const initialCircuits: Circuit[] = [

]

function getCircuitPower(circuit: Circuit) {
  const power = (Number(circuit.power) || 0) * 1000
  return circuit.type === 'sockets' ? power * (Number(circuit.quantity) || 0) : power
}

function getCurrent(power: number, supply: SupplyType) {
  if (!power) return 0

  return supply === 'three-phase'
    ? power / (400 * Math.sqrt(3) * POWER_FACTOR)
    : power / (230 * POWER_FACTOR)
}

function formatNumber(value: number, maximumFractionDigits = 2) {
  return new Intl.NumberFormat('pl-PL', {
    maximumFractionDigits,
    minimumFractionDigits: maximumFractionDigits,
  }).format(value)
}

function formatPower(value: number, maximumFractionDigits = 2) {
  return new Intl.NumberFormat('pl-PL', {
    maximumFractionDigits,
  }).format(value)
}

function Icon({
  name,
  size = 20,
}: {
  name: 'bolt' | 'calculator' | 'chart' | 'plus' | 'trash' | 'chevron' | 'info' | 'list' | 'settings'
  size?: number
}) {
  const paths = {
    bolt: <path d="m13 2-9 12h7l-1 8 9-12h-7l1-8Z" />,
    calculator: (
      <>
        <rect width="16" height="20" x="4" y="2" rx="2" />
        <path d="M8 6h8M8 10h.01M12 10h.01M16 10h.01M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01M16 18h.01" />
      </>
    ),
    chart: <path d="M3 3v18h18M7 16l4-5 4 3 5-7" />,
    plus: <path d="M12 5v14M5 12h14" />,
    trash: <path d="M4 7h16M10 11v6M14 11v6M9 7V4h6v3m3 0-1 14H7L6 7" />,
    chevron: <path d="m9 18 6-6-6-6" />,
    info: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 11v5M12 8h.01" />
      </>
    ),
    list: <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />,
    settings: (
      <>
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06-2.86 2.86-.06-.06A1.7 1.7 0 0 0 15 19.4a1.7 1.7 0 0 0-1 .6v.08h-4V20a1.7 1.7 0 0 0-1-.6 1.7 1.7 0 0 0-1.88.34l-.06.06-2.86-2.86.06-.06A1.7 1.7 0 0 0 4.6 15a1.7 1.7 0 0 0-.6-1H3.9v-4H4a1.7 1.7 0 0 0 .6-1 1.7 1.7 0 0 0-.34-1.88l-.06-.06L7.06 4.2l.06.06A1.7 1.7 0 0 0 9 4.6a1.7 1.7 0 0 0 1-.6v-.08h4V4a1.7 1.7 0 0 0 1 .6 1.7 1.7 0 0 0 1.88-.34l.06-.06 2.86 2.86-.06.06A1.7 1.7 0 0 0 19.4 9a1.7 1.7 0 0 0 .6 1h.08v4H20a1.7 1.7 0 0 0-.6 1Z" />
      </>
    ),
  }

  return (
    <svg
      aria-hidden="true"
      className="icon"
      fill="none"
      height={size}
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
      viewBox="0 0 24 24"
      width={size}
    >
      {paths[name]}
    </svg>
  )
}

function App() {
  const [circuits, setCircuits] = useState<Circuit[]>(initialCircuits)
  const [activeView, setActiveView] = useState<'calculator' | 'formulas'>('calculator')
  const [activeSection, setActiveSection] = useState<CalculatorSection>('quick')
  const [quickPower, setQuickPower] = useState('')
  const [quickSimultaneityFactor, setQuickSimultaneityFactor] = useState(String(DEMAND_FACTOR))
  const [quickSupply, setQuickSupply] = useState<SupplyType>('three-phase')
  const [devicePower, setDevicePower] = useState('')
  const [deviceSupply, setDeviceSupply] = useState<SupplyType>('single-phase')
  const [breakerCurve, setBreakerCurve] = useState<BreakerCurve>('B')
  const [breakerRating, setBreakerRating] = useState(16)
  const [cableType, setCableType] = useState<CableType>('N2XH')
  const [installationMethod, setInstallationMethod] = useState<InstallationMethod>('B2')
  const [buildingSideA, setBuildingSideA] = useState('')
  const [buildingSideB, setBuildingSideB] = useState('')
  const [lpsClass, setLpsClass] = useState<LpsClass>('III')

  const quickPowerWatts = (Number(quickPower) || 0) * 1000
  const quickDemandPower = quickPowerWatts * (Number(quickSimultaneityFactor) || 0)
  const quickNominalCurrent = getCurrent(quickDemandPower, quickSupply)
  const devicePowerWatts = (Number(devicePower) || 0) * 1000
  const deviceCurrent = getCurrent(devicePowerWatts, deviceSupply)
  const loadedCores = deviceSupply === 'single-phase' ? 2 : 3
  const cableRows = cableType === 'N2XH' ? n2xhCableRows : pvcCableRows
  const selectedCable = cableRows.find((row) => {
    const capacity = row[installationMethod][loadedCores - 2]
    return capacity !== null && capacity >= breakerRating
  })
  const selectedCableCapacity = selectedCable?.[installationMethod][loadedCores - 2]
  const breakerCoversLoad = deviceCurrent <= breakerRating
  const sideA = Number(buildingSideA) || 0
  const sideB = Number(buildingSideB) || 0
  const buildingPerimeter = 2 * (sideA + sideB)
  const preferredLpsSpacing = lpsSpacing[lpsClass]
  const minimumDownConductors = buildingPerimeter > 0
    ? Math.max(2, Math.ceil(buildingPerimeter / preferredLpsSpacing))
    : 0
  const cornerAwareDownConductors = sideA > 0 && sideB > 0
    ? 2 * Math.ceil(sideA / preferredLpsSpacing) + 2 * Math.ceil(sideB / preferredLpsSpacing)
    : 0
  const averageDownConductorSpacing = minimumDownConductors > 0
    ? buildingPerimeter / minimumDownConductors
    : 0

  const openSection = (section: CalculatorSection) => {
    setActiveView('calculator')
    setActiveSection(section)
    window.history.replaceState(null, '', `#/${section}`)
  }

  const totals = useMemo(() => {
    const installedPower = circuits.reduce((sum, circuit) => sum + getCircuitPower(circuit), 0)
    const currents = circuits.reduce(
      (sum, circuit) => sum + getCurrent(getCircuitPower(circuit), circuit.supply),
      0,
    )
    const demandPower = installedPower * DEMAND_FACTOR

    return {
      installedPower,
      demandPower,
      currents,
      nominalCurrent: getCurrent(demandPower, 'three-phase'),
    }
  }, [circuits])
  const currentSectionMeta = sectionMeta[activeSection]

  useEffect(() => {
    const syncSectionFromHash = () => {
      const section = window.location.hash.replace(/^#\/?/, '') as CalculatorSection

      if (calculatorSections.includes(section)) {
        setActiveView('calculator')
        setActiveSection(section)
      }
    }

    syncSectionFromHash()
    window.addEventListener('hashchange', syncSectionFromHash)

    return () => window.removeEventListener('hashchange', syncSectionFromHash)
  }, [])

  const addCircuit = () => {
    setCircuits((current) => [
      ...current,
      {
        id: Date.now(),
        type: 'lighting',
        power: '0.4',
        quantity: '1',
        supply: 'single-phase',
      },
    ])
  }

  const updateCircuit = (id: number, patch: Partial<Circuit>) => {
    setCircuits((current) =>
      current.map((circuit) => (circuit.id === id ? { ...circuit, ...patch } : circuit)),
    )
  }

  const removeCircuit = (id: number) => {
    setCircuits((current) => current.filter((circuit) => circuit.id !== id))
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-mark"><Icon name="bolt" size={22} /></span>
          <span>
            Power<span>Desk</span>
          </span>
        </div>

        <nav className="main-nav" aria-label="Nawigacja">
          <p>Moduły obliczeń</p>
          <button
            className={activeView === 'calculator' && activeSection === 'quick' ? 'active' : ''}
            onClick={() => openSection('quick')}
          >
            <Icon name="bolt" />
            Moce rozdzielnicy
          </button>
          <button
            className={activeView === 'calculator' && activeSection === 'circuits' ? 'active' : ''}
            onClick={() => openSection('circuits')}
          >
            <Icon name="list" />
            Odbiorniki i obwody
          </button>
          <button
            className={activeView === 'calculator' && activeSection === 'cable' ? 'active' : ''}
            onClick={() => openSection('cable')}
          >
            <Icon name="calculator" />
            Dobór przewodu
          </button>
          <button
            className={activeView === 'calculator' && activeSection === 'lightning' ? 'active' : ''}
            onClick={() => openSection('lightning')}
          >
            <Icon name="chart" />
            Instalacja odgromowa
          </button>
          <button
            className={activeView === 'calculator' && activeSection === 'wlz' ? 'active' : ''}
            onClick={() => openSection('wlz')}
          >
            <Icon name="settings" />
            Bilans WLZ
          </button>
          {/* <button
            className={activeView === 'formulas' ? 'active' : ''}
            onClick={() => setActiveView('formulas')}
          >
            <Icon name="chart" />
            Wzory i informacje
          </button> */}
        </nav>

        <div className="sidebar-bottom">
          <div className="sidebar-note">
            <Icon name="info" size={18} />
            <div>
              <strong>Współczynnik mocy</strong>
              <span>cos φ = {POWER_FACTOR.toFixed(2).replace('.', ',')}</span>
            </div>
          </div>
          <button className="settings-button"><Icon name="settings" size={18} /> Ustawienia</button>
        </div>
      </aside>

      <main className="content">
        {activeView === 'calculator' ? (
          <>
            <header className="page-header">
              <div>
                <span className="eyebrow">{currentSectionMeta.eyebrow}</span>
                <h1>{currentSectionMeta.title}</h1>
                <p>{currentSectionMeta.description}</p>
              </div>
              <div className="header-visual" aria-hidden="true">
                <div className="header-visual-grid">
                  <span />
                  <span />
                  <span />
                  <span />
                </div>
                <div className="header-visual-meter">
                  <strong>{activeSection === 'lightning' ? 'LPS' : activeSection === 'wlz' ? 'WLZ' : activeSection === 'cable' ? 'Iz' : 'nN'}</strong>
                  <span>moduł</span>
                </div>
              </div>
            </header>

            {activeSection === 'quick' && (
            <section className="quick-card">
              <div className="quick-card-heading">
                <div className="quick-icon"><Icon name="bolt" size={19} /></div>
                <div>
                  <h2>Bilans mocy rozdzielnicy</h2>
                  <p>Wpisz Pi i kj, aby od razu wyznaczyć Ps oraz In.</p>
                </div>
              </div>
              <div className="quick-form">
                <label className="quick-field">
                  <span>Pi · moc zainstalowana</span>
                  <div className="quick-unit-input">
                    <input
                      aria-label="Łączna moc rozdzielni w kilowatach"
                      min="0"
                      onChange={(event) => setQuickPower(event.target.value)}
                      placeholder="np. 18"
                      type="number"
                      value={quickPower}
                    />
                    <strong>kW</strong>
                  </div>
                </label>
                <label className="quick-field">
                  <span>kj · współczynnik jednoczesności</span>
                  <input
                    aria-label="Współczynnik jednoczesności"
                    min="0"
                    onChange={(event) => setQuickSimultaneityFactor(event.target.value)}
                    step="0.01"
                    type="number"
                    value={quickSimultaneityFactor}
                  />
                </label>
                <label className="quick-field">
                  <span>Rodzaj zasilania</span>
                  <select
                    aria-label="Rodzaj zasilania rozdzielni"
                    onChange={(event) => setQuickSupply(event.target.value as SupplyType)}
                    value={quickSupply}
                  >
                    <option value="three-phase">Trójfazowe · 400 V</option>
                    <option value="single-phase">Jednofazowe · 230 V</option>
                  </select>
                </label>
              </div>
              <div className="quick-summary">
                <div>
                  <span>Pi · Moc zainstalowana</span>
                  <strong>{formatPower(quickPowerWatts / 1000)} <b>kW</b></strong>
                </div>
                <div>
                  <span>Ps · moc szczytowa</span>
                  <strong>{formatPower(quickDemandPower / 1000)} <b>kW</b></strong>
                </div>
                <div className="quick-summary-highlight">
                  <span>In · prąd znamionowy</span>
                  <strong>{formatNumber(quickNominalCurrent)} <b>A</b></strong>
                </div>
              </div>
              <div className="quick-formula">
                In = {quickDemandPower ? `${formatPower(quickDemandPower / 1000)} kW` : '0 kW'}
                {' × 1000 / '}
                {quickSupply === 'three-phase' ? '(400 V × √3 × 0,93)' : '(230 V × 0,93)'}
              </div>
            </section>
            )}

            {activeSection === 'circuits' && (
            <>
            <section className="section-heading">
              <div>
                <span className="section-number">01</span>
                <div>
                  <h2>Odbiorniki i obwody</h2>
                  <p>Wybierz typ obwodu. Domyślne moce możesz w razie potrzeby zmienić.</p>
                </div>
              </div>
              <button className="add-button" onClick={addCircuit}>
                <Icon name="plus" size={17} />
                Dodaj obwód
              </button>
            </section>

            <section className="circuits-card">
              <div className="table-header">
                <span>Typ obwodu</span>
                <span>Liczba gniazd</span>
                <span>Rodzaj zasilania</span>
                <span>Moc obwodu</span>
                <span>Prąd obliczeniowy</span>
                <span />
              </div>

              {circuits.length ? circuits.map((circuit) => {
                const circuitPower = getCircuitPower(circuit)
                const current = getCurrent(circuitPower, circuit.supply)

                return (
                  <div className="circuit-row" key={circuit.id}>
                    <label className="select-wrap">
                      <span className="mobile-label">Typ obwodu</span>
                      <select
                        aria-label="Typ obwodu"
                        onChange={(event) => {
                          const type = event.target.value as CircuitType
                          const presetPower = circuitPresets[type].power
                          updateCircuit(circuit.id, {
                            type,
                            power: presetPower === null ? '' : String(presetPower),
                            quantity: '1',
                          })
                        }}
                        value={circuit.type}
                      >
                        {Object.entries(circuitPresets).map(([type, preset]) => (
                          <option key={type} value={type}>{preset.name}</option>
                        ))}
                      </select>
                    </label>
                    <label>
                      <span className="mobile-label">Liczba gniazd</span>
                      {circuit.type === 'sockets' ? (
                        <input
                          aria-label="Liczba gniazd w obwodzie"
                          min="1"
                          onChange={(event) => updateCircuit(circuit.id, { quantity: event.target.value })}
                          type="number"
                          value={circuit.quantity}
                        />
                      ) : <span className="not-applicable">—</span>}
                    </label>
                    <label className="select-wrap">
                      <span className="mobile-label">Rodzaj zasilania</span>
                      <select
                        aria-label="Rodzaj zasilania"
                        onChange={(event) =>
                          updateCircuit(circuit.id, { supply: event.target.value as SupplyType })
                        }
                        value={circuit.supply}
                      >
                        <option value="single-phase">Jednofazowe · 230 V</option>
                        <option value="three-phase">Trójfazowe · 400 V</option>
                      </select>
                    </label>
                    <label className="unit-input">
                      <span className="mobile-label">Moc obwodu</span>
                      <input
                        aria-label="Moc obwodu w kilowatach"
                        min="0"
                        onChange={(event) => updateCircuit(circuit.id, { power: event.target.value })}
                        placeholder="0"
                        step="0.1"
                        type="number"
                        value={circuitPower / 1000}
                        {...(circuit.type === 'sockets' ? { readOnly: true } : {})}
                      />
                      <span>kW</span>
                    </label>
                    <div className="current-result">
                      <span className="mobile-label">Prąd obliczeniowy</span>
                      <strong>{formatNumber(current)}</strong>
                      <span>A</span>
                    </div>
                    <button
                      aria-label={`Usuń ${circuitPresets[circuit.type].name}`}
                      className="delete-button"
                      onClick={() => removeCircuit(circuit.id)}
                    >
                      <Icon name="trash" size={17} />
                    </button>
                  </div>
                )
              }) : (
                <div className="empty-state">Brak obwodów. Dodaj pierwszy odbiornik.</div>
              )}
            </section>

            <div className="inline-summary-heading">
              <h3>Podsumowanie odbiorników</h3>
              <p>Wyniki na podstawie obwodów z powyższej listy.</p>
            </div>

            <section className="summary-grid">
              <article className="summary-card primary">
                <span className="summary-label">Pi · Moc zainstalowana</span>
                <div><strong>{formatPower(totals.installedPower / 1000)}</strong><span>kW</span></div>
                <p>Suma mocy wszystkich odbiorników</p>
              </article>
              <article className="summary-card">
                <span className="summary-label">Ps · Moc szczytowa</span>
                <div><strong>{formatPower(totals.demandPower / 1000)}</strong><span>kW</span></div>
                <p>Ps = 0,7 × Pi</p>
              </article>
              <article className="summary-card highlighted">
                <span className="summary-label">In · Prąd znamionowy</span>
                <div><strong>{formatNumber(totals.nominalCurrent)}</strong><span>A</span></div>
                <p>Dla przyłącza trójfazowego 400 V</p>
              </article>
            </section>

            <div className="current-total">
              <Icon name="list" size={18} />
              <span>Suma prądów obliczeniowych obwodów</span>
              <strong>{formatNumber(totals.currents)} A</strong>
            </div>
            </>
            )}

            {activeSection === 'cable' && (
            <>
            <section className="section-heading cable-heading">
              <div>
                <span className="section-number">03</span>
                <div>
                  <h2>Dobór przewodu</h2>
                  <p>Wstępny dobór zabezpieczenia i przekroju przewodu dla urządzenia.</p>
                </div>
              </div>
            </section>

            <section className="cable-card">
              <div className="cable-form">
                <label className="quick-field">
                  <span>Moc urządzenia</span>
                  <div className="quick-unit-input">
                    <input
                      aria-label="Moc urządzenia w kilowatach"
                      min="0"
                      onChange={(event) => setDevicePower(event.target.value)}
                      placeholder="np. 3,5"
                      step="0.1"
                      type="number"
                      value={devicePower}
                    />
                    <strong>kW</strong>
                  </div>
                </label>
                <label className="quick-field">
                  <span>Rodzaj zasilania</span>
                  <select
                    aria-label="Rodzaj zasilania urządzenia"
                    onChange={(event) => setDeviceSupply(event.target.value as SupplyType)}
                    value={deviceSupply}
                  >
                    <option value="single-phase">Jednofazowe · 230 V</option>
                    <option value="three-phase">Trójfazowe · 400 V</option>
                  </select>
                </label>
                <label className="quick-field">
                  <span>Charakterystyka zabezpieczenia</span>
                  <select
                    aria-label="Charakterystyka zabezpieczenia"
                    onChange={(event) => setBreakerCurve(event.target.value as BreakerCurve)}
                    value={breakerCurve}
                  >
                    <option value="B">B · obciążenia standardowe</option>
                    <option value="C">C · większy prąd rozruchowy</option>
                  </select>
                </label>
                <label className="quick-field">
                  <span>Prąd znamionowy zabezpieczenia</span>
                  <select
                    aria-label="Prąd znamionowy zabezpieczenia"
                    onChange={(event) => setBreakerRating(Number(event.target.value))}
                    value={breakerRating}
                  >
                    {breakerRatings.map((rating) => (
                      <option key={rating} value={rating}>{rating} A</option>
                    ))}
                  </select>
                </label>
                <label className="quick-field">
                  <span>Rodzaj przewodu</span>
                  <select
                    aria-label="Rodzaj przewodu"
                    onChange={(event) => setCableType(event.target.value as CableType)}
                    value={cableType}
                  >
                    <option value="N2XH">N2XH</option>
                    <option value="PVC">YDY / CYY / NYM · izolacja PVC</option>
                  </select>
                </label>
                <label className="quick-field">
                  <span>Sposób ułożenia przewodu</span>
                  <select
                    aria-label="Sposób ułożenia przewodu"
                    onChange={(event) => setInstallationMethod(event.target.value as InstallationMethod)}
                    value={installationMethod}
                  >
                    {Object.entries(installationMethodLabels).map(([method, label]) => (
                      <option key={method} value={method}>{label}</option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="cable-summary">
                <article>
                  <span>Ib · Prąd obciążenia</span>
                  <strong>{formatNumber(deviceCurrent)} <b>A</b></strong>
                </article>
                <article>
                  <span>Wyłącznik nadprądowy</span>
                  <strong>{breakerCurve}{breakerRating} <b>A</b></strong>
                </article>
                <article className="cable-highlight">
                  <span>Minimalny przewód {cableType === 'N2XH' ? 'N2XH' : 'YDY / CYY / NYM'}</span>
                  <strong>{selectedCable ? `${selectedCable.section} mm²` : '—'}</strong>
                  <p>
                    {selectedCableCapacity
                      ? `Iz = ${formatNumber(selectedCableCapacity, 1)} A · ${loadedCores} obciążone żyły · metoda ${installationMethod}`
                      : 'Brak przewodu mieszczącego się w zakresie tabeli.'}
                  </p>
                </article>
              </div>
              <div className={`breaker-rule ${devicePowerWatts > 0 && !breakerCoversLoad ? 'invalid' : ''}`}>
                <strong>Reguła doboru: Ib ≤ In ≤ Iz</strong>
                <span>
                  {devicePowerWatts > 0 && selectedCableCapacity
                    ? `${formatNumber(deviceCurrent)} A ${breakerCoversLoad ? '≤' : '>'} ${breakerRating} A ≤ ${formatNumber(selectedCableCapacity, 1)} A`
                    : selectedCableCapacity
                      ? `Wybrano ${breakerCurve}${breakerRating} A. Wpisz moc urządzenia, aby sprawdzić Ib.`
                      : 'Brak przewodu mieszczącego się w zakresie tabeli.'}
                </span>
              </div>
              <p className="cable-note">
                Dobór wstępny na podstawie obciążalności prądowej przewodu. Projekt wymaga również
                sprawdzenia spadku napięcia, warunków zwarciowych i sposobu wykonania instalacji.
                {cableType === 'PVC' && ' Dla YDY / CYY / NYM przyjęto izolację PVC, temperaturę żyły 70°C oraz temperaturę otoczenia 30°C w powietrzu.'}
              </p>
            </section>
            </>
            )}

            {activeSection === 'lightning' && (
            <>
            <section className="section-heading lightning-heading">
              <div>
                <span className="section-number">04</span>
                <div>
                  <h2>Przewody odprowadzające instalacji odgromowej</h2>
                  <p>Oszacuj liczbę połączeń instalacji odgromowej z układem uziemiającym.</p>
                </div>
              </div>
            </section>

            <section className="lightning-card">
              <div className="lightning-form">
                <label className="quick-field">
                  <span>Bok budynku A</span>
                  <div className="quick-unit-input">
                    <input
                      aria-label="Długość boku A budynku w metrach"
                      min="0"
                      onChange={(event) => setBuildingSideA(event.target.value)}
                      placeholder="np. 20"
                      step="0.1"
                      type="number"
                      value={buildingSideA}
                    />
                    <strong>m</strong>
                  </div>
                </label>
                <label className="quick-field">
                  <span>Bok budynku B</span>
                  <div className="quick-unit-input">
                    <input
                      aria-label="Długość boku B budynku w metrach"
                      min="0"
                      onChange={(event) => setBuildingSideB(event.target.value)}
                      placeholder="np. 10"
                      step="0.1"
                      type="number"
                      value={buildingSideB}
                    />
                    <strong>m</strong>
                  </div>
                </label>
                <label className="quick-field">
                  <span>Klasa LPS</span>
                  <select
                    aria-label="Klasa instalacji odgromowej LPS"
                    onChange={(event) => setLpsClass(event.target.value as LpsClass)}
                    value={lpsClass}
                  >
                    <option value="I">LPS I · odstęp 10 m</option>
                    <option value="II">LPS II · odstęp 10 m</option>
                    <option value="III">LPS III · odstęp 15 m</option>
                    <option value="IV">LPS IV · odstęp 20 m</option>
                  </select>
                </label>
              </div>

              <div className="lightning-summary">
                <article>
                  <span>Obwód budynku</span>
                  <strong>{formatNumber(buildingPerimeter, 1)} <b>m</b></strong>
                </article>
                <article>
                  <span>Preferowany odstęp · LPS {lpsClass}</span>
                  <strong>{preferredLpsSpacing} <b>m</b></strong>
                </article>
                <article className="lightning-highlight">
                  <span>Minimalna liczba przewodów odprowadzających</span>
                  <strong>{minimumDownConductors || '—'}</strong>
                  <p>
                    {minimumDownConductors
                      ? `Średni odstęp po obwodzie: ${formatNumber(averageDownConductorSpacing, 1)} m`
                      : 'Wpisz wymiary budynku, aby uzyskać wynik.'}
                  </p>
                </article>
              </div>

              <div className="lightning-layout">
                <div>
                  <strong>Układ z uwzględnieniem narożników</strong>
                  <span>
                    {cornerAwareDownConductors
                      ? `${cornerAwareDownConductors} przewodów odprowadzających`
                      : 'Wpisz oba boki budynku.'}
                  </span>
                </div>
                <p>
                  Wartość praktyczna zakłada przewód przy każdym narożniku oraz dodatkowe przewody
                  na bokach, jeżeli wymaga tego preferowany odstęp.
                </p>
              </div>

              <p className="lightning-note">
                Obliczenie ma charakter orientacyjny dla prostokątnego rzutu budynku. Wynik oznacza
                liczbę przewodów odprowadzających łączących instalację odgromową z układem
                uziemiającym, a nie liczbę osobnych uziomów. Rozmieszczenie należy zweryfikować
                w projekcie zgodnie z PN-EN IEC 62305-3.
              </p>
            </section>
            </>
            )}

            {activeSection === 'wlz' && (
            <div>
              <TechnicalCalculations />
            </div>
            )}
          </>
        ) : (
          <section className="formulas-page">
            <span className="eyebrow">Dokumentacja</span>
            <h1>Wzory i informacje</h1>
            <p>W kalkulatorze stosowane są poniższe wzory.</p>
            <div className="formula-grid">
              <article>
                <span>Prąd jednofazowy</span>
                <strong>I = (P × 1000) / (230 V × 0,93)</strong>
                <p>Dla mocy P podanej w kW i obwodów zasilanych napięciem 230 V.</p>
              </article>
              <article>
                <span>Prąd trójfazowy</span>
                <strong>I = (P × 1000) / (400 V × √3 × 0,93)</strong>
                <p>Dla mocy P podanej w kW oraz obwodów i przyłącza zasilanych napięciem 400 V.</p>
              </article>
              <article>
                <span>Moc szczytowa</span>
                <strong>Ps = 0,7 × Pi</strong>
                <p>Pi oznacza sumę mocy wszystkich wpisanych odbiorników.</p>
              </article>
            </div>
            <button className="back-button" onClick={() => setActiveView('calculator')}>
              <Icon name="chevron" size={17} />
              Wróć do kalkulatora
            </button>
          </section>
        )}
      </main>
    </div>
  )
}

export default App
