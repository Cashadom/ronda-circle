export function getCurrentWeekKey() {
  const now = new Date()
  const startOfYear = new Date(now.getFullYear(), 0, 1)
  const days = Math.floor((now - startOfYear) / (24 * 60 * 60 * 1000))
  const week = Math.ceil((days + startOfYear.getDay() + 1) / 7)
  return `${now.getFullYear()}-W${String(week).padStart(2, '0')}`
}

export function getWeekDisplay(weekKey) {
  const [year, week] = weekKey.split('-W')
  return `Week ${parseInt(week)} · ${year}`
}