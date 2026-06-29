import { Field } from './Field'
import { SectionCard } from './SectionCard'
import { formatNumber } from '../format'
import type { TechnicalFormValues, TechnicalResult } from '../types'

type PowerBalanceCardProps = {
  form: TechnicalFormValues
  result: TechnicalResult
  isCalculatedPowerOverridden: boolean
  onRestoreAutomaticCalculatedPower: () => void
  onUpdate: (field: keyof TechnicalFormValues, value: string) => void
  onUpdateCalculatedPower: (value: string) => void
}

export function PowerBalanceCard({
  form,
  result,
  isCalculatedPowerOverridden,
  onRestoreAutomaticCalculatedPower,
  onUpdate,
  onUpdateCalculatedPower,
}: PowerBalanceCardProps) {
  return (
    <SectionCard
      description="Parametry podstawowe do wyznaczenia prądu obliczeniowego."
      number="01"
      title="Bilans mocy rozdzielnicy"
    >
      <div className="mt-[15px] grid gap-[11px] md:grid-cols-3">
        <Field label="Rozdzielnica" onChange={(value) => onUpdate('name', value)} value={form.name} />
        <Field label="Pi · moc zainstalowana" onChange={(value) => onUpdate('installedPower', value)} unit="kW" value={form.installedPower} />
        <Field label="kj · współczynnik jednoczesności" onChange={(value) => onUpdate('simultaneityFactor', value)} value={form.simultaneityFactor} />
        <Field label="Ps · moc szczytowa" onChange={onUpdateCalculatedPower} unit="kW" value={form.calculatedPower} />
        <Field label="U · napięcie zasilania" onChange={(value) => onUpdate('voltage', value)} unit="V" value={form.voltage} />
        <Field label="cos φ · współczynnik mocy" onChange={(value) => onUpdate('powerFactor', value)} value={form.powerFactor} />
      </div>

      <div className="mt-3.5 flex items-center justify-between gap-2.5 border-l-[3px] border-[#22c5bd] bg-[#f7faf9] p-[10px_12px] text-[11px] text-[#63727a] max-md:flex-col max-md:items-start">
        <span>
          Ps = Pi × kj = <strong className="text-forest-600">{formatNumber(result.automaticCalculatedPower)} kW</strong>
        </span>
        {isCalculatedPowerOverridden ? (
          <button
            className="h-[30px] rounded-md bg-[#17202a] px-3 text-[11px] font-bold text-white hover:bg-[#243445]"
            onClick={onRestoreAutomaticCalculatedPower}
            type="button"
          >
            Przywróć automatyczne Ps
          </button>
        ) : (
          <span>Ps aktualizuje się automatycznie po zmianie Pi lub kj.</span>
        )}
      </div>

      {isCalculatedPowerOverridden && (
        <div className="mt-2.5 rounded-md border border-[#f2d7a9] bg-[#fff7ed] p-[9px_11px] text-[11px] text-[#8a5a16]">
          Ps zostało wpisane ręcznie, więc kj zaktualizowano do{' '}
          <strong className="text-[#6a410d]">{formatNumber(result.effectiveSimultaneityFactor, 3)}</strong>.
        </div>
      )}
    </SectionCard>
  )
}
