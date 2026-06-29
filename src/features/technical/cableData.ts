import type { CableInstallationMethod, WlzCableFamilyKey } from './types'

export const installationMethodLabels: Record<CableInstallationMethod, string> = {
  ground: 'kabel ułożony w ziemi',
  air: 'kabel ułożony w powietrzu',
}

export type CableCapacityRow = {
  section: string
  capacity: Record<CableInstallationMethod, number>
}

export type WlzCableFamily = {
  key: WlzCableFamilyKey
  name: string
  material: string
  insulation: string
  minimumWlzSection: number
  source: string
  rows: CableCapacityRow[]
}

export const wlzCableFamilies: Record<WlzCableFamilyKey, WlzCableFamily> = {
  YKY: {
    key: 'YKY',
    name: 'YKY / YKYżo',
    material: 'miedź',
    insulation: 'PVC',
    minimumWlzSection: 10,
    source: 'NKT Datasheet YKY/YKYżo PL 12194',
    rows: [
      { section: '1.5', capacity: { air: 20, ground: 28 } },
      { section: '2.5', capacity: { air: 26, ground: 36 } },
      { section: '4', capacity: { air: 35, ground: 48 } },
      { section: '6', capacity: { air: 45, ground: 60 } },
      { section: '10', capacity: { air: 62, ground: 80 } },
      { section: '16', capacity: { air: 85, ground: 108 } },
      { section: '25', capacity: { air: 116, ground: 141 } },
      { section: '35', capacity: { air: 137, ground: 167 } },
      { section: '50', capacity: { air: 168, ground: 197 } },
      { section: '70', capacity: { air: 210, ground: 241 } },
      { section: '95', capacity: { air: 260, ground: 288 } },
      { section: '120', capacity: { air: 300, ground: 324 } },
      { section: '150', capacity: { air: 345, ground: 364 } },
      { section: '185', capacity: { air: 395, ground: 408 } },
      { section: '240', capacity: { air: 465, ground: 466 } },
    ],
  },
  YAKY: {
    key: 'YAKY',
    name: 'YAKY / YAKYżo',
    material: 'aluminium',
    insulation: 'PVC',
    minimumWlzSection: 16,
    source: 'NKT Datasheet YAKY/YAKYżo PL 10191',
    rows: [
      { section: '10', capacity: { air: 49, ground: 64 } },
      { section: '16', capacity: { air: 66, ground: 84 } },
      { section: '25', capacity: { air: 89, ground: 109 } },
      { section: '35', capacity: { air: 109, ground: 131 } },
      { section: '50', capacity: { air: 128, ground: 152 } },
      { section: '70', capacity: { air: 161, ground: 186 } },
      { section: '95', capacity: { air: 198, ground: 222 } },
      { section: '120', capacity: { air: 231, ground: 253 } },
      { section: '150', capacity: { air: 264, ground: 283 } },
      { section: '185', capacity: { air: 312, ground: 322 } },
      { section: '240', capacity: { air: 371, ground: 372 } },
      { section: '300', capacity: { air: 425, ground: 417 } },
    ],
  },
  YAKXS: {
    key: 'YAKXS',
    name: 'YAKXS / YAKXSżo',
    material: 'aluminium',
    insulation: 'XLPE',
    minimumWlzSection: 16,
    source: 'NKT Datasheet YAKXS/YAKXSżo PL 10198',
    rows: [
      { section: '16', capacity: { air: 82, ground: 97 } },
      { section: '25', capacity: { air: 110, ground: 126 } },
      { section: '35', capacity: { air: 134, ground: 150 } },
      { section: '50', capacity: { air: 160, ground: 177 } },
      { section: '70', capacity: { air: 202, ground: 217 } },
      { section: '95', capacity: { air: 249, ground: 258 } },
      { section: '120', capacity: { air: 290, ground: 294 } },
      { section: '150', capacity: { air: 335, ground: 330 } },
      { section: '185', capacity: { air: 387, ground: 373 } },
      { section: '240', capacity: { air: 460, ground: 430 } },
    ],
  },
}

export const wlzCableOptions = Object.values(wlzCableFamilies)
