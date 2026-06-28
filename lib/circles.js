export const CIRCLE_TYPES = [
  { value: 'dating', label: 'Dating, Friend & Social', color: '#FF6B5A' },
  { value: 'business', label: 'Business & Jobs', color: '#2B2725' },
]

export const CAPACITY_MIN = 6
export const CAPACITY_MAX = 12
export const DEFAULT_CAPACITY = 12

export function getCircleType(value) {
  return CIRCLE_TYPES.find((type) => type.value === value) || CIRCLE_TYPES[0]
}
