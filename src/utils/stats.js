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
    const { visitors, visits } = item[date]

    const currentDate = new Date(date)
    const currentDay = currentDate.getDay()

    if (currentDay === 0 || currentWeek === null) {
      // If the current day is Sunday or there is no active week, create a new week with the current date as the start date.
      currentWeek = {
        startDate: currentDate,
        endDate: currentDate,
        visitors: 0,
        visits: 0
      }
      groupedInfo.push(currentWeek)
    } else {
      currentWeek.endDate = currentDate
    }

    currentWeek.visitors += visitors
    currentWeek.visits += visits
  }

  return groupedInfo.map((week) => {
    const weekRange = `${week.startDate.getMonth() + 1}/${week.startDate.getDate()}-${week.endDate.getDate()}`
    return {
      [weekRange]: {
        visitors: week.visitors,
        visits: week.visits
      }
    }
  })
}
