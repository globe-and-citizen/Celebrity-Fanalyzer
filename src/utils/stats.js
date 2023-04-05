export const formatDayStats = (dayStats) => {
  const data = dayStats?.map((dayStat, index) => {
    let end
    let label
    const date = dayStat.date.toDate()

    if (index + 1 < dayStats.length) {
      end = dayStats[index + 1].date.toDate()
    } else {
      end = dayStats[index].date.toDate()
    }
    if (end - date <= 86400000) {
      label = `${date.getDate()}/${date.getMonth() + 1}`
    } else {
      label = `${date.getDate()}-${end.getDate()}/${end.getMonth() + 1}`
    }
    return { ...dayStat, label }
  })
  data?.pop()
  return data
}

export const formatWeekStats = (weekStats) => {
  const data = weekStats?.map((weekStat, index) => {
    let end
    let label
    const date = weekStat.date.toDate()

    if (index + 1 < weekStats.length) {
      end = weekStats[index + 1].date.toDate()
    } else {
      end = weekStats[index].date.toDate()
    }
    if (end - date <= 86400000) {
      let newDate = date
      newDate.setDate(date.getDate() + 7)
      label = `${weekStats[index].date.toDate().getDate()}-${newDate.getDate()}/${newDate.getMonth() + 1}`
    } else {
      label = `${date.getDate()}-${end.getDate()}/${end.getMonth() + 1}`
    }
    return { ...weekStat, label }
  })

  data?.pop()
  return data
}

export const formatAllStats = (allStats) => {
  return allStats?.map((weekStat) => {
    return { ...weekStat, label: 'All' }
  })
}
