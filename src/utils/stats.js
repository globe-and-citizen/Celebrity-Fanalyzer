export const formatStats = (stats, interval) => {
  const formattedStats = stats?.map((stat, index) => {
    const date = stat.date.toDate()
    const end = stats[index + 1]?.date.toDate() || date
    const label =
      end - date <= 86400000 ? `${date.getDate()}/${date.getMonth() + 1}` : `${date.getDate()}-${end.getDate()}/${end.getMonth() + 1}`
    return { ...stat, label }
  })

  formattedStats?.pop()
  return formattedStats
}

export const formatAllStats = (stats) => {
  return stats?.map((stat) => ({ ...stat, label: 'All' }))
}
