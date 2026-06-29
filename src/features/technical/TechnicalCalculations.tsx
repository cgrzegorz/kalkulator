import { useEffect, useMemo, useState } from 'react'
import { calculateTechnicalResult, getAutomaticCalculatedPower } from './calculations'
import { formatInputNumber, formatNumber, toNumber } from './format'
import type { CableInstallationMethod, TechnicalFormValues } from './types'
import { ConditionCard } from './components/ConditionCard'
import { FormulaCard } from './components/FormulaCard'
import { PowerBalanceCard } from './components/PowerBalanceCard'
import { WlzSelectionCard } from './components/WlzSelectionCard'

const initialValues: TechnicalFormValues = {
  name: 'RG',
  installedPower: '0',
  simultaneityFactor: '0.47',
  calculatedPower: '0',
  voltage: '400',
  powerFactor: '0.93',
  loadCurrent: '0',
  ratedCurrent: '32',
  multiplicationFactor: '1.45',
  cableType: 'YKY',
  cableCores: '4',
  cableCrossSection: '16',
  installationMethod: 'ground',
}

export default function TechnicalCalculations() {
  const [form, setForm] = useState(initialValues)
  const [isCalculatedPowerOverridden, setIsCalculatedPowerOverridden] = useState(false)
  const [isLoadCurrentOverridden, setIsLoadCurrentOverridden] = useState(false)
  const [isCableCrossSectionOverridden, setIsCableCrossSectionOverridden] = useState(false)

  const result = useMemo(() => calculateTechnicalResult(form), [form])
  const selectedRecommendation = result.recommendations.find((recommendation) =>
    recommendation.key === form.cableType,
  )

  useEffect(() => {
    if (
      isCableCrossSectionOverridden
      || !selectedRecommendation?.section
      || selectedRecommendation.section === form.cableCrossSection
    ) {
      return
    }

    const section = selectedRecommendation.section

    setForm((current) => ({
      ...current,
      cableCrossSection: section,
    }))
  }, [form.cableCrossSection, isCableCrossSectionOverridden, selectedRecommendation?.section])

  useEffect(() => {
    if (isLoadCurrentOverridden) {
      return
    }

    const nextLoadCurrent = formatInputNumber(result.calculatedCurrent)

    if (nextLoadCurrent === form.loadCurrent) {
      return
    }

    setForm((current) => ({
      ...current,
      loadCurrent: nextLoadCurrent,
    }))
  }, [form.loadCurrent, isLoadCurrentOverridden, result.calculatedCurrent])

  const update = (field: keyof TechnicalFormValues, value: string) => {
    setForm((current) => {
      const next = { ...current, [field]: value }

      if (!isCalculatedPowerOverridden && (field === 'installedPower' || field === 'simultaneityFactor')) {
        next.calculatedPower = formatInputNumber(getAutomaticCalculatedPower(next))
      }

      return next
    })
  }

  const updateInstallationMethod = (value: CableInstallationMethod) => {
    update('installationMethod', value)
  }

  const updateCalculatedPower = (value: string) => {
    setIsCalculatedPowerOverridden(true)
    setForm((current) => {
      const installedPower = toNumber(current.installedPower)
      const calculatedPower = toNumber(value)

      return {
        ...current,
        calculatedPower: value,
        simultaneityFactor: installedPower > 0
          ? formatInputNumber(calculatedPower / installedPower, 3)
          : '0',
      }
    })
  }

  const updateLoadCurrent = (value: string) => {
    setIsLoadCurrentOverridden(true)
    update('loadCurrent', value)
  }

  const restoreAutomaticLoadCurrent = () => {
    setIsLoadCurrentOverridden(false)
    setForm((current) => ({
      ...current,
      loadCurrent: formatInputNumber(result.calculatedCurrent),
    }))
  }

  const updateCableCrossSection = (value: string) => {
    setIsCableCrossSectionOverridden(true)
    update('cableCrossSection', value)
  }

  const restoreAutomaticCableCrossSection = () => {
    if (!selectedRecommendation?.section) {
      return
    }

    setIsCableCrossSectionOverridden(false)
    update('cableCrossSection', selectedRecommendation.section)
  }

  const restoreAutomaticCalculatedPower = () => {
    setIsCalculatedPowerOverridden(false)
    setForm((current) => ({
      ...current,
      calculatedPower: formatInputNumber(getAutomaticCalculatedPower(current)),
    }))
  }

  return (
    <section className="mt-[34px] grid gap-3.5">
      <header className="relative flex items-center justify-between overflow-hidden rounded-lg bg-gradient-to-br from-[#17202a] to-[#143f43] p-[18px_20px] text-white shadow-panel max-md:flex-col max-md:items-start max-md:gap-2.5">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.06)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.06)_1px,transparent_1px)] bg-[length:24px_24px] opacity-60" />
        <div className="relative">
          <span className="mb-2 block text-[10px] font-extrabold uppercase tracking-[1.7px] text-forest-300">
            05 · Obliczenia techniczne
          </span>
          <h2 className="m-0 text-lg font-bold text-white">Bilans mocy i dobór WLZ</h2>
          <p className="mt-1 text-[11px] text-[#bad2d5]">
            Uzupełnij dane rozdzielnicy i sprawdź warunki doboru przewodu zasilającego.
          </p>
        </div>
        <div className="relative min-w-44 border-l border-white/15 pl-[18px] max-md:w-full max-md:border-l-0 max-md:border-t max-md:pl-0 max-md:pt-2.5">
          <span className="block text-[9px] font-extrabold uppercase tracking-[.7px] text-[#bad2d5]">
            Prąd obliczeniowy In
          </span>
          <strong className="mt-[3px] block text-[26px] tracking-[-.8px] text-forest-300">
            {formatNumber(result.calculatedCurrent)} <small className="text-[11px] text-[#c1d4cd]">A</small>
          </strong>
        </div>
      </header>

      <div className="grid gap-3.5 lg:grid-cols-[1fr_260px]">
        <PowerBalanceCard
          form={form}
          isCalculatedPowerOverridden={isCalculatedPowerOverridden}
          onRestoreAutomaticCalculatedPower={restoreAutomaticCalculatedPower}
          onUpdate={update}
          onUpdateCalculatedPower={updateCalculatedPower}
          result={result}
        />
        <FormulaCard calculatedCurrent={result.calculatedCurrent} name={form.name} />
      </div>

      <WlzSelectionCard
        form={form}
        isCableCrossSectionOverridden={isCableCrossSectionOverridden}
        isLoadCurrentOverridden={isLoadCurrentOverridden}
        onUpdate={update}
        onUpdateCableCrossSection={updateCableCrossSection}
        onUpdateInstallationMethod={updateInstallationMethod}
        onUpdateLoadCurrent={updateLoadCurrent}
        onRestoreAutomaticCableCrossSection={restoreAutomaticCableCrossSection}
        onRestoreAutomaticLoadCurrent={restoreAutomaticLoadCurrent}
        result={result}
      />

      <div className="grid gap-3 md:grid-cols-3">
        <ConditionCard
          formula="IB ≤ Iz"
          isMet={result.conditionIbLeIz}
          values={`${form.loadCurrent || '0'} A ≤ ${result.cableCapacity ? `${formatNumber(result.cableCapacity)} A` : 'brak danych Iz'}`}
        />
        <ConditionCard
          formula="IB ≤ IN ≤ Iz"
          isMet={result.conditionIbLeInLeIz}
          values={`${form.loadCurrent || '0'} A ≤ ${form.ratedCurrent || '0'} A ≤ ${result.cableCapacity ? `${formatNumber(result.cableCapacity)} A` : 'brak danych Iz'}`}
        />
        <ConditionCard
          formula="I2 ≤ 1,45 × Iz"
          isMet={result.conditionI2Le145Iz}
          values={result.cableCapacity ? `${formatNumber(result.i2)} A ≤ ${formatNumber(result.limit)} A` : `${formatNumber(result.i2)} A ≤ brak danych Iz`}
        />
      </div>
    </section>
  )
}
