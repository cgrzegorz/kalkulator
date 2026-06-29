export type CableInstallationMethod = 'ground' | 'air'
export type WlzCableFamilyKey = 'YKY' | 'YAKY' | 'YAKXS'

export type CableRecommendation = {
  key: WlzCableFamilyKey
  name: string
  material: string
  insulation: string
  minimumWlzSection: number
  section: string | undefined
  capacity: number | undefined
  requiredCurrent: number
  utilization: number
  reserve: number | undefined
}

export type TechnicalFormValues = {
  name: string
  installedPower: string
  simultaneityFactor: string
  calculatedPower: string
  voltage: string
  powerFactor: string
  loadCurrent: string
  ratedCurrent: string
  multiplicationFactor: string
  cableType: WlzCableFamilyKey
  cableCores: string
  cableCrossSection: string
  installationMethod: CableInstallationMethod
}

export type TechnicalResult = {
  calculatedCurrent: number
  effectiveSimultaneityFactor: number
  automaticCalculatedPower: number
  cableCapacity: number | undefined
  i2: number
  limit: number
  conditionIbLeIz: boolean
  conditionIbLeInLeIz: boolean
  conditionI2Le145Iz: boolean
  requiredCableCurrent: number
  recommendations: CableRecommendation[]
}
