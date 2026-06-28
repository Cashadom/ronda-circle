export function getTrustLevel(score = 0) {
  if (score >= 90) {
    return {
      label: 'Legend',
      color: '#16A34A',
    }
  }

  if (score >= 70) {
    return {
      label: 'Trusted',
      color: '#2563EB',
    }
  }

  if (score >= 40) {
    return {
      label: 'Active',
      color: '#F59E0B',
    }
  }

  return {
    label: 'New member',
    color: '#9CA3AF',
  }
}