import { wlzCableOptions, wlzCableFamilies } from './cableData'
import { toNumber } from './format'
import type { CableRecommendation, TechnicalFormValues, TechnicalResult, WlzCableFamilyKey } from './types'

export function getAutomaticCalculatedPower(form: TechnicalFormValues) {
  return toNumber(form.installedPower) * toNumber(form.simultaneityFactor)
}

export function getCableCapacity(form: TechnicalFormValues) {
  if (toNumber(form.cableCores) !== 4) {
    return undefined
  }

  return wlzCableFamilies[form.cableType]?.rows.find((row) =>
    row.section === String(toNumber(form.cableCrossSection)),
  )?.capacity[form.installationMethod]
}

function getCableRecommendation(
  key: WlzCableFamilyKey,
  form: TechnicalFormValues,
  requiredCurrent: number,
): CableRecommendation {
  const family = wlzCableFamilies[key]
  const selected = family.rows.find((row) =>
    Number(row.section) >= family.minimumWlzSection
    && row.capacity[form.installationMethod] >= requiredCurrent,
  )
  const capacity = selected?.capacity[form.installationMethod]

  return {
    key,
    name: family.name,
    material: family.material,
    insulation: family.insulation,
    minimumWlzSection: family.minimumWlzSection,
    section: selected?.section,
    capacity,
    requiredCurrent,
    utilization: capacity ? requiredCurrent / capacity : 0,
    reserve: capacity ? capacity - requiredCurrent : undefined,
  }
}

export function getCableSections(type: WlzCableFamilyKey) {
  return wlzCableFamilies[type].rows.map((row) => row.section)
}

export function calculateTechnicalResult(form: TechnicalFormValues): TechnicalResult {
  const installedPower = toNumber(form.installedPower)
  const calculatedPower = toNumber(form.calculatedPower)
  const simultaneityFactor = toNumber(form.simultaneityFactor)
  const voltage = toNumber(form.voltage)
  const powerFactor = toNumber(form.powerFactor)
  const loadCurrent = toNumber(form.loadCurrent)
  const ratedCurrent = toNumber(form.ratedCurrent)
  const multiplicationFactor = toNumber(form.multiplicationFactor)
  const cableCapacity = getCableCapacity(form)
  const calculatedCurrent = calculatedPower > 0 && voltage > 0 && powerFactor > 0
    ? calculatedPower * 1000 / (Math.sqrt(3) * voltage * powerFactor)
    : 0
  const effectiveSimultaneityFactor = installedPower > 0 ? calculatedPower / installedPower : 0
  const i2 = multiplicationFactor * ratedCurrent
  const limit = cableCapacity ? 1.45 * cableCapacity : 0
  const requiredCableCurrent = Math.max(calculatedCurrent, ratedCurrent, i2 / 1.45)

  return {
    calculatedCurrent,
    effectiveSimultaneityFactor,
    automaticCalculatedPower: installedPower * simultaneityFactor,
    cableCapacity,
    i2,
    limit,
    conditionIbLeIz: Boolean(cableCapacity && loadCurrent > 0 && loadCurrent <= cableCapacity),
    conditionIbLeInLeIz: Boolean(cableCapacity && loadCurrent > 0 && loadCurrent <= ratedCurrent && ratedCurrent <= cableCapacity),
    conditionI2Le145Iz: Boolean(cableCapacity && i2 > 0 && i2 <= limit),
    requiredCableCurrent,
    recommendations: wlzCableOptions.map((family) =>
      getCableRecommendation(family.key, form, requiredCableCurrent),
    ),
  }
}
