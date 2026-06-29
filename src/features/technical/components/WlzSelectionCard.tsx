import { installationMethodLabels, wlzCableFamilies, wlzCableOptions } from '../cableData'
import { formatNumber } from '../format'
import type { CableInstallationMethod, CableRecommendation, TechnicalFormValues, TechnicalResult, WlzCableFamilyKey } from '../types'
import { Field } from './Field'
import { SectionCard } from './SectionCard'

type WlzSelectionCardProps = {
  form: TechnicalFormValues
  result: TechnicalResult
  isCableCrossSectionOverridden: boolean
  isLoadCurrentOverridden: boolean
  onUpdate: (field: keyof TechnicalFormValues, value: string) => void
  onUpdateCableCrossSection: (value: string) => void
  onUpdateInstallationMethod: (value: CableInstallationMethod) => void
  onUpdateLoadCurrent: (value: string) => void
  onRestoreAutomaticCableCrossSection: () => void
  onRestoreAutomaticLoadCurrent: () => void
}

function getUtilizationLabel(utilization: number) {
  if (!utilization) return 'brak doboru'
  if (utilization < 0.45) return 'duży zapas'
  if (utilization < 0.8) return 'środek zakresu'
  if (utilization <= 1) return 'blisko granicy'

  return 'poza zakresem'
}

function RecommendationCard({
  isSelected,
  onSelect,
  recommendation,
}: {
  isSelected: boolean
  onSelect: () => void
  recommendation: CableRecommendation
}) {
  const utilizationPercent = Math.min(100, Math.round(recommendation.utilization * 100))
  const markerPosition = Math.min(100, Math.max(0, utilizationPercent))

  return (
    <button
      className={`rounded-lg border bg-white p-3 text-left shadow-panel ${isSelected ? 'border-[#22c5bd] ring-2 ring-[#22c5bd]/20' : 'border-[#d9e4e7]'}`}
      onClick={onSelect}
      type="button"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <span className="block text-[9px] font-extrabold uppercase tracking-[.6px] text-[#63727a]">
            {recommendation.material} · {recommendation.insulation}
          </span>
          <strong className="mt-1 block text-[15px] text-[#17202a]">{recommendation.name}</strong>
        </div>
        <strong className="text-right text-[18px] text-[#0f766e]">
          {recommendation.section ? `${recommendation.section} mm²` : '—'}
        </strong>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2 text-[10px] text-[#63727a]">
        <span>Wymagane: <b className="text-[#17202a]">{formatNumber(recommendation.requiredCurrent, 1)} A</b></span>
        <span>Iz: <b className="text-[#17202a]">{recommendation.capacity ? `${formatNumber(recommendation.capacity, 1)} A` : 'brak'}</b></span>
        <span>Zapas: <b className="text-[#17202a]">{recommendation.reserve !== undefined ? `${formatNumber(recommendation.reserve, 1)} A` : 'brak'}</b></span>
      </div>
      <p className="mt-2 text-[10px] text-[#63727a]">
        Minimum WLZ: <b className="text-[#17202a]">{recommendation.minimumWlzSection} mm²</b>
      </p>

      <div className="mt-3">
        <div className="relative h-2 rounded-full bg-gradient-to-r from-[#dff1f0] via-[#22c5bd] to-[#f5a623]">
          <span
            className="absolute top-1/2 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-[#17202a] shadow"
            style={{ left: `${markerPosition}%` }}
          />
        </div>
        <div className="mt-1 flex justify-between text-[9px] font-bold uppercase tracking-[.45px] text-[#63727a]">
          <span>zapas</span>
          <span>{getUtilizationLabel(recommendation.utilization)} · {utilizationPercent}%</span>
          <span>limit</span>
        </div>
      </div>
    </button>
  )
}

function SelectionScale({
  capacity,
  requiredCurrent,
}: {
  capacity: number | undefined
  requiredCurrent: number
}) {
  const utilization = capacity ? requiredCurrent / capacity : 0
  const utilizationPercent = Math.min(100, Math.round(utilization * 100))

  return (
    <div className="mt-2.5 rounded-md border border-[#d9e4e7] bg-white p-[9px_11px]">
      <div className="flex items-center justify-between gap-3 text-[11px] text-[#63727a]">
        <span>
          Aktualnie wybrany przekrój: <strong className="text-forest-600">{capacity ? `${formatNumber(capacity, 1)} A Iz` : 'brak Iz'}</strong>
        </span>
        <span>{getUtilizationLabel(utilization)} · <strong className="text-[#17202a]">{utilizationPercent}%</strong></span>
      </div>
      <div className="relative mt-2 h-2 rounded-full bg-gradient-to-r from-[#dff1f0] via-[#22c5bd] to-[#f5a623]">
        <span
          className="absolute top-1/2 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-[#17202a] shadow"
          style={{ left: `${Math.min(100, Math.max(0, utilizationPercent))}%` }}
        />
      </div>
    </div>
  )
}

export function WlzSelectionCard({
  form,
  result,
  isCableCrossSectionOverridden,
  isLoadCurrentOverridden,
  onUpdate,
  onUpdateCableCrossSection,
  onUpdateInstallationMethod,
  onUpdateLoadCurrent,
  onRestoreAutomaticCableCrossSection,
  onRestoreAutomaticLoadCurrent,
}: WlzSelectionCardProps) {
  const selectedFamily = wlzCableFamilies[form.cableType]
  const selectedRecommendation = result.recommendations.find((recommendation) =>
    recommendation.key === form.cableType,
  )

  return (
    <SectionCard
      description="Podaj warunki, a kalkulator zaproponuje przekrój WLZ dla miedzi i aluminium."
      number="02"
      title="Propozycja przekroju WLZ i zabezpieczenia"
    >
      <div className="mt-[15px] grid gap-[11px] md:grid-cols-4">
        <label>
          <span className="mb-1.5 block text-[9px] font-extrabold uppercase tracking-[.55px] text-[#63727a]">
            Sposób ułożenia
          </span>
          <select
            className="h-9 w-full rounded-md border border-[#ccd7db] bg-[#fbfcfc] px-2.5 text-xs text-[#1d2935] outline-none focus:border-[#22c5bd] focus:shadow-[0_0_0_3px_rgba(34,197,189,.16)]"
            onChange={(event) => onUpdateInstallationMethod(event.target.value as CableInstallationMethod)}
            value={form.installationMethod}
          >
            {Object.entries(installationMethodLabels).map(([method, label]) => (
              <option key={method} value={method}>{label}</option>
            ))}
          </select>
        </label>
        <label>
          <span className="mb-1.5 block text-[9px] font-extrabold uppercase tracking-[.55px] text-[#63727a]">
            Typ kabla
          </span>
          <select
            className="h-9 w-full rounded-md border border-[#ccd7db] bg-[#fbfcfc] px-2.5 text-xs text-[#1d2935] outline-none focus:border-[#22c5bd] focus:shadow-[0_0_0_3px_rgba(34,197,189,.16)]"
            onChange={(event) => {
              const nextType = event.target.value as WlzCableFamilyKey
              const recommendation = result.recommendations.find((item) => item.key === nextType)
              onUpdate('cableType', nextType)

              if (recommendation?.section) {
                onUpdate('cableCrossSection', recommendation.section)
              }
            }}
            value={form.cableType}
          >
            {wlzCableOptions.map((family) => (
              <option key={family.key} value={family.key}>
                {family.name} · {family.material}
              </option>
            ))}
          </select>
        </label>
        <Field label="Liczba żył" onChange={(value) => onUpdate('cableCores', value)} value={form.cableCores} />
        <label>
          <span className="mb-1.5 block text-[9px] font-extrabold uppercase tracking-[.55px] text-[#63727a]">
            Przekrój WLZ
          </span>
          <select
            className="h-9 w-full rounded-md border border-[#ccd7db] bg-[#fbfcfc] px-2.5 text-xs font-bold text-[#0f766e] outline-none focus:border-[#22c5bd] focus:shadow-[0_0_0_3px_rgba(34,197,189,.16)]"
            onChange={(event) => onUpdateCableCrossSection(event.target.value)}
            value={form.cableCrossSection}
          >
            {selectedFamily.rows.map((row) => (
              <option key={row.section} value={row.section}>
                {row.section} mm²
              </option>
            ))}
          </select>
        </label>
        <Field label="IB · prąd obciążenia z bilansu" onChange={onUpdateLoadCurrent} unit="A" value={form.loadCurrent} />
        <Field label="IN · zabezpieczenie" onChange={(value) => onUpdate('ratedCurrent', value)} unit="A" value={form.ratedCurrent} />
        <Field label="Krotność zabezpieczenia" onChange={(value) => onUpdate('multiplicationFactor', value)} value={form.multiplicationFactor} />
        <label>
          <span className="mb-1.5 block text-[9px] font-extrabold uppercase tracking-[.55px] text-[#63727a]">
            Iz · obciążalność przewodu
          </span>
          <output className={`flex h-9 items-center rounded-md border px-2.5 text-xs font-bold ${result.cableCapacity ? 'border-[#bfe4e2] bg-[#eef7f7] text-forest-600' : 'border-[#f2d7a9] bg-[#fff7ed] text-[#8a5a16]'}`}>
            {result.cableCapacity ? `${formatNumber(result.cableCapacity)} A` : 'Brak danych'}
          </output>
        </label>
      </div>

      <div className="mt-3.5 border-l-[3px] border-[#22c5bd] bg-[#f7faf9] p-[10px_12px] text-[11px] text-[#63727a]">
        Jako WLZ proponowany jest{' '}
        <strong className="text-forest-600">
          {installationMethodLabels[form.installationMethod]} {selectedFamily.name} {form.cableCores}×{form.cableCrossSection} mm²
        </strong>.
        {!result.cableCapacity && (
          <span> Wybierz standardowy przekrój dostępny dla wybranej rodziny kabla 4-żyłowego.</span>
        )}
      </div>

      <div className="mt-2.5 flex items-center justify-between gap-2.5 rounded-md border border-[#d9e4e7] bg-white p-[9px_11px] text-[11px] text-[#63727a] max-md:flex-col max-md:items-start">
        <span>
          IB domyślnie przyjmuje wynik z bilansu: In = <strong className="text-forest-600">{formatNumber(result.calculatedCurrent)} A</strong>.
        </span>
        {isLoadCurrentOverridden && (
          <button
            className="h-[30px] rounded-md bg-[#17202a] px-3 text-[11px] font-bold text-white hover:bg-[#243445]"
            onClick={onRestoreAutomaticLoadCurrent}
            type="button"
          >
            Przywróć IB = In
          </button>
        )}
      </div>

      <div className="mt-2.5 flex items-center justify-between gap-2.5 rounded-md border border-[#d9e4e7] bg-white p-[9px_11px] text-[11px] text-[#63727a] max-md:flex-col max-md:items-start">
        <span>
          Propozycja automatyczna dla {selectedFamily.name}: <strong className="text-forest-600">{selectedRecommendation?.section || 'brak'} mm²</strong>.
          {isCableCrossSectionOverridden && ' Przekrój został zmieniony ręcznie.'}
        </span>
        {isCableCrossSectionOverridden && (
          <button
            className="h-[30px] rounded-md bg-[#17202a] px-3 text-[11px] font-bold text-white hover:bg-[#243445]"
            onClick={onRestoreAutomaticCableCrossSection}
            type="button"
          >
            Przywróć propozycję
          </button>
        )}
      </div>

      <SelectionScale capacity={result.cableCapacity} requiredCurrent={result.requiredCableCurrent} />

      <div className="mt-4">
        <div className="mb-2 flex items-end justify-between gap-3">
          <div>
            <h4 className="m-0 text-[13px] font-bold text-[#17202a]">Automatyczny dobór do mocy</h4>
            <p className="mt-1 text-[10px] text-[#63727a]">
              Dobór uwzględnia In, zabezpieczenie, I2 / 1,45 oraz minimalny przekrój WLZ. Decyzja materiałowa zostaje po stronie projektanta.
            </p>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-[.6px] text-[#63727a]">
            wymagane {formatNumber(result.requiredCableCurrent, 1)} A
          </span>
        </div>
        <div className="grid gap-3 lg:grid-cols-3">
          {result.recommendations.map((recommendation) => (
            <RecommendationCard
              isSelected={recommendation.key === form.cableType}
              key={recommendation.key}
              onSelect={() => {
                onUpdate('cableType', recommendation.key)

                if (recommendation.section) {
                  onUpdate('cableCrossSection', recommendation.section)
                }
              }}
              recommendation={recommendation}
            />
          ))}
        </div>
      </div>
    </SectionCard>
  )
}
