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

/**
 * Group data by week.
 * @param {*} data = [
 *   { "6/22/2023": { "visitors": 1, "visits": 1 } },
 *   { "6/23/2023": { "visitors": 0, "visits": 0 } },
 *   { "6/24/2023": { "visitors": 0, "visits": 0 } },
 *   { "6/25/2023": { "visitors": 1, "visits": 2 } },
 *   { "6/26/2023": { "visitors": 0, "visits": 0 } },
 *   { "6/27/2023": { "visitors": 0, "visits": 0 } },
 *   { "6/28/2023": { "visitors": 0, "visits": 2 } },
 *   { "6/29/2023": { "visitors": 0, "visits": 1 } },
 *   { "6/30/2023": { "visitors": 0, "visits": 1 } },
 * ];
 * @returns [
 *   { '6/22-24': { visitors: 1, visits: 1 } },
 *   { '6/25-30': { visitors: 1, visits: 6 } }
 * ]
 */
export function groupInfoByWeek(data) {
  const groupedInfo = []
  let currentWeek = null

  for (const item of data) {
    const date = Object.keys(item)[0]
    const info = item[date]
    const keys = Object.keys(info)

    const currentDate = new Date(date)
    const currentDay = currentDate.getDay()

    if (currentDay === 0 || currentWeek === null) {
      currentWeek = {
        startDate: currentDate,
        endDate: currentDate,
        counts: {}
      }
      groupedInfo.push(currentWeek)
    } else {
      currentWeek.endDate = currentDate
    }

    for (const key of keys) {
      currentWeek.counts[key] = (currentWeek.counts[key] || 0) + info[key]
    }
  }

  return groupedInfo.map((week) => {
    const weekRange = `${week.startDate.getMonth() + 1}/${week.startDate.getDate()}-${week.endDate.getDate()}`
    return { [weekRange]: week.counts }
  })
}

export function groupInfoByMonth(info) {
  const groupedInfo = []
  let currentMonth = null

  for (const item of info) {
    const date = Object.keys(item)[0]
    const infoData = item[date]
    const keys = Object.keys(infoData)

    const currentDate = new Date(date)
    const currentMonthIndex = currentDate.getMonth()

    if (currentMonth === null || currentMonthIndex !== currentMonth.monthIndex) {
      currentMonth = {
        monthIndex: currentMonthIndex,
        startDate: currentDate,
        endDate: currentDate,
        counts: {}
      }
      groupedInfo.push(currentMonth)
    } else {
      currentMonth.endDate = currentDate
    }

    for (const key of keys) {
      currentMonth.counts[key] = (currentMonth.counts[key] || 0) + infoData[key]
    }
  }

  return groupedInfo.map((month) => {
    const monthRange = `${month.startDate.getMonth() + 1}/${month.startDate.getFullYear()}`
    return { [monthRange]: month.counts }
  })
}
